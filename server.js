const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// پەیوەندی بە داتابەیسەوە
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // ئەگەر تێپەڕەوشەت هەیە، لێرە بنووسە
    database: 'attendance_system'
});

// پشکنینی پەیوەندی بە داتابەیسەوە
db.connect((err) => {
    if (err) {
        console.error('هەڵە لە پەیوەندی بە داتابەیسەوە: ' + err.stack);
        console.log('تێپەڕەوشەی MySQL دەستکاری بکە لە کۆدی server.js');
        return;
    }
    console.log('لە داتابەیسەوە بە سەرکەوتوویی کۆنێکت بووە ' + db.threadId);
});

// ڕێگەگرتنی GET بۆ نیشاندانی پەیوەندی
app.get('/', (req, res) => {
    res.json({ message: 'سیستەمی غیاباتی قوتابیان - پەیوەندی بە داتابەیسەوە دروستکراوە' });
});

// ڕێگەگرتنی GET بۆ پشکنینی پەیوەندی
app.get('/api/status', (req, res) => {
    res.json({ status: 'connected', message: 'سەرڤەر کاردەکات' });
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

// ڕێگەگرتنی OPTIONS بۆ هەموو APIەکان (بۆ CORS)
app.options('*', cors());

// گوێگرتن لە پۆرتی دیاریکراو
app.listen(port, '0.0.0.0', () => {
    console.log(`سەرڤەر کاردەکات لەسەر پۆرت ${port} و ڕێگە بە هەموو پەیوەندییەکان دەدات`);
    console.log(`پشکنین بکە: http://localhost:${port}/api/status`);
});

// ڕێکخستنی هەڵەکان بۆ نەهێشتنی کڕاشی سەرڤەر
process.on('uncaughtException', (err) => {
    console.error('هەڵەی ڕەهاڵنەکراو: ', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('هەڵەی ڕەهاڵنەکراوی Promise: ', reason);
});