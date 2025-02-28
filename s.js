document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const studentNameInput = document.getElementById('studentName');
    const stageSelect = document.getElementById('stageSelect');
    const departmentSelect = document.getElementById('departmentSelect');
    const groupSelect = document.getElementById('groupSelect');
    const lessonNameInput = document.getElementById('lessonName');
    const studentTableBody = document.querySelector('#studentTable tbody');
    const searchInput = document.getElementById('searchInput');
    const lessonDisplay = document.getElementById('lessonDisplay');
    const lessonNameDisplay = document.getElementById('lessonNameDisplay');

    let currentLessonName = '';
    let lastAbsentClickTime = 0;

    function getCurrentStudents() {
        const stage = stageSelect.value;
        const department = departmentSelect.value;
        const group = groupSelect.value;
        const key = `students${stage}${department}${group}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    function saveCurrentStudents(students) {
        const stage = stageSelect.value;
        const department = departmentSelect.value;
        const group = groupSelect.value;
        const key = `students${stage}${department}${group}`;
        localStorage.setItem(key, JSON.stringify(students));
    }

    document.getElementById('searchInput').addEventListener('input', function() {
        const searchValue = this.value.toLowerCase();
        const rows = document.querySelectorAll('#studentTable tbody tr');
    
        rows.forEach(row => {
            const name = row.querySelector('td').textContent.toLowerCase();
            if (name.startsWith(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    
        const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
        const hiddenRows = Array.from(rows).filter(row => row.style.display === 'none');
    
        const tbody = document.querySelector('#studentTable tbody');
        tbody.innerHTML = '';
    
        visibleRows.forEach(row => tbody.appendChild(row));
        hiddenRows.forEach(row => tbody.appendChild(row));
    });

    function updateLessonDisplay(lessonName) {
        if (lessonName) {
            lessonNameDisplay.textContent = lessonName;
            lessonDisplay.style.display = 'block';
        } else {
            lessonDisplay.style.display = 'none';
        }
    }

    saveButton.addEventListener('click', function () {
        const name = studentNameInput.value;
        const stage = stageSelect.value;
        const department = departmentSelect.value;
        const group = groupSelect.value;

        if (!name) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'تکایە ناوی قوتابی بنووسە!',
            });
            return;
        }

        if (!currentLessonName) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'تکایە ناوی دەرس بنووسە!',
            });
            return;
        }

        const student = {
            name: name,
            department: department,
            group: group,
            lessonName: currentLessonName,
            absences: 0,
            absenceDates: []
        };

        const students = getCurrentStudents();
        students.push(student);
        saveCurrentStudents(students);
        renderTable();
        studentNameInput.value = '';
    });

    function renderTable() {
        const students = getCurrentStudents();
        studentTableBody.innerHTML = '';
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.department}</td>
                <td>${student.group}</td>
                <td>${student.absences}</td>
                <td>${student.absenceDates.join('<br>')}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="markAbsent(${index})">نەهاتن</button>
                    <button class="btn btn-success btn-sm" onclick="markPresent(${index})">هاتوو</button>
                    <i class="fas fa-trash-alt delete-icon" onclick="confirmDelete('${student.name}', ${index})"></i>
                </td>
            `;
            studentTableBody.appendChild(row);
        });
    }

    window.markAbsent = function (index) {
        const students = getCurrentStudents();
        const now = Date.now();

        if (now - lastAbsentClickTime < 500) {
            students[index].absences += 1;
            students[index].absenceDates.push('قوتابی بەڕێز لە محازەرەی 2 سعارتی نەهاتویت بۆیە 2 غیابت بۆ دەنوسرێت');
            saveCurrentStudents(students);
            renderTable();
            Swal.fire({
                icon: 'info',
                title: 'تێبینی',
                text: 'محازەرە 2 ساعاتی نەهاتویت، بۆیە 2 غیاب دەنوسرێت',
            });
        } else {
            if (students[index].absences >= 7) {
                Swal.fire({
                    icon: 'error',
                    title: 'هەڵە',
                    text: 'قوتابی ناتوانێت زیاتر لە 7 جار غیاب بکات!',
                });
                return;
            }

            const dateString = new Date().toLocaleString();
            students[index].absences++;
            students[index].absenceDates.push(dateString);
            saveCurrentStudents(students);
            renderTable();

            if (students[index].absences === 4) {
                Swal.fire({
                    icon: 'warning',
                    title: 'ئاگاداری',
                    text: 'ژمارەی غیابەکان زۆر بووە!',
                });
            }

            if (students[index].absences === 6) {
                Swal.fire({
                    icon: 'error',
                    title: 'کۆتایی هاتنەوە',
                    text: 'قوتابی بەڕێز، کۆتایت بۆ هاتۆتەوە!',
                });
            }
        }

        lastAbsentClickTime = now;
    };

    window.markPresent = function (index) {
        const students = getCurrentStudents();
        if (students[index].absences <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'قوتابی ناتوانێت کەمتر لە ٠ غیاب بکات!',
            });
            return;
        }

        students[index].absences--;
        
        if (students[index].absences === 0) {
            students[index].absenceDates = [];
        } else {
            students[index].absenceDates.pop();
        }

        saveCurrentStudents(students);
        renderTable();
    };

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
                students.splice(index, 1);
                saveCurrentStudents(students);
                renderTable();
                Swal.fire('سڕایەوە!', `قوتابی "${studentName}" سڕایەوە.`, 'success');
            }
        });
    };

    lessonNameInput.addEventListener('input', function () {
        currentLessonName = this.value;
        updateLessonDisplay(currentLessonName);
    });

    window.printTable = function () {
        window.print();
    };

    window.clearAllData = function () {
        Swal.fire({
            title: 'دڵنیایت؟',
            text: 'دڵنیایت دەتەوێت هەموو داتاکە بسڕیتەوە؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'بەڵێ، بسڕەوە',
            cancelButtonText: 'نەخێر'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                renderTable();
                Swal.fire('سڕایەوە!', 'هەموو داتاکە سڕایەوە.', 'success');
            }
        });
    };

    renderTable();

    stageSelect.addEventListener('change', renderTable);
    departmentSelect.addEventListener('change', renderTable);
    groupSelect.addEventListener('change', renderTable);
});