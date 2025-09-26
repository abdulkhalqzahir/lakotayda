// لە server.js
const teachers = [
  { id: 1, username: 'mamosta.ahmed', password: 'password123', name: 'ئەحمەد محەممەد' },
  { id: 2, username: 'dr.karzan', password: 'abc123', name: 'د. کارزان عەبدوڵڵا' },
  { id: 3, username: 'mamosta.sara', password: 'sara2023', name: 'سارا عەلی' },
  // یوزەری نوێ زیاد بکە...
];

app.post('/api/teachers/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // پشکنینی یوزەر و پاسسۆرد
    const teacher = teachers.find(t => t.username === username && t.password === password);
    
    if (!teacher) {
      return res.status(401).json({ error: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەە' });
    }
    
    res.json({ 
      success: true, 
      message: 'چوونەژوورەوە سەرکەوتووبوو',
      teacherName: teacher.name 
    });
    
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک ڕوویدا' });
  }
});