document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const deleteButton = document.getElementById('deleteButton');
    const studentNameInput = document.getElementById('studentName');
    const studentImageInput = document.getElementById('studentImage');
    const stageSelect = document.getElementById('stageSelect');
    const groupSelect = document.getElementById('groupSelect');
    const studentTableBody = document.querySelector('#studentTable tbody');

    // فەنکشن بۆ هێنانەوەی داتا لە Local Storage
    function getCurrentStudents() {
        const stage = stageSelect.value;
        const group = groupSelect.value;
        const key = `students${stage}${group}`;
        return getDataFromLocalStorage(key) || [];
    }

    // فەنکشن بۆ هەڵگرتنی داتا لە Local Storage
    function saveCurrentStudents(students) {
        const stage = stageSelect.value;
        const group = groupSelect.value;
        const key = `students${stage}${group}`;
        saveDataToLocalStorage(key, students);
    }

    // زیادکردنی قوتابی
    saveButton.addEventListener('click', function () {
        const name = studentNameInput.value;
        const image = studentImageInput.files[0];
        const stage = stageSelect.value;
        const group = groupSelect.value;

        if (name && image && group) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const student = {
                    name: name,
                    image: e.target.result,
                    group: group,
                    absences: 0,
                    absenceDates: []
                };

                const students = getCurrentStudents();
                students.push(student);
                saveCurrentStudents(students); // هەڵگرتنی داتا
                renderTable();
                studentNameInput.value = '';
                studentImageInput.value = '';
            };
            reader.readAsDataURL(image);
        } else {
            alert('تکایە هەموو خانەکان پر بکەرەوە');
        }
    });

    // نیشاندانی خشتەکە
    function renderTable() {
        const students = getCurrentStudents();
        studentTableBody.innerHTML = '';
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${student.name}
                    <i class="fas fa-trash-alt delete-icon" onclick="confirmDelete('${student.name}', ${index})"></i>
                </td>
                <td><img src="${student.image}" alt="${student.name}" class="img-thumbnail"></td>
                <td>${student.group}</td>
                <td>${student.absences}</td>
                <td>${student.absenceDates.join('<br>')}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="markAbsent(${index})">نەهاتن</button>
                    <button class="btn btn-success btn-sm" onclick="markPresent(${index})">هاتوو</button>
                </td>
            `;
            studentTableBody.appendChild(row);
        });
    }

    // زیادکردنی غیاب
    window.markAbsent = function (index) {
        const students = getCurrentStudents();
        const now = new Date();
        const dateString = now.toLocaleString();
        students[index].absences++;
        students[index].absenceDates.push(dateString);
        saveCurrentStudents(students); // هەڵگرتنی داتا
        renderTable();

        if (students[index].absences === 6) {
            Swal.fire({
                title: 'ئاگاداری!',
                html: `<b>${students[index].name}</b> قوتابی بەڕێز، لەبەر ڕێژەی زۆری نەهاتنت، بۆ دەوام کۆتایت بۆ هاتنەوە.`,
                icon: 'warning',
                confirmButtonText: 'باشە',
            });
        }
    };

    // کەمکردنەوەی غیاب (هاتوو)
    window.markPresent = function (index) {
        const students = getCurrentStudents();
        if (students[index].absences > 0) {
            students[index].absences--;
            students[index].absenceDates.pop();
            saveCurrentStudents(students); // هەڵگرتنی داتا
        }
        renderTable();
    };

    // دڵنیایی بۆ سڕینەوە
    window.confirmDelete = function (studentName, index) {
        Swal.fire({
            title: 'دڵنیایت؟',
            text: `دڵنیایت دەتەوێت قوتابی "${studentName}" بسڕیتەوە؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'بەڵێ، بسڕەوە',
            cancelButtonText: 'نەخێر'
        }).then((result) => {
            if (result.isConfirmed) {
                let students = getCurrentStudents();
                students.splice(index, 1); // سڕینەوەی قوتابی لە لیستەکە
                saveCurrentStudents(students); // هەڵگرتنی داتا
                renderTable();
                Swal.fire('سڕایەوە!', `قوتابی "${studentName}" سڕایەوە.`, 'success');
            }
        });
    };

    // فەنکشنەکانی Local Storage
    function saveDataToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getDataFromLocalStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // نیشاندانی خشتەکە لە سەرەتادا
    renderTable();

    // گۆڕینی قۆناغ و گروپ
    stageSelect.addEventListener('change', renderTable);
    groupSelect.addEventListener('change', renderTable);
});