const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// پەیوەندی بە داتابەیسەوە
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // ناوی بەکارهێنەری داتابەیس
  password: 'password', // تێپەڕەوشەی داتابەیس
  database: 'attendance_system' // ناوی داتابەیس
});

// پشکنینی پەیوەندی بە داتابەیسەوە
db.connect((err) => {
  if (err) {
    console.error('هەڵە لە پەیوەندی بە داتابەیسەوە: ' + err.stack);
    return;
  }
  console.log('لە داتابەیسەوە بە سەرکەوتوویی کۆنێکت بووە ' + db.threadId);
});

// ڕێگەگرتنی GET بۆ نیشاندانی پەیوەندی
app.get('/', (req, res) => {
  res.send('سیستەمی غیاباتی قوتابیان - پەیوەندی بە داتابەیسەوە دروستکراوە');
});

// ڕێگەگرتنی POST بۆ هەڵگرتنی قوتابیان
app.post('/api/students', (req, res) => {
  const { name, email, college, stage, department, group } = req.body;
  
  const query = 'INSERT INTO students (name, email, college, stage, department, group_name) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.execute(query, [name, email, college, stage, department, group], (err, results) => {
    if (err) {
      console.error('هەڵە لە تۆمارکردنی قوتابی: ' + err);
      res.status(500).json({ error: 'هەڵە لە تۆمارکردنی قوتابی' });
      return;
    }
    res.json({ success: true, message: 'قوتابی بە سەرکەوتوویی تۆمارکرا', id: results.insertId });
  });
});

// ڕێگەگرتنی GET بۆ وەرگرتنی لیستی قوتابیان
app.get('/api/students', (req, res) => {
  const { college, stage, department, group } = req.query;
  
  let query = 'SELECT * FROM students WHERE 1=1';
  let params = [];
  
  if (college) {
    query += ' AND college = ?';
    params.push(college);
  }
  
  if (stage) {
    query += ' AND stage = ?';
    params.push(stage);
  }
  
  if (department) {
    query += ' AND department = ?';
    params.push(department);
  }
  
  if (group) {
    query += ' AND group_name = ?';
    params.push(group);
  }
  
  db.execute(query, params, (err, results) => {
    if (err) {
      console.error('هەڵە لە وەرگرتنی قوتابیان: ' + err);
      res.status(500).json({ error: 'هەڵە لە وەرگرتنی قوتابیان' });
      return;
    }
    res.json(results);
  });
});

// ڕێگەگرتنی POST بۆ زیادکردنی غیاب
app.post('/api/absences', (req, res) => {
  const { student_id, lesson, note } = req.body;
  
  const query = 'INSERT INTO absences (student_id, lesson, note) VALUES (?, ?, ?)';
  
  db.execute(query, [student_id, lesson, note], (err, results) => {
    if (err) {
      console.error('هەڵە لە تۆمارکردنی غیاب: ' + err);
      res.status(500).json({ error: 'هەڵە لە تۆمارکردنی غیاب' });
      return;
    }
    res.json({ success: true, message: 'غیاب بە سەرکەوتوویی تۆمارکرا' });
  });
});

// ڕێگەگرتنی GET بۆ وەرگرتنی غیابەکان
app.get('/api/absences', (req, res) => {
  const { student_id, lesson } = req.query;
  
  let query = `
    SELECT s.name, s.email, a.lesson, a.note, a.created_at 
    FROM absences a 
    JOIN students s ON a.student_id = s.id 
    WHERE 1=1
  `;
  let params = [];
  
  if (student_id) {
    query += ' AND a.student_id = ?';
    params.push(student_id);
  }
  
  if (lesson) {
    query += ' AND a.lesson = ?';
    params.push(lesson);
  }
  
  db.execute(query, params, (err, results) => {
    if (err) {
      console.error('هەڵە لە وەرگرتنی غیابەکان: ' + err);
      res.status(500).json({ error: 'هەڵە لە وەرگرتنی غیابەکان' });
      return;
    }
    res.json(results);
  });
});

// ڕێگەگرتنی POST بۆ زیادکردنی دەرس
app.post('/api/lessons', (req, res) => {
  const { name } = req.body;
  
  const query = 'INSERT INTO lessons (name) VALUES (?)';
  
  db.execute(query, [name], (err, results) => {
    if (err) {
      console.error('هەڵە لە تۆمارکردنی دەرس: ' + err);
      res.status(500).json({ error: 'هەڵە لە تۆمارکردنی دەرس' });
      return;
    }
    res.json({ success: true, message: 'دەرس بە سەرکەوتوویی تۆمارکرا', id: results.insertId });
  });
});

// ڕێگەگرتنی GET بۆ وەرگرتنی دەرسەکان
app.get('/api/lessons', (req, res) => {
  const query = 'SELECT * FROM lessons';
  
  db.execute(query, (err, results) => {
    if (err) {
      console.error('هەڵە لە وەرگرتنی دەرسەکان: ' + err);
      res.status(500).json({ error: 'هەڵە لە وەرگرتنی دەرسەکان' });
      return;
    }
    res.json(results);
  });
});

// ڕێگەگرتنی DELETE بۆ سڕینەوەی دەرس
app.delete('/api/lessons/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM lessons WHERE id = ?';
  
  db.execute(query, [id], (err, results) => {
    if (err) {
      console.error('هەڵە لە سڕینەوەی دەرس: ' + err);
      res.status(500).json({ error: 'هەڵە لە سڕینەوەی دەرس' });
      return;
    }
    res.json({ success: true, message: 'دەرس بە سەرکەوتوویی سڕدرایەوە' });
  });
});

// ڕێگەگرتنی PUT بۆ نوێکردنەوەی ئیمەیڵ
app.put('/api/students/:id/email', (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  
  const query = 'UPDATE students SET email = ? WHERE id = ?';
  
  db.execute(query, [email, id], (err, results) => {
    if (err) {
      console.error('هەڵە لە نوێکردنەوەی ئیمەیڵ: ' + err);
      res.status(500).json({ error: 'هەڵە لە نوێکردنەوەی ئیمەیڵ' });
      return;
    }
    res.json({ success: true, message: 'ئیمەیڵ بە سەرکەوتوویی نوێکرایەوە' });
  });
});

// ڕێگەگرتنی DELETE بۆ سڕینەوەی قوتابی
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  
  // یەکەم سڕینەوەی غیابەکانی قوتابی
  const deleteAbsencesQuery = 'DELETE FROM absences WHERE student_id = ?';
  
  db.execute(deleteAbsencesQuery, [id], (err) => {
    if (err) {
      console.error('هەڵە لە سڕینەوەی غیابەکان: ' + err);
      res.status(500).json({ error: 'هەڵە لە سڕینەوەی غیابەکان' });
      return;
    }
    
    // دواتر سڕینەوەی قوتابی
    const deleteStudentQuery = 'DELETE FROM students WHERE id = ?';
    
    db.execute(deleteStudentQuery, [id], (err, results) => {
      if (err) {
        console.error('هەڵە لە سڕینەوەی قوتابی: ' + err);
        res.status(500).json({ error: 'هەڵە لە سڕینەوەی قوتابی' });
        return;
      }
      res.json({ success: true, message: 'قوتابی بە سەرکەوتوویی سڕدرایەوە' });
    });
  });
});

// گوێگرتن لە پۆرتی دیاریکراو
app.listen(port, () => {
  console.log(`ئیش دەکات    ${port}`);
});