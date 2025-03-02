document.addEventListener('DOMContentLoaded', function () {
    const viewStudentsButton = document.getElementById('viewStudentsButton');
    const viewStageSelect = document.getElementById('viewStageSelect');
    const viewDepartmentSelect = document.getElementById('viewDepartmentSelect');
    const viewGroupSelect = document.getElementById('viewGroupSelect');
    const viewLessonNameInput = document.getElementById('viewLessonName');
    const viewStudentTableBody = document.querySelector('#viewStudentTable tbody');
    const viewStudentTableContainer = document.getElementById('viewStudentTableContainer');

    viewStudentsButton.addEventListener('click', function () {
        const stage = viewStageSelect.value;
        const department = viewDepartmentSelect.value;
        const group = viewGroupSelect.value;
        const lessonName = viewLessonNameInput.value;

        if (!lessonName) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'تکایە ناوی دەرس بنووسە!',
            });
            return;
        }

        const students = getStudentsByCriteria(stage, department, group, lessonName);
        renderViewStudentTable(students);
        viewStudentTableContainer.style.display = 'block';
    });

    function getStudentsByCriteria(stage, department, group, lessonName) {
        const key = `students${stage}${department}${group}`;
        const allStudents = JSON.parse(localStorage.getItem(key)) || [];
        return allStudents.filter(student => student.lessonName === lessonName);
    }

    function renderViewStudentTable(students) {
        viewStudentTableBody.innerHTML = '';
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.department}</td>
                <td>${student.group}</td>
                <td>${student.absences}</td>
                <td>${student.absenceDates.join('<br>')}</td>
            `;
            viewStudentTableBody.appendChild(row);
        });
    }
});