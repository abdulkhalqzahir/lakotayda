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

    let currentLessonName = ''; // ناوی دەرس لە یادگا دەهێڵرێتەوە
    let lastAbsentClickTime = 0; // کاتی دوایین کلیک لەسەر نەهاتن

    // فەرمان بۆ هێنانەوەی داتا لە Local Storage
    function getCurrentStudents() {
        const stage = stageSelect.value;
        const department = departmentSelect.value;
        const group = groupSelect.value;
        const key = `students${stage}${department}${group}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    // فەرمان بۆ هەڵگرتنی داتا لە Local Storage
    function saveCurrentStudents(students) {
        const stage = stageSelect.value;
        const department = departmentSelect.value;
        const group = groupSelect.value;
        const key = `students${stage}${department}${group}`;
        localStorage.setItem(key, JSON.stringify(students));
    }
    document.getElementById('searchInput').addEventListener('input', function() {
        const searchValue = this.value.toLowerCase(); // نرخی ئینپوتی گەڕان بە پیتی بچووک
        const rows = document.querySelectorAll('#studentTable tbody tr'); // هەموو ڕیزەکانی لیستی قوتابیان
    
        rows.forEach(row => {
            const name = row.querySelector('td').textContent.toLowerCase(); // ناوی قوتابی لە ڕیزەکە
            if (name.startsWith(searchValue)) {
                row.style.display = ''; // نیشاندانی ڕیزەکە ئەگەر ناوەکە دەستپێبکات بە نرخی گەڕان
            } else {
                row.style.display = 'none'; // شاردنەوەی ڕیزەکە ئەگەر ناوەکە نەگونجێت
            }
        });
    
        // ڕیزکردنی ڕیزەکان بەپێی ناوەکە
        const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
        const hiddenRows = Array.from(rows).filter(row => row.style.display === 'none');
    
        const tbody = document.querySelector('#studentTable tbody');
        tbody.innerHTML = ''; // پاککردنەوەی لیستەکە
    
        // زیادکردنی ڕیزەکانی نیشاندراوەکان بۆ سەرەتا
        visibleRows.forEach(row => tbody.appendChild(row));
        // زیادکردنی ڕیزەکانی شاردراوەکان بۆ دووا
        hiddenRows.forEach(row => tbody.appendChild(row));
    });
    // فەرمان بۆ دیارکردنی ناوی دەرس
    function updateLessonDisplay(lessonName) {
        if (lessonName) {
            lessonNameDisplay.textContent = lessonName;
            lessonDisplay.style.display = 'block';
        } else {
            lessonDisplay.style.display = 'none';
        }
    }

    // زیادکردنی قوتابی
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
            lessonName: currentLessonName, // ناوی دەرس لە یادگا دەهێڵرێتەوە
            absences: 0,
            absenceDates: []
        };

        const students = getCurrentStudents();
        students.push(student);
        saveCurrentStudents(students);
        renderTable();
        studentNameInput.value = '';
    });

    // نیشاندانی خشتەکە
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

    // زیادکردنی غیاب
    window.markAbsent = function (index) {
        const students = getCurrentStudents();
        const now = Date.now();

        // ئەگەر لە ماوەی ١ چرکەدا دووبارە کلیک کرابێت
        if (now - lastAbsentClickTime < 500) {
            students[index].absences += 1; // ٢ غیاب زیاد دەکەین
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

            // ئەگەر ژمارەی غیابەکان گەیشتە ٤، ئاگاداری بدە
            if (students[index].absences === 4) {
                Swal.fire({
                    icon: 'warning',
                    title: 'ئاگاداری',
                    text: 'ژمارەی غیابەکان زۆر بووە!',
                });
            }

            // ئەگەر ژمارەی غیابەکان گەیشتە ٦، کۆتایی هاتنەوە
            if (students[index].absences === 6) {
                Swal.fire({
                    icon: 'error',
                    title: 'کۆتایی هاتنەوە',
                    text: 'قوتابی بەڕێز، کۆتایت بۆ هاتۆتەوە!',
                });
            }
        }

        lastAbsentClickTime = now; // کاتی دوایین کلیک تۆمار دەکەین
    };

  
    // کەمکردنەوەی غیاب (هاتوو)
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
    
    // ئەگەر ژمارەی غیابەکان بوو بە سفر، مێژووی غیابەکان پاک بکەوە
    if (students[index].absences === 0) {
        students[index].absenceDates = []; // پاککردنەوەی لیستی مێژووی غیابەکان
    } else {
        students[index].absenceDates.pop(); // دوایین غیاب سڕینەوە
    }

    saveCurrentStudents(students);
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
                students.splice(index, 1);
                saveCurrentStudents(students);
                renderTable();
                Swal.fire('سڕایەوە!', `قوتابی "${studentName}" سڕایەوە.`, 'success');
            }
        });
    };

    // فەرمان بۆ گۆڕینی ناوی دەرس
    lessonNameInput.addEventListener('input', function () {
        currentLessonName = this.value; // ناوی دەرس لە یادگا دەهێڵرێتەوە
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

    // نیشاندانی خشتەکە لە سەرەتادا
    renderTable();

    // گۆڕینی قۆناغ، بەش و گروپ
    stageSelect.addEventListener('change', renderTable);
    departmentSelect.addEventListener('change', renderTable);
    groupSelect.addEventListener('change', renderTable);
});