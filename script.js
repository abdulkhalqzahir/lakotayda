// ناونیشانی سەرڤەر
const SERVER_URL = 'http://localhost:3000';
let connectionStatus = false;
let currentStudentIndex = -1;
let currentLessonName = '';
let lastAbsentClickTime = 0;

// لیستی یوزەرەکان (لە فایلەوە دەهێنرێتەوە)
let users = [];

// پێرستی بەشەکان بەپێی کۆلێژ (تەنها کۆلێژی کارگێری و ئابووری ماوەتەوە)
const collegeDepartments = {
    "کارگێری و ئابووری": ["ژمێریاری", "ئامار", "ئابوری", "کارگێڕی کار", "دارای بانک", "بازاڕگەری"]
};

// فەنکشنی خوێندنەوەی فایلی یوزەرەکان
async function loadUsersFromFile() {
    try {
        // داتای بنەڕەتی یوزەرەکان
        const defaultUsers = [
            {
                "id": 1,
                "username": "admin",
                "password": "admin123",
                "name": "مامۆستای بەڕێز",
                "email": "admin@college.edu.krd"
            },
            {
                "id": 2,
                "username": "karzan",
                "password": "karzan2024",
                "name": "دکتۆر کارزان ئامۆزا",
                "email": "karzan@college.edu.krd"
            },
            {
                "id": 3,
                "username": "abdulkhaliq",
                "password": "abdul123",
                "name": "عبدالخالق خۆشناو",
                "email": "abdulkhaliq@college.edu.krd"
            },
            {
                "id": 4,
                "username": "shwan",
                "password": "shwan456",
                "name": "شوان محەممەد",
                "email": "shwan@college.edu.krd"
            },
            {
                "id": 5,
                "username": "sara",
                "password": "sara789",
                "name": "سارا عەلی",
                "email": "sara@college.edu.krd"
            }
        ];
        
        users = defaultUsers;
        console.log('یوزەرەکان بە سەرکەوتوویی بارکران');
        return users;
    } catch (error) {
        console.error('هەڵە لە خوێندنەوەی فایلی یوزەرەکان: ', error);
        
        // داتای پاشەکەوت لە localStorage
        const backupUsers = localStorage.getItem('backupUsers');
        if (backupUsers) {
            users = JSON.parse(backupUsers);
        } else {
            // داتای بنەڕەتی ئەگەر هیچ فایلێک بوونی نەبوو
            users = [
                {
                    "id": 1,
                    "username": "admin",
                    "password": "admin123",
                    "name": "مامۆستای بەڕێز",
                    "email": "admin@college.edu.krd"
                }
            ];
            localStorage.setItem('backupUsers', JSON.stringify(users));
        }
        
        return users;
    }
}

// فەنکشنی چوونەژوورەوە لە فایلەوە
async function loginUser(username, password) {
    try {
        // یەکەم هەوڵ بدە لە سەرڤەرەوە بچیتەژوورەوە
        if (connectionStatus) {
            const response = await fetch(`${SERVER_URL}/api/teachers/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const result = await response.json();
                return result;
            }
        }
        
        // ئەگەر سەرڤەر نییە، لە فایلە ناوخۆییەکەوە پشکنین بکە
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            return {
                success: true,
                teacherName: user.name,
                message: 'چوونەژوورەوە سەرکەوتووبوو'
            };
        } else {
            throw new Error('ناوی بەکارهێنەر یان وشەی نهێنی هەڵەە');
        }
    } catch (error) {
        console.error('هەڵە لە چوونەژوورەوە: ', error);
        throw error;
    }
}

// فەنکشنی پشکنینی چوونەژوورەوە
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const teacherName = localStorage.getItem('teacherName');
    
    if (isLoggedIn === 'true' && teacherName) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('teacherNameDisplay').textContent = teacherName;
    }
}

// فەنکشنی چوونەدەرەوە
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('teacherName');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// پشکنینی پەیوەندی بە سەرڤەرەوە
async function checkServerConnection() {
    try {
        const response = await fetch(`${SERVER_URL}/api/status`);
        if (response.ok) {
            connectionStatus = true;
            document.getElementById('connectionStatus').className = 'connection-status status-connected';
            document.getElementById('connectionStatus').innerHTML = '<i class="fas fa-plug status-icon"></i> پەیوەندی بە سەرڤەرەوە دروستکراوە';
            return true;
        } else {
            throw new Error('پەیوەندی دروستنەکراوە');
        }
    } catch (error) {
        connectionStatus = false;
        document.getElementById('connectionStatus').className = 'connection-status status-disconnected';
        document.getElementById('connectionStatus').innerHTML = '<i class="fas fa-plug status-icon"></i> پەیوەندی بە سەرڤەرەوە نیە';
        console.error('هەڵە لە پەیوەندی بە سەرڤەرەوە: ', error);
        
        // نمایشی ئاگاداری
        Swal.fire({
            icon: 'warning',
            title: 'ئاگاداری',
            text: 'پەیوەندی بە سەرڤەرەوە دروستنەکراوە. داتاکان لە localStorageدا دەخرێنەوە.',
            timer: 3000,
            showConfirmButton: false
        });
        
        return false;
    }
}

// وەرگرتنی لیستی قوتابیان لە سەرڤەر یان localStorage
async function getCurrentStudents() {
    const college = document.getElementById('collegeSelect').value;
    const stage = document.getElementById('stageSelect').value;
    const department = document.getElementById('departmentSelect').value;
    const group = document.getElementById('groupSelect').value;
    
    if (connectionStatus) {
        try {
            const response = await fetch(`${SERVER_URL}/api/students?college=${college}&stage=${stage}&department=${department}&group=${group}`);
            if (!response.ok) throw new Error('هەڵە لە وەرگرتنی قوتابیان');
            return await response.json();
        } catch (error) {
            console.error('هەڵە: ', error);
            connectionStatus = false;
            checkServerConnection();
            return getFromLocalStorage();
        }
    } else {
        return getFromLocalStorage();
    }
}

// وەرگرتنی لیستی قوتابیان لە localStorage
function getFromLocalStorage() {
    const college = document.getElementById('collegeSelect').value;
    const stage = document.getElementById('stageSelect').value;
    const department = document.getElementById('departmentSelect').value;
    const group = document.getElementById('groupSelect').value;
    const key = `students_${college}_${stage}_${department}_${group}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// هەڵگرتنی لیستی قوتابیان لە سەرڤەر یان localStorage
async function saveStudent(student) {
    if (connectionStatus) {
        try {
            const response = await fetch(`${SERVER_URL}/api/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(student)
            });
            
            if (!response.ok) throw new Error('هەڵە لە تۆمارکردنی قوتابی');
            return await response.json();
        } catch (error) {
            console.error('هەڵە: ', error);
            connectionStatus = false;
            checkServerConnection();
            return saveToLocalStorage(student);
        }
    } else {
        return saveToLocalStorage(student);
    }
}

// هەڵگرتنی لیستی قوتابیان لە localStorage
function saveToLocalStorage(student) {
    const college = document.getElementById('collegeSelect').value;
    const stage = document.getElementById('stageSelect').value;
    const department = document.getElementById('departmentSelect').value;
    const group = document.getElementById('groupSelect').value;
    const key = `students_${college}_${stage}_${department}_${group}`;
    
    const students = getFromLocalStorage();
    students.push(student);
    localStorage.setItem(key, JSON.stringify(students));
    
    return { success: true, message: 'قوتابی بە سەرکەوتوویی تۆمارکرا' };
}

// وەرگرتنی لیستی دەرسەکان لە سەرڤەر یان localStorage
async function getLessons() {
    if (connectionStatus) {
        try {
            const response = await fetch(`${SERVER_URL}/api/lessons`);
            if (!response.ok) throw new Error('هەڵە لە وەرگرتنی دەرسەکان');
            return await response.json();
        } catch (error) {
            console.error('هەڵە: ', error);
            connectionStatus = false;
            checkServerConnection();
            return getLessonsFromLocalStorage();
        }
    } else {
        return getLessonsFromLocalStorage();
    }
}

// وەرگرتنی لیستی دەرسەکان لە localStorage
function getLessonsFromLocalStorage() {
    const data = localStorage.getItem('lessons');
    return data ? JSON.parse(data) : [];
}

// هەڵگرتنی لیستی دەرسەکان لە سەرڤەر یان localStorage
async function saveLesson(lessonName) {
    if (connectionStatus) {
        try {
            const response = await fetch(`${SERVER_URL}/api/lessons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: lessonName })
            });
            
            if (!response.ok) throw new Error('هەڵە لە تۆمارکردنی دەرس');
            return await response.json();
        } catch (error) {
            console.error('هەڵە: ', error);
            connectionStatus = false;
            checkServerConnection();
            return saveLessonToLocalStorage(lessonName);
        }
    } else {
        return saveLessonToLocalStorage(lessonName);
    }
}

// هەڵگرتنی لیستی دەرسەکان لە localStorage
function saveLessonToLocalStorage(lessonName) {
    const lessons = getLessonsFromLocalStorage();
    lessons.push(lessonName);
    localStorage.setItem('lessons', JSON.stringify(lessons));
    
    return { success: true, message: 'دەرس بە سەرکەوتوویی تۆمارکرا' };
}

// سڕینەوەی دەرس لە سەرڤەر یان localStorage
async function deleteLessonFromServer(lessonName) {
    if (connectionStatus) {
        try {
            const response = await fetch(`${SERVER_URL}/api/lessons/${encodeURIComponent(lessonName)}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('هەڵە لە سڕینەوەی دەرس');
            return await response.json();
        } catch (error) {
            console.error('هەڵە: ', error);
            connectionStatus = false;
            checkServerConnection();
            return deleteLessonFromLocalStorage(lessonName);
        }
    } else {
        return deleteLessonFromLocalStorage(lessonName);
    }
}

// سڕینەوەی دەرس لە localStorage
function deleteLessonFromLocalStorage(lessonName) {
    const lessons = getLessonsFromLocalStorage();
    const index = lessons.indexOf(lessonName);
    if (index > -1) {
        lessons.splice(index, 1);
        localStorage.setItem('lessons', JSON.stringify(lessons));
    }
    
    // سڕینەوەی غیابەکانی ئەم دەرسە لە هەموو قوتابیان
    const allStudents = getAllStudentsFromLocalStorage();
    for (const key in allStudents) {
        if (allStudents.hasOwnProperty(key)) {
            const students = allStudents[key];
            students.forEach(student => {
                if (student.absences && student.absences[lessonName]) {
                    delete student.absences[lessonName];
                }
            });
            localStorage.setItem(key, JSON.stringify(students));
        }
    }
    
    return { success: true, message: 'دەرس بە سەرکەوتوویی سڕدرایەوە' };
}

// وەرگرتنی هەموو قوتابیان لە localStorage
function getAllStudentsFromLocalStorage() {
    const allStudents = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('students_')) {
            allStudents[key] = JSON.parse(localStorage.getItem(key));
        }
    }
    return allStudents;
}

// زیادکردنی غیاب لە سەرڤەر یان localStorage
async function addAbsenceToServer(studentId, lesson, note) {
    if (connectionStatus) {
        try {
            const response = await fetch(`${SERVER_URL}/api/absences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: studentId,
                    lesson: lesson,
                    note: note || ''
                })
            });
            
            if (!response.ok) throw new Error('هەڵە لە تۆمارکردنی غیاب');
            return await response.json();
        } catch (error) {
            console.error('هەڵە: ', error);
            connectionStatus = false;
            checkServerConnection();
            return addAbsenceToLocalStorage(studentId, lesson, note);
        }
    } else {
        return addAbsenceToLocalStorage(studentId, lesson, note);
    }
}

// زیادکردنی غیاب لە localStorage
function addAbsenceToLocalStorage(studentIndex, lesson, note) {
    const students = getFromLocalStorage();
    const student = students[studentIndex];
    
    if (!student.absences) {
        student.absences = {};
    }
    
    if (!student.absences[lesson]) {
        student.absences[lesson] = { count: 0, notes: [] };
    }
    
    student.absences[lesson].count++;
    
    if (note) {
        const noteDate = new Date().toLocaleString('ku');
        student.absences[lesson].notes.push({
            text: note,
            date: noteDate
        });
    }
    
    const college = document.getElementById('collegeSelect').value;
    const stage = document.getElementById('stageSelect').value;
    const department = document.getElementById('departmentSelect').value;
    const group = document.getElementById('groupSelect').value;
    const key = `students_${college}_${stage}_${department}_${group}`;
    localStorage.setItem(key, JSON.stringify(students));
    
    return { success: true, message: 'غیاب بە سەرکەوتوویی تۆمارکرا' };
}

// نیشاندانی لیستی دەرسەکان
async function renderLessonTable() {
    const lessons = await getLessons();
    const lessonTableBody = document.querySelector('#lessonTable tbody');
    lessonTableBody.innerHTML = '';
    
    if (lessons.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="3" class="text-center">هیچ دەرسێک تۆمارنەکراوە</td>
        `;
        lessonTableBody.appendChild(row);
        return;
    }
    
    const students = await getCurrentStudents();
    
    lessons.forEach((lesson, index) => {
        // ژمارەی قوتابیە غایبەکان بۆ هەر دەرسێک
        let absentCount = 0;
        students.forEach(student => {
            if (student.absences && student.absences[lesson] && student.absences[lesson].count > 0) {
                absentCount++;
            }
        });
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${lesson}</td>
            <td><span class="absence-badge">${absentCount} قوتابی</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="selectLesson('${lesson}')">هەڵبژاردن</button>
                <button class="btn btn-danger btn-sm" onclick="deleteLesson(${index}, '${lesson}')">سڕینەوە</button>
            </td>
        `;
        lessonTableBody.appendChild(row);
    });
}

// زیادکردنی دەرس
async function addLesson() {
    const lessonName = prompt("ناوی دەرسەکە بنووسە:");
    if (!lessonName || lessonName.trim() === '') return;

    const lessons = await getLessons();
    if (lessons.includes(lessonName)) {
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: 'ئەم دەرسە پێشتر تۆمارکراوە!',
        });
        return;
    }

    const result = await saveLesson(lessonName);
    if (result.success) {
        await renderLessonTable();
        
        // ئەگەر هیچ دەرسێک هەڵنەبژێردرابوو، ئەوا ئەم دەرسە هەڵبژێرە
        if (currentLessonName === '') {
            selectLesson(lessonName);
        }
        
        Swal.fire({
            icon: 'success',
            title: 'سەرکەوتووبوو',
            text: result.message,
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: result.message,
        });
    }
}

// هەڵبژاردنی دەرس
function selectLesson(lessonName) {
    currentLessonName = lessonName;
    document.getElementById('currentLessonSpan').textContent = lessonName;
    document.getElementById('currentLessonSpan').classList.remove('no-lesson');
    renderTable();
}

// سڕینەوەی دەرس
async function deleteLesson(index, lessonName) {
    Swal.fire({
        title: 'دڵنیایت؟',
        text: 'دڵنیایت دەتەوێت ئەم دەرسە بسڕیتەوە؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'بەڵێ، بسڕەوە',
        cancelButtonText: 'نەخێر'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const result = await deleteLessonFromServer(lessonName);
            if (result.success) {
                // ئەگەر دەرسی سڕاوەکە هەر هەڵبژێردراو بوو، ئەوا هیچ دەرسێک هەڵمەبژێرە
                if (currentLessonName === lessonName) {
                    currentLessonName = '';
                    document.getElementById('currentLessonSpan').textContent = 'هیچ دەرسێک هەڵنەبژێردراوە';
                    document.getElementById('currentLessonSpan').classList.add('no-lesson');
                }
                
                await renderLessonTable();
                await renderTable();
                
                Swal.fire({
                    icon: 'success',
                    title: 'سەرکەوتووبوو',
                    text: result.message,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'هەڵە',
                    text: result.message,
                });
            }
        }
    });
}

// پشکنینی ئیمەیڵ
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// نیشاندانی لیستی قوتابیان
async function renderTable() {
    let students = await getCurrentStudents();
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const studentTableBody = document.querySelector('#studentTable tbody');
    
    // گەڕان بە ناو یان ئیمەیڵ
    if (searchTerm) {
        students = students.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
    }
    
    studentTableBody.innerHTML = '';
    
    if (students.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" class="text-center">هیچ قوتابیەک تۆمارنەکراوە</td>
        `;
        studentTableBody.appendChild(row);
        return;
    }
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        
        // ژمارەی غیابەکان بۆ دەرسی هەڵبژێردراو
        let absenceCount = 0;
        let absenceNotes = [];
        
        if (currentLessonName && student.absences && student.absences[currentLessonName]) {
            absenceCount = student.absences[currentLessonName].count || 0;
            absenceNotes = student.absences[currentLessonName].notes || [];
        }
        
        // دیاریکردنی ڕەنگی غیابەکان
        let badgeClass = 'absence-badge';
        if (absenceCount >= 7) {
            badgeClass += ' absence-max';
        } else if (absenceCount >= 5) {
            badgeClass += ' absence-danger';
        } else if (absenceCount >= 3) {
            badgeClass += ' absence-warning';
        }
        
        // دروستکردنی نمایشی تێبینییەکان
        let notesDisplay = 'کەمتر لە ٣ غیاب';
        if (absenceCount >= 3) {
            notesDisplay = absenceNotes.length > 0 ? 
                `${absenceNotes.length} تێبینی` : 'هیچ تێبینیەک نیە';
        }
        
        row.innerHTML = `
            <td>${student.name}</td>
            <td class="email-cell">
                <i class="fas fa-envelope email-icon" onclick="sendEmailNotification('${student.email}', '${student.name}', ${absenceCount})"></i>
                <i class="fas fa-edit edit-email-icon" onclick="editStudentEmail(${index}, '${student.email}')"></i>
                ${student.email}
            </td>
            <td>${student.college}</td>
            <td>${student.department}</td>
            <td>${student.group}</td>
            <td>
                <span class="${badgeClass}">${absenceCount} غیاب</span>
            </td>
            <td class="absence-notes">
                ${notesDisplay}
                ${absenceNotes.length > 0 ? `
                    <div class="notes-toggle" onclick="toggleNotes(this)">(بینین)</div>
                    <div class="notes-container" style="display: none;">
                        ${absenceNotes.map(note => `
                            <div class="note-item">
                                <div class="note-date">${note.date}</div>
                                <div>${note.text}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </td>
            <td>
                <button class="btn btn-primary btn-sm btn-action" onclick="addAbsence(${index})"><i class="fas fa-user-minus"></i> غیاب</button>
                <button class="btn btn-warning btn-sm btn-action" onclick="removeAbsence(${index})"><i class="fas fa-user-plus"></i> لابردنی غیاب</button>
                <button class="btn btn-danger btn-sm btn-action" onclick="deleteStudent(${index})"><i class="fas fa-trash-alt"></i> سڕینەوە</button>
            </td>
        `;
        studentTableBody.appendChild(row);
    });
}
//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
// ناردنی ئاگاداری بە ئیمەیڵ
function sendEmailNotification(email, name, absenceCount) {
    let subject, body;
    
    if (absenceCount >= 7) {
        subject = `ئاگاداری کۆتایی - ${name}`;
        body = `قوتابی بەڕێز ${name}، بەهۆی پابەند نەبونت بە کاتی دەرسەکە چیتر ناتوانیت ئامادەبیت. ژمارەی غیابەکان: ${absenceCount}`;
    } else if (absenceCount >= 5) {
        subject = `ئاگاداری دووەم - ${name}`;
        body = `قوتابی بەڕێز ${name}، ژمارەی غیابەکانت گەیشتووەتە ${absenceCount}. ئەگەر ژمارەی غیابەکان زیاتر بێت، کۆتایی بە خوێندن دێت.`;
    } else if (absenceCount >= 3) {
        subject = `ئاگاداری یەکەم - ${name}`;
        body = `قوتابی بەڕێز ${name}، ژمارەی غیابەکانت گەیشتووەتە ${absenceCount}. تکایە پابەند بە کاتی دەرسەکە بە.`;
    } else {
        subject = `زانیاری غیاب - ${name}`;
        body = `قوتابی بەڕێز ${name}، ژمارەی غیابەکانت ${absenceCount}ە.`;
    }
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    window.open(`mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`, '_blank');
}

// نیشاندانی/شاردنەوەی تێبینییەکان
function toggleNotes(element) {
    const notesContainer = element.nextElementSibling;
    if (notesContainer.style.display === 'none') {
        notesContainer.style.display = 'block';
        element.textContent = '(شاردنەوە)';
    } else {
        notesContainer.style.display = 'none';
        element.textContent = '(بینین)';
    }
}

// دەستکاریکردنی ئیمەیڵ
function editStudentEmail(index, currentEmail) {
    currentStudentIndex = index;
    document.getElementById('currentEmail').value = currentEmail;
    document.getElementById('newEmail').value = currentEmail;
    $('#editEmailModal').modal('show');
}

// زیادکردنی غیاب
async function addAbsence(index) {
    if (!currentLessonName) {
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: 'تکایە یەکەم دەرسێک هەڵبژێرە!',
        });
        return;
    }
    
    const currentTime = new Date().getTime();
    if (currentTime - lastAbsentClickTime < 1000) {
        return; // ڕێگەنەگرە لە ماوەی 1 چرکە زیاتر لە جارێک فشاربدرێت
    }
    lastAbsentClickTime = currentTime;
    
    const students = await getCurrentStudents();
    const student = students[index];
    const studentId = student.id || index; // لە کاتی بەکارهێنانی سەرڤەر، IDی قوتابی بەکار دەهێنین
    
    let noteText = '';
    const absenceCount = student.absences && student.absences[currentLessonName] 
        ? student.absences[currentLessonName].count + 1 
        : 1;
    
    // زیادکردنی تێبینی بەپێی ژمارەی غیاب
    if (absenceCount === 3 || absenceCount === 5 || absenceCount === 7) {
        const { value } = await Swal.fire({
            icon: absenceCount >= 7 ? 'error' : 'warning',
            title: `ئاگاداری ${absenceCount === 3 ? 'یەکەم' : absenceCount === 5 ? 'دووەم' : 'کۆتایی'}`,
            html: `قوتابی <strong>${student.name}</strong> گەیشتووەتە <strong>${absenceCount} غیاب</strong> لە دەرسی <strong>${currentLessonName}</strong>!<br><br>
            <textarea id="warningNote" class="form-control" rows="3" placeholder="تێبینی بنووسە..."></textarea>`,
            showCancelButton: true,
            confirmButtonText: 'هەڵگرتنی تێبینی',
            cancelButtonText: 'پاشخست',
            preConfirm: () => {
                return {
                    note: document.getElementById('warningNote').value
                };
            }
        });
        
        if (value && value.note) {
            noteText = value.note;
        }
    }
    
    const result = await addAbsenceToServer(studentId, currentLessonName, noteText);
    if (result.success) {
        await renderTable();
        await renderLessonTable();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: result.message,
        });
    }
}

// لابردنی غیاب
async function removeAbsence(index) {
    if (!currentLessonName) {
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: 'تکایە یەکەم دەرسێک هەڵبژێرە!',
        });
        return;
    }
    
    const students = await getCurrentStudents();
    const student = students[index];
    
    if (!student.absences || !student.absences[currentLessonName] || student.absences[currentLessonName].count <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: 'ئەم قوتابیە هیچ غیابێکی نیە لەم دەرسەدا!',
        });
        return;
    }
    
    // لابردنی غیاب لە localStorage
    student.absences[currentLessonName].count--;
    
    const college = document.getElementById('collegeSelect').value;
    const stage = document.getElementById('stageSelect').value;
    const department = document.getElementById('departmentSelect').value;
    const group = document.getElementById('groupSelect').value;
    const key = `students_${college}_${stage}_${department}_${group}`;
    localStorage.setItem(key, JSON.stringify(students));
    
    await renderTable();
    await renderLessonTable();
}

// سڕینەوەی قوتابی
async function deleteStudent(index) {
    Swal.fire({
        title: 'دڵنیایت؟',
        text: 'دڵنیایت دەتەوێت ئەم قوتابیە بسڕیتەوە؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'بەڵێ، بسڕەوە',
        cancelButtonText: 'نەخێر'
    }).then(async (result) => {
        if (result.isConfirmed) {
            if (connectionStatus) {
                try {
                    const students = await getCurrentStudents();
                    const student = students[index];
                    
                    const response = await fetch(`${SERVER_URL}/api/students/${student.id}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) throw new Error('هەڵە لە سڕینەوەی قوتابی');
                    
                    await renderTable();
                    await renderLessonTable();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'سڕایەوە',
                        text: 'قوتابیەکە بە سەرکەوتوویی سڕدرایەوە.',
                    });
                } catch (error) {
                    console.error('هەڵە: ', error);
                    connectionStatus = false;
                    checkServerConnection();
                    
                    // سڕینەوەی قوتابی لە localStorage
                    const students = await getCurrentStudents();
                    students.splice(index, 1);
                    const college = document.getElementById('collegeSelect').value;
                    const stage = document.getElementById('stageSelect').value;
                    const department = document.getElementById('departmentSelect').value;
                    const group = document.getElementById('groupSelect').value;
                    const key = `students_${college}_${stage}_${department}_${group}`;
                    localStorage.setItem(key, JSON.stringify(students));
                    
                    await renderTable();
                    await renderLessonTable();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'سڕایەوە',
                        text: 'قوتابیەکە بە سەرکەوتوویی سڕدرایەوە.',
                    });
                }
            } else {
                // سڕینەوەی قوتابی لە localStorage
                const students = await getCurrentStudents();
                students.splice(index, 1);
                const college = document.getElementById('collegeSelect').value;
                const stage = document.getElementById('stageSelect').value;
                const department = document.getElementById('departmentSelect').value;
                const group = document.getElementById('groupSelect').value;
                const key = `students_${college}_${stage}_${department}_${group}`;
                localStorage.setItem(key, JSON.stringify(students));
                
                await renderTable();
                await renderLessonTable();
                
                Swal.fire({
                    icon: 'success',
                    title: 'سڕایەوە',
                    text: 'قوتابیەکە بە سەرکەوتوویی سڕدرایەوە.',
                });
            }
        }
    });
}

// سڕینەوەی هەموو داتاکان
async function clearAllData() {
    Swal.fire({
        title: 'دڵنیایت؟',
        text: 'ئەم کارە هەموو داتاکان دەسڕێتەوە و ناتوانیت بیانگەڕێنیتەوە!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'بەڵێ، هەموو داتاکان بسڕەوە',
        cancelButtonText: 'نەخێر'
    }).then(async (result) => {
        if (result.isConfirmed) {
            if (connectionStatus) {
                try {
                    Swal.fire({
                        icon: 'warning',
                        title: 'ئاگاداری',
                        text: 'ناسڕینەوەی هەموو داتاکان لە سەرڤەر پێویستی بە APIی تایبەت هەیە.',
                    });
                } catch (error) {
                    console.error('هەڵە: ', error);
                }
            }
            
            // سڕینەوەی هەموو داتاکان لە localStorage
            localStorage.clear();
            await renderTable();
            await renderLessonTable();
            currentLessonName = '';
            document.getElementById('currentLessonSpan').textContent = 'هیچ دەرسێک هەڵنەبژێردراوە';
            document.getElementById('currentLessonSpan').classList.add('no-lesson');
            
            Swal.fire({
                icon: 'success',
                title: 'سڕایەوە',
                text: 'هەموو داتاکان بە سەرکەوتوویی سڕدرایەوە.',
            });
        }
    });
}

// پرینتکردنی لیستی قوتابیان
function printStudentTable() {
    window.print();
}

// هەڵگرتنی داتاکان بە فۆرماتی Excel (چاککراو)
async function exportToExcel() {
    const students = await getCurrentStudents();
    
    if (students.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: 'هیچ داتایەک نیە بۆ هەڵگرتن!',
        });
        return;
    }
    
    try {
        // دروستکردنی داتا بۆ Excel
        const data = [];
        
        // زیادکردنی سەرپێڕ
        data.push([
            'ناو', 
            'ئیمەیڵ', 
            'کۆلێژ', 
            'بەش', 
            'گروپ', 
            'ژمارەی غیاب', 
            'تێبینییەکان'
        ]);
        
        // زیادکردنی داتاکان
        students.forEach(student => {
            let absenceCount = 0;
            let notesText = '';
            
            if (currentLessonName && student.absences && student.absences[currentLessonName]) {
                absenceCount = student.absences[currentLessonName].count || 0;
                const notes = student.absences[currentLessonName].notes || [];
                notesText = notes.map(note => `${note.date}: ${note.text}`).join('; ');
            }
            
            data.push([
                student.name,
                student.email,
                student.college,
                student.department,
                student.group,
                absenceCount,
                notesText
            ]);
        });
        
        // دروستکردنی Workbook
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'قوتابیان');
        
        // هەڵگرتن
        const college = document.getElementById('collegeSelect').value;
        const stage = document.getElementById('stageSelect').value;
        const department = document.getElementById('departmentSelect').value;
        const group = document.getElementById('groupSelect').value;
        const lesson = currentLessonName || 'هیچ';
        const fileName = `غیاب_${college}_${stage}_${department}_${group}_${lesson}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        
        Swal.fire({
            icon: 'success',
            title: 'سەرکەوتووبوو',
            text: 'فایلەکە بە سەرکەوتوویی هەڵگیرا!',
        });
    } catch (error) {
        console.error('هەڵە لە هەڵگرتنی Excel: ', error);
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: 'هەڵە ڕوویدا لە هەڵگرتنی فایلەکە!',
        });
    }
}

// هەڵگرتنی فەرمیتی Excel (چاککراو)
function exportTemplate() {
    try {
        // دروستکردنی داتا بۆ Excel
        const data = [];
        
        // زیادکردنی سەرپێڕ
        data.push([
            'ناو', 
            'ئیمەیڵ'
        ]);
        
        // زیادکردنی نمونەیەک
        data.push([
            'دکتۆر کارزان ئامۆزا',
            'dkkarazan@example.com'
        ]);
        data.push([
            'عبدالخالق خۆشناو',
            'abdulkhalq@example.com'
        ]);
        
        // دروستکردنی Workbook
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'قوتابیان');
        
        // هەڵگرتن
        XLSX.writeFile(wb, 'فەرمیتی_ناوەکان.xlsx');
        
        Swal.fire({
            icon: 'success',
            title: 'سەرکەوتووبوو',
            text: 'فەرمیتی Excel بە سەرکەوتوویی هەڵگیرا!',
        });
    } catch (error) {
        console.error('هەڵە لە هەڵگرتنی فەرمیتی: ', error);
        Swal.fire({
            icon: 'error',
            title: 'هەڵە',
            text: 'هەڵە ڕوویدا لە هەڵگرتنی فەرمیتی!',
        });
    }
}

// نوێکردنەوەی لیستی بەشەکان
function updateDepartments() {
    const college = document.getElementById('collegeSelect').value;
    const departments = collegeDepartments[college] || [];
    const departmentSelect = document.getElementById('departmentSelect');
    
    departmentSelect.innerHTML = '';
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
    });
}

// فەنکشنی سەرەکی کاتێک پەڕە بار دەبێت
document.addEventListener('DOMContentLoaded', async function () {
    const connectionStatusElement = document.getElementById('connectionStatus');
    
    // بارکردنی یوزەرەکان لە فایلەوە
    await loadUsersFromFile();
    
    // پشکنینی پەیوەندی بە سەرڤەرەوە
    checkServerConnection();
    
    // پشکنینی ئەوەی بەکارهێنەر چوویتەژوورەوە
    checkLoginStatus();
    
    // دانانی بەشەکان کاتێک کۆلێژ دەگۆڕدرێت
    document.getElementById('collegeSelect').addEventListener('change', function() {
        updateDepartments();
        renderTable();
        renderLessonTable();
    });
    
    // دەستپێکردنی لیستی بەشەکان
    updateDepartments();
    
    // Event listener بۆ دوگمەی چوونەژوورەوە
    document.getElementById('loginButton').addEventListener('click', async function() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        if (!username || !password) {
            errorDiv.textContent = 'تکایە هەموو خانەکان پڕبکەوە';
            errorDiv.style.display = 'block';
            return;
        }
        
        try {
            const result = await loginUser(username, password);
            
            // چوونەژوورەوە سەرکەوتووبوو
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('teacherName', result.teacherName || username);
            
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('teacherNameDisplay').textContent = result.teacherName || username;
            
            // پاککردنەوەی هەڵەکان
            errorDiv.style.display = 'none';
            
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    });
    
    // Event listener بۆ زیادکردنی قوتابی
    document.getElementById('saveButton').addEventListener('click', async function () {
        const name = document.getElementById('studentName').value.trim();
        const email = document.getElementById('studentEmail').value.trim();
        const college = document.getElementById('collegeSelect').value;
        const stage = document.getElementById('stageSelect').value;
        const department = document.getElementById('departmentSelect').value;
        const group = document.getElementById('groupSelect').value;

        if (!name || !email) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'تکایە هەموو خانەکان پڕبکەوە!',
            });
            return;
        }

        if (!isValidEmail(email)) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'تکایە ئیمەیڵێکی دروست بنووسە!',
            });
            return;
        }

        const students = await getCurrentStudents();
        
        // پشکنینی ئەوەی ئەم قوتابیە پێشتر تۆمارکراوە
        const existingStudent = students.find(s => s.email === email);
        if (existingStudent) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'ئەم قوتابیە پێشتر تۆمارکراوە!',
            });
            return;
        }

        const newStudent = {
            name,
            email,
            college,
            stage,
            department,
            group,
            absences: {}
        };

        const result = await saveStudent(newStudent);
        if (result.success) {
            await renderTable();
            await renderLessonTable();
            
            // پاککردنەوەی خانەکان
            document.getElementById('studentName').value = '';
            document.getElementById('studentEmail').value = '';
            
            Swal.fire({
                icon: 'success',
                title: 'سەرکەوتووبوو',
                text: result.message,
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: result.message,
            });
        }
    });
    
    // هەڵگرتنی گۆڕانکارییەکانی ئیمەیڵ
    document.getElementById('saveEmailChanges').addEventListener('click', async function() {
        const newEmail = document.getElementById('newEmail').value.trim();
        
        if (!newEmail) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'تکایە ئیمەیڵێک بنووسە!',
            });
            return;
        }
        
        if (!isValidEmail(newEmail)) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'تکایە ئیمەیڵێکی دروست بنووسە!',
            });
            return;
        }
        
        const students = await getCurrentStudents();
        
        // پشکنین بۆ ئەوەی ئیمەیڵە نوێیە پێشتر بوونی هەیە
        const emailExists = students.some((student, i) => 
            i !== currentStudentIndex && student.email === newEmail
        );
        
        if (emailExists) {
            Swal.fire({
                icon: 'error',
                title: 'هەڵە',
                text: 'ئیمەیڵە نوێیەکە پێشتر تۆمارکراوە!',
            });
            return;
        }
        
        if (connectionStatus) {
            try {
                const student = students[currentStudentIndex];
                
                const response = await fetch(`${SERVER_URL}/api/students/${student.id}/email`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: newEmail })
                });
                
                if (!response.ok) throw new Error('هەڵە لە نوێکردنەوەی ئیمەیڵ');
                
                await renderTable();
                
                $('#editEmailModal').modal('hide');
                
                Swal.fire({
                    icon: 'success',
                    title: 'سەرکەوتووبوو',
                    text: 'ئیمەیڵەکە بە سەرکەوتوویی نوێکرایەوە!',
                });
            } catch (error) {
                console.error('هەڵە: ', error);
                connectionStatus = false;
                checkServerConnection();
                
                // نوێکردنەوەی ئیمەیڵ لە localStorage
                students[currentStudentIndex].email = newEmail;
                const college = document.getElementById('collegeSelect').value;
                const stage = document.getElementById('stageSelect').value;
                const department = document.getElementById('departmentSelect').value;
                const group = document.getElementById('groupSelect').value;
                const key = `students_${college}_${stage}_${department}_${group}`;
                localStorage.setItem(key, JSON.stringify(students));
                
                await renderTable();
                
                $('#editEmailModal').modal('hide');
                
                Swal.fire({
                    icon: 'success',
                    title: 'سەرکەوتووبوو',
                    text: 'ئیمەیڵەکە بە سەرکەوتوویی نوێکرایەوە!',
                });
            }
        } else {
            // نوێکردنەوەی ئیمەیڵ لە localStorage
            students[currentStudentIndex].email = newEmail;
            const college = document.getElementById('collegeSelect').value;
            const stage = document.getElementById('stageSelect').value;
            const department = document.getElementById('departmentSelect').value;
            const group = document.getElementById('groupSelect').value;
            const key = `students_${college}_${stage}_${department}_${group}`;
            localStorage.setItem(key, JSON.stringify(students));
            
            await renderTable();
            
            $('#editEmailModal').modal('hide');
            
            Swal.fire({
                icon: 'success',
                title: 'سەرکەوتووبوو',
                text: 'ئیمەیڵەکە بە سەرکەوتوویی نوێکرایەوە!',
            });
        }
    });

    // گەڕان لە لیستی قوتابیان
    document.getElementById('searchInput').addEventListener('input', renderTable);

    // گۆڕانکاری لە هەڵبژاردنەکان
    document.getElementById('collegeSelect').addEventListener('change', renderTable);
    document.getElementById('stageSelect').addEventListener('change', renderTable);
    document.getElementById('departmentSelect').addEventListener('change', renderTable);
    document.getElementById('groupSelect').addEventListener('change', renderTable);

    // دەستپێکردنی سەرەتایی
    renderLessonTable();
    renderTable();
});