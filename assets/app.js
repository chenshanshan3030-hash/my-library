// 我的圖書館：共用資料與工具（資料存在瀏覽器的 localStorage）
const LIB_KEY = 'my-library-v1';

const STATUS = { want: '想讀', reading: '正在讀', done: '讀完了' };
const COLORS = ['#2f7d6d', '#a0673a', '#4a6fa5', '#b4442f', '#7a5195', '#c08b1c', '#3d7a3a', '#5b5b8f'];

const SAMPLE_BOOKS = [
  {
    title: '小王子', author: '安東尼．聖修伯里', category: '經典文學', status: 'done', rating: 5,
    notes: '「真正重要的東西，用眼睛是看不見的。」\n（這是範例書，可以編輯或刪除）',
    links: [{ name: '維基百科介紹', url: 'https://zh.wikipedia.org/wiki/小王子' }]
  },
  {
    title: '好餓的毛毛蟲', author: '艾瑞．卡爾', category: '繪本', status: 'reading', rating: 4,
    notes: '（這是範例書，可以編輯或刪除）',
    links: [{ name: '維基百科介紹', url: 'https://zh.wikipedia.org/wiki/好餓的毛毛蟲' }]
  },
  {
    title: '夏綠蒂的網', author: 'E．B．懷特', category: '兒童小說', status: 'want', rating: 0,
    notes: '（這是範例書，可以編輯或刪除）',
    links: [{ name: '維基百科介紹', url: 'https://zh.wikipedia.org/wiki/夏綠蒂的網' }]
  }
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadBooks() {
  let raw = null;
  try { raw = localStorage.getItem(LIB_KEY); } catch (e) { /* 無痕模式等 */ }
  if (raw === null) {
    const now = Date.now();
    const books = SAMPLE_BOOKS.map((b, i) => ({ ...b, id: uid() + i, cover: '', added: now - i * 1000 }));
    saveBooks(books);
    return books;
  }
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) { return []; }
}

function saveBooks(books) {
  try { localStorage.setItem(LIB_KEY, JSON.stringify(books)); return true; }
  catch (e) { alert('存檔失敗：這個瀏覽器可能不允許儲存資料。'); return false; }
}

function getBook(id) { return loadBooks().find(b => b.id === id); }

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// 只接受 http / https 連結，避免奇怪的連結
function safeUrl(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
  try {
    const p = new URL(u);
    return (p.protocol === 'http:' || p.protocol === 'https:') ? p.href : '';
  } catch (e) { return ''; }
}

function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }

function colorFor(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

function coverHtml(b) {
  const img = safeUrl(b.cover);
  return `<div class="cover" style="background:${colorFor(b.title)}">
    <span>${esc(b.title)}</span>
    ${img ? `<img src="${esc(img)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
  </div>`;
}

function starsText(n) {
  n = Number(n) || 0;
  return n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '';
}

function qs(name) { return new URLSearchParams(location.search).get(name); }

function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

// 標出目前頁面的分頁
document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.tabs a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('on');
  });
});
