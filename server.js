const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'pages.json');

// Load or initialize pages
function loadPages() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return {
    home: "Welcome to MiniWiki!\n\nUse the form below to add new pages.",
    history: "History is the study of past events, particularly in human affairs.",
    science: "Science is the pursuit of knowledge through observation and experiment."
  };
}

function savePages(pages) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(pages, null, 2));
}

// API to get all pages
app.get('/api/pages', (req, res) => {
  const pages = loadPages();
  res.json(pages);
});

// API to save or update a page
app.post('/api/pages', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content required." });
  }
  const pages = loadPages();
  pages[title] = content;
  savePages(pages);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

