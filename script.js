// ========== Local Storage Keys ==========
const STORAGE_KEY = 'miniWikiFeed';
const COMMENT_KEY = 'miniWikiComments';

// ========== Language Strings ==========
const translations = {
  en: {
    appTitle: "Social MiniFeed",
    postTitle: "Post title",
    namePlaceholder: "Your name",
    selectForum: "Select forum",
    postContent: "Write something...",
    postButton: "Post",
    noComments: "No comments yet. Be the first!",
    commentPlaceholder: "Write a comment...",
    commentButton: "Comment",
    authors: "Authors",
    settings: "Settings",
    languageLabel: "Language",
    themeLabel: "Theme",
  },
  es: {
    appTitle: "MiniFeed Social",
    postTitle: "Título de la publicación",
    namePlaceholder: "Tu nombre",
    selectForum: "Selecciona foro",
    postContent: "Escribe algo...",
    postButton: "Publicar",
    noComments: "Aún no hay comentarios. ¡Sé el primero!",
    commentPlaceholder: "Escribe un comentario...",
    commentButton: "Comentar",
    authors: "Autores",
    settings: "Configuración",
    languageLabel: "Idioma",
    themeLabel: "Tema",
  },
  fr: {
    appTitle: "MiniFeed Social",
    postTitle: "Titre du post",
    namePlaceholder: "Votre nom",
    selectForum: "Sélectionnez un forum",
    postContent: "Écris quelque chose...",
    postButton: "Publier",
    noComments: "Pas encore de commentaires. Soyez le premier !",
    commentPlaceholder: "Écris un commentaire...",
    commentButton: "Commenter",
    authors: "Auteurs",
    settings: "Paramètres",
    languageLabel: "Langue",
    themeLabel: "Thème",
  },
  ru: {
    appTitle: "Социальный MiniFeed",
    postTitle: "Заголовок поста",
    namePlaceholder: "Ваше имя",
    selectForum: "Выберите форум",
    postContent: "Напишите что-нибудь...",
    postButton: "Опубликовать",
    noComments: "Комментариев пока нет. Будьте первым!",
    commentPlaceholder: "Напишите комментарий...",
    commentButton: "Комментировать",
    authors: "Авторы",
    settings: "Настройки",
    languageLabel: "Язык",
    themeLabel: "Тема",
  }
};

let currentLang = 'en';

// ========== Utility Functions ==========
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[m]);
}

function loadPosts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function loadComments() {
  return JSON.parse(localStorage.getItem(COMMENT_KEY)) || {};
}

function saveComments(comments) {
  localStorage.setItem(COMMENT_KEY, JSON.stringify(comments));
}

// ========== Update UI Text Based on Language ==========
function updateUIText() {
  const t = translations[currentLang];

  // Update form placeholders and button text
  document.getElementById('postTitle').placeholder = t.postTitle;
  document.getElementById('postAuthor').placeholder = t.namePlaceholder;
  document.getElementById('postForum').options[0].text = t.selectForum;
  document.getElementById('postContent').placeholder = t.postContent;
  document.querySelector('#addPostForm button[type="submit"]').textContent = t.postButton;

  // Section titles
  document.querySelector('h1').textContent = t.appTitle;
  document.querySelector('#authorsSection h2').textContent = t.authors;
  document.querySelector('#settingsSection h2').textContent = t.settings;

  // Settings labels
  document.querySelector('label[for="languageSelect"]').textContent = t.languageLabel;
  document.querySelector('label[for="themeSelect"]').textContent = t.themeLabel;

  // Re-render feed to update comment text
  renderFeed(loadPosts());
}

// ========== Render Posts ==========
function renderFeed(posts) {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  posts.slice().reverse().forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
      <h3>${escapeHtml(post.title)}</h3>
      <p><strong>${escapeHtml(post.author)}</strong> • ${post.timestamp} • ${post.forum}</p>
      <p>${escapeHtml(post.content).replace(/\n/g, '<br>')}</p>
      <button class="delete-post-btn" data-id="${post.id}">🗑️ Delete Post</button>
      <div class="comments" id="comments-${post.id}"></div>
    `;
    feed.appendChild(postDiv);

    // Delete post button
    postDiv.querySelector('.delete-post-btn').addEventListener('click', () => {
      const updatedPosts = loadPosts().filter(p => p.id !== post.id);
      savePosts(updatedPosts);

      const comments = loadComments();
      delete comments[post.id];
      saveComments(comments);

      renderFeed(updatedPosts);
      renderAuthors(updatedPosts);
    });

    renderComments(post.id);
    addCommentForm(post.id);
  });
}

// ========== Comment Section ==========
function renderComments(postId) {
  const container = document.getElementById(`comments-${postId}`);
  const comments = loadComments();
  const postComments = comments[postId] || [];

  container.innerHTML = '';

  if (postComments.length === 0) {
    container.innerHTML = `<p>${translations[currentLang].noComments}</p>`;
    return;
  }

  postComments.forEach((c, index) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${escapeHtml(c.author)}</strong>: ${escapeHtml(c.text)} 
      <small>${c.timestamp}</small>
      <button class="delete-comment-btn" data-index="${index}">🗑️</button>
    `;

    div.querySelector('.delete-comment-btn').addEventListener('click', () => {
      const comments = loadComments();
      comments[postId].splice(index, 1);
      saveComments(comments);
      renderComments(postId);
    });

    container.appendChild(div);
  });
}

function addCommentForm(postId) {
  const container = document.getElementById(`comments-${postId}`);
  const form = document.createElement('form');
  form.innerHTML = `
    <input name="commentAuthor" placeholder="${translations[currentLang].namePlaceholder}" required />
    <input name="commentText" placeholder="${translations[currentLang].commentPlaceholder}" required />
    <button type="submit">${translations[currentLang].commentButton}</button>
  `;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const author = form.commentAuthor.value.trim();
    const text = form.commentText.value.trim();
    if (!author || !text) return;

    const comments = loadComments();
    if (!comments[postId]) comments[postId] = [];
    comments[postId].push({ author, text, timestamp: new Date().toLocaleString() });
    saveComments(comments);

    renderComments(postId);
    form.reset();
  });
  container.appendChild(form);
}

// ========== Authors ==========
function renderAuthors(posts) {
  const authors = [...new Set(posts.map(p => p.author))];
  const list = document.getElementById('authors');
  list.innerHTML = '';
  authors.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    list.appendChild(li);
  });
}

// ========== Handle New Post ==========
document.getElementById('addPostForm').addEventListener('submit', e => {
  e.preventDefault();

  const title = document.getElementById('postTitle').value.trim();
  const author = document.getElementById('postAuthor').value.trim();
  const forum = document.getElementById('postForum').value;
  const content = document.getElementById('postContent').value.trim();

  if (!title || !author || !content || !forum) return;

  const posts = loadPosts();
  posts.push({
    id: Date.now(),
    title,
    author,
    forum,
    content,
    timestamp: new Date().toLocaleString(),
  });
  savePosts(posts);
  renderFeed(posts);
  renderAuthors(posts);
  e.target.reset();
});

// ========== Settings ==========
document.getElementById('themeSelect').addEventListener('change', e => {
  const theme = e.target.value;
  document.body.className = `theme-${theme}`;
});

document.getElementById('languageSelect').addEventListener('change', e => {
  currentLang = e.target.value;
  updateUIText();
});

// ========== Init ==========
updateUIText(); // sets UI text and renders feed/authors accordingly
renderAuthors(loadPosts());