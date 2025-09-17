-- دروستکردنی داتابەیس
CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- خشتەی قوتابیان
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    college VARCHAR(255) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    department VARCHAR(255) NOT NULL,
    group_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- خشتەی دەرسەکان
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- خشتەی غیابەکان
CREATE TABLE IF NOT EXISTS absences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    lesson_id INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- خشتەی بەکارهێنەران (مامۆستایان)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('admin', 'teacher') DEFAULT 'teacher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- داتای سەرەتایی بۆ مامۆستایەک
INSERT INTO users (username, password, full_name, email, role) VALUES
('admin', 'admin123', 'مامۆستای سەرەکی', 'admin@example.com', 'admin'),
('mamosta', 'mamosta123', 'مامۆستای بەڕێز', 'mamosta@example.com', 'teacher');

-- خشتەی تێبینییەکانی غیاب
CREATE TABLE IF NOT EXISTS absence_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    absence_id INT NOT NULL,
    note_text TEXT NOT NULL,
    note_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (absence_id) REFERENCES absences(id) ON DELETE CASCADE
);

-- View بۆ بینینی غیابەکان بە ناوی قوتابی و دەرس
CREATE VIEW absence_details AS
SELECT 
    s.name AS student_name,
    s.email AS student_email,
    l.name AS lesson_name,
    a.note AS absence_note,
    a.created_at AS absence_date,
    s.college,
    s.department,
    s.group_name
FROM absences a
JOIN students s ON a.student_id = s.id
JOIN lessons l ON a.lesson_id = l.id;

-- نمونەی داتای سەرەتایی بۆ تێستکردن
INSERT INTO lessons (name) VALUES 
('زانستی کۆمپیوتەر'),
('ئەندازیاری نەرمەکالا'),
('بەڕێوەبردنی پرۆژە'),
('ئەستێرەناسی');

-- نمونەی داتای سەرەتایی بۆ قوتابیان
INSERT INTO students (name, email, college, stage, department, group_name) VALUES
('عەبدولخالق محەممەد', 'abdul@example.com', 'کارگێری و ئابووری', '2', 'ژمێریاری', 'A'),
('سارا عەلی', 'sara@example.com', 'کارگێری و ئابووری', '2', 'ژمێریاری', 'A'),
('ئەحمەد کەریم', 'ahmed@example.com', 'کارگێری و ئابووری', '2', 'ژمێریاری', 'B');