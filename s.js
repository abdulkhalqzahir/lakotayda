document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const studentNameInput = document.getElementById('studentName');
    const stageSelect = document.getElementById('stageSelect');
    const departmentSelect = document.getElementById('departmentSelect');
    const groupSelect = document.getElementById('groupSelect');
    const studentTableBody = document.querySelector('#studentTable tbody');
    const searchInput = document.getElementById('searchInput');
    const selectedLessonDisplay = document.getElementById('selectedLessonDisplay');
    const selectedLessonName = document.getElementById('selectedLessonName');
    const lessonTableBody = document.querySelector('#lessonTable tbody');

    let currentLessonName = '';
    let lastAbsentClickTime = 0; // کاتی دوایین کلیکی نەهاتن

    // وەرگرتنی لیستی قوتابیان لە localStorage
    function getCurrentStudents() {
        const stage = stageSelect.value;
        const department = departmentSelect.value;
        const group = groupSelect.value;
        const key = `students${stage}${department}${group}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    // هەڵگرتنی لیستی قوتابیان لە localStorage
    function saveCurrentStudents(students) {
        const stage = stageSelect.value;
        const department = departmentSelect.value;
        const group = groupSelect.value;
        const key = `students${stage}${department}${group}`;
        localStorage.setItem(key, JSON.stringify(students));
    }

    // وەرگرتنی لیستی دەرسەکان لە localStorage
    function getLessons() {
        return JSON.parse(localStorage.getItem('lessons')) || [];
    }

    // هەڵگرتنی لیستی دەرسەکان لە localStorage
    function saveLessons(lessons) {
        localStorage.setItem('lessons', JSON.stringify(lessons));
    }

    // نیشاندانی لیستی دەرسەکان
    function renderLessonTable() {
        const lessons = getLessons();
        lessonTableBody.innerHTML = '';
        lessons.forEach((lesson, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lesson}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="selectLesson('${lesson}')">هەڵبژاردن</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteLesson(${index})">سڕینەوە</button>
                </td>
            `;
            lessonTableBody.appendChild(row);
        });
    }

    // زیادکردنی دەرس
    window.addLesson = function () {
        const lessonName = prompt("ناوی دەرسەکە بنووسە:");
        if (!lessonName) return;

        const lessons = getLessons();
        lessons.push(lessonName);
        saveLessons(lessons);
        renderLessonTable();
    };

    // هەڵبژاردنی دەرس
    window.selectLesson = function (lessonName) {
        currentLessonName = lessonName;
        selectedLessonName.textContent = lessonName;
        selectedLessonDisplay.style.display = 'block';
    };

    // سڕینەوەی دەرس
    window.deleteLesson = function (index) {
        Swal.fire({
            title: 'دڵنیایت؟',
            text: 'دڵنیایت دەتەوێت ئەم دەرسە بسڕیتەوە؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'بەڵێ، بسڕەوە',
            cancelButtonText: 'نەخێر'
        }).then((result) => {
            if (result.isConfirmed) {
                const lessons = getLessons();
                lessons.splice(index, 1);
                saveLessons(lessons);
                renderLessonTable();
                Swal.fire('سڕایەوە!', 'دەرسەکە سڕایەوە.', 'success');
            }
        });
    };

    // گەڕان بەدوای قوتابی
    searchInput.addEventListener('input', function () {
        const searchValue = this.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#studentTable tbody tr');

        rows.forEach(row => {
            const name = row.querySelector('td').textContent.toLowerCase();
            if (name.includes(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // تۆمارکردنی قوتابی
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
                text: 'تکایە دەرسێک هەڵبژێرە!',
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

    // نیشاندانی لیستی قوتابیان
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

    // نیشانەکردنی غیاب
    window.markAbsent = function (index) {
        const students = getCurrentStudents();
        const currentTime = new Date().getTime();

        // ئەگەر لە ماوەی ١ چرکە دوو جار کلیک کرابێت
        if (currentTime - lastAbsentClickTime < 1000) { // 1000ms = 1 چرکە
            const dateString = new Date().toLocaleString();
            students[index].absences += 2; // زیادکردنی ٢ غیاب
            students[index].absenceDates.push(`${dateString} (محازەرەی ٢ سەعاتی نەهاتوو)`);
            saveCurrentStudents(students);
            renderTable();

            Swal.fire({
                icon: 'info',
                title: 'تێبینی',
                text: 'بە دوو غیاب بۆت دەنوسرێت لەبەر ئەوەی محازەرەی دوو سەعاتی نەهاتوویت.',
            });
        } else {
            const dateString = new Date().toLocaleString();
            students[index].absences++;
            students[index].absenceDates.push(dateString);
            saveCurrentStudents(students);
            renderTable();
        }

        lastAbsentClickTime = currentTime; // نوێکردنەوەی کاتی دوایین کلیک

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
    };

    // نیشانەکردنی هاتوو
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

    // دڵنیاکردنەوە لەسڕینەوەی قوتابی
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

    // سڕینەوەی هەموو داتاکان
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
                renderLessonTable();
                Swal.fire('سڕایەوە!', 'هەموو داتاکە سڕایەوە.', 'success');
            }
        });
    };
 // فەنکشنی پرینتکردنی لیستی قوتابیان
 window.printStudentTable = function () {
    const stage = stageSelect.value;
    const department = departmentSelect.value;
    const group = groupSelect.value;
    const lessonName = currentLessonName;

    if (!lessonName) {
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: 'تکایە دەرسێک هەڵبژێرە!',
        });
        return;
    }

    const students = getCurrentStudents();
    const printContents = `
        <h2>لیستی قوتابیان</h2>
        <h3>قۆناغ: ${stage}، بەش: ${department}، گروپ: ${group}</h3>
        <h3>دەرس: ${lessonName}</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th>ناو</th>
                    <th>بەش</th>
                    <th>گروپ</th>
                    <th>ژمارەی غیاب</th>
                    <th>کاتی نەهاتنی قوتابی</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(student => `
                    <tr>
                        <td>${student.name}</td>
                        <td>${student.department}</td>
                        <td>${student.group}</td>
                        <td>${student.absences}</td>
                        <td>${student.absenceDates.join('<br>')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    location.reload(); // دووبارە کردنەوەی پەڕەکە بۆ گەڕاندنەوەی داتاکان
};


    // دەستپێکردنی پەڕەکە
    renderTable();
    renderLessonTable();

    // گۆڕانکاری لە هەڵبژاردنەکان
    stageSelect.addEventListener('change', renderTable);
    departmentSelect.addEventListener('change', renderTable);
    groupSelect.addEventListener('change', renderTable);
});