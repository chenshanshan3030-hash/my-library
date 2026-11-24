// 我的圖書館：共用資料與工具（資料存在瀏覽器的 localStorage）
const LIB_KEY = 'my-library-v1';

const STATUS = { want: '想讀', reading: '正在讀', done: '讀完了' };
// 皮革封面的顏色
const COLORS = ['#5b1a1a', '#1d3b2a', '#1c2a4a', '#4a2a12', '#3a1f4a', '#2b2b2b', '#5e4210', '#123c3c'];

// 舊版會自動放的範例書，現在要清掉
const OLD_SAMPLE_MARK = '（這是範例書，可以編輯或刪除）';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadBooks() {
  let raw = null;
  try { raw = localStorage.getItem(LIB_KEY); } catch (e) { /* 無痕模式等 */ }
  if (raw === null) return [];
  let data;
  try { data = JSON.parse(raw); } catch (e) { return []; }
  if (!Array.isArray(data)) return [];
  const cleaned = data.filter(b => !(b && typeof b.notes === 'string' && b.notes.includes(OLD_SAMPLE_MARK)));
  if (cleaned.length !== data.length) saveBooks(cleaned);
  return cleaned;
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

// 封面圖片只接受 http / https
function safeUrl(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
  try {
    const p = new URL(u);
    if (p.protocol !== 'http:' && p.protocol !== 'https:') return '';
    try { return decodeURI(p.href); } catch (e) { return p.href; }
  } catch (e) { return ''; }
}

function colorFor(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

function coverHtml(b) {
  const img = safeUrl(b.cover);
  return `<div class="cover" style="--leather:${colorFor(b.title)}">
    <span class="cover-title">${esc(b.title)}</span>
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
  if (page === 'add.html' && location.search.includes('id=')) return;
  document.querySelectorAll('nav.tabs a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('on');
  });
});
