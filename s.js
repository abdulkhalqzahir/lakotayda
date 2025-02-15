document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const deleteButton = document.getElementById('deleteButton');
    const studentNameInput = document.getElementById('studentName');
    const studentImageInput = document.getElementById('studentImage');
    const stageSelect = document.getElementById('stageSelect');
    const groupSelect = document.getElementById('groupSelect');
    const studentTableBody = document.querySelector('#studentTable tbody');

    // هێنانەوەی داتا لە Local Storage
    let studentsData = getDataFromLocalStorage("studentsData") || [];

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

                studentsData.push(student);
                saveDataToLocalStorage("studentsData", studentsData); // هەڵگرتنی داتا
                renderTable();
                studentNameInput.value = '';
                studentImageInput.value = '';
            };
            reader.readAsDataURL(image);
        } else {
            alert('تکایە هەموو خانەکان پر بکەرەوە');
        }
    });

    // سڕینەوەی قوتابی
    deleteButton.addEventListener('click', function () {
        const selectedStudent = prompt('ناوی قوتابیەکە بنووسە بۆ سڕینەوە:');
        if (selectedStudent) {
            confirmDelete(selectedStudent);
        }
    });

    // نیشاندانی خشتەکە
    function renderTable() {
        studentTableBody.innerHTML = '';
        studentsData.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
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
        const now = new Date();
        const dateString = now.toLocaleString();
        studentsData[index].absences++;
        studentsData[index].absenceDates.push(dateString);
        saveDataToLocalStorage("studentsData", studentsData); // هەڵگرتنی داتا
        renderTable();

        if (studentsData[index].absences === 6) {
            Swal.fire({
                title: 'ئاگاداری!',
                html: `<b>${studentsData[index].name}</b> قوتابی بەڕێز، لەبەر ڕێژەی زۆری نەهاتنت، بۆ دەوام کۆتایت بۆ هاتنەوە.`,
                icon: 'warning',
                confirmButtonText: 'باشە',
            });
        }
    };

    // کەمکردنەوەی غیاب (هاتوو)
    window.markPresent = function (index) {
        if (studentsData[index].absences > 0) {
            studentsData[index].absences--;
            studentsData[index].absenceDates.pop();
            saveDataToLocalStorage("studentsData", studentsData); // هەڵگرتنی داتا
        }
        renderTable();
    };

    // دڵنیایی بۆ سڕینەوە
    window.confirmDelete = function (studentName) {
        Swal.fire({
            title: 'دڵنیایت؟',
            text: `دڵنیایت دەتەوێت قوتابی "${studentName}" بسڕیتەوە؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'بەڵێ، بسڕەوە',
            cancelButtonText: 'نەخێر'
        }).then((result) => {
            if (result.isConfirmed) {
                studentsData = studentsData.filter(student => student.name !== studentName);
                saveDataToLocalStorage("studentsData", studentsData); // هەڵگرتنی داتا
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
});