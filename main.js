
let books = JSON.parse(localStorage.getItem('books')) || [];
let visitors = JSON.parse(localStorage.getItem('visitors')) || [];
let cards = JSON.parse(localStorage.getItem('cards')) || [];

let editingBook = null;
let editingVisitor = null;

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'stats') renderStats();
}

function renderBooks() {
  const tbody = document.getElementById('booksTable');
  const search = document.getElementById('bookSearch').value.toLowerCase();
  tbody.innerHTML = '';
  books.filter(b => b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search) || b.publisher.toLowerCase().includes(search))
    .forEach((book, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${book.title}</td><td>${book.author}</td><td>${book.count}</td>
            <td><button onclick="editBook(${i})">✏️</button><button onclick="deleteBook(${i})">🗑️</button></td>`;
      tbody.appendChild(row);
    });
}

function showBookForm() {
  document.getElementById('bookForm').style.display = 'block';
  editingBook = null;
  document.querySelectorAll('#bookForm input').forEach(i => i.value = '');
}
function saveBook() {
  const book = {
    title: title.value.trim(),
    author: author.value.trim(),
    year: +year.value,
    publisher: publisher.value.trim(),
    pages: +pages.value,
    count: +count.value
  };
  if (!book.title || !book.author || !book.publisher || book.year < 0 || book.pages < 0 || book.count < 0) {
    alert("Некоректні дані."); return;
  }
  if (editingBook !== null) books[editingBook] = book;
  else books.push(book);
  localStorage.setItem('books', JSON.stringify(books));
  document.getElementById('bookForm').style.display = 'none';
  renderBooks();
}
function editBook(index) {
  editingBook = index;
  const book = books[index];
  Object.keys(book).forEach(k => document.getElementById(k).value = book[k]);
  document.getElementById('bookForm').style.display = 'block';
}
function deleteBook(index) {
  if (confirm("Видалити книгу?")) {
    books.splice(index, 1);
    localStorage.setItem('books', JSON.stringify(books));
    renderBooks();
  }
}
function sortBooks(by) {
  books.sort((a, b) => by === 'count' ? b.count - a.count : a[by].localeCompare(b[by]));
  renderBooks();
}

function renderVisitors() {
  const tbody = document.getElementById('visitorsTable');
  const search = document.getElementById('visitorSearch').value.toLowerCase();
  tbody.innerHTML = '';
  visitors.filter(v => v.name.toLowerCase().includes(search) || v.phone.includes(search))
    .forEach((v, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${i + 1}</td><td>${v.name}</td><td>${v.phone}</td>
            <td><button onclick="editVisitor(${i})">✏️</button></td>`;
      tbody.appendChild(row);
    });
}
function showVisitorForm() {
  document.getElementById('visitorForm').style.display = 'block';
  editingVisitor = null;
  vname.value = ''; vphone.value = '';
}
function saveVisitor() {
  const name = vname.value.trim();
  const phone = vphone.value.trim();
  if (!name || !/^[\d\s-]+$/.test(phone)) {
    alert("Некоректні дані відвідувача."); return;
  }
  const visitor = { name, phone };
  if (editingVisitor !== null) visitors[editingVisitor] = visitor;
  else visitors.push(visitor);
  localStorage.setItem('visitors', JSON.stringify(visitors));
  document.getElementById('visitorForm').style.display = 'none';
  renderVisitors();
}
function editVisitor(index) {
  editingVisitor = index;
  const v = visitors[index];
  vname.value = v.name; vphone.value = v.phone;
  document.getElementById('visitorForm').style.display = 'block';
}

function renderCards() {
  const tbody = document.getElementById('cardsTable');
  const search = document.getElementById('cardSearch').value.toLowerCase();
  tbody.innerHTML = '';
  cards.forEach((card, i) => {
    const visitor = visitors[card.visitor];
    const book = books[card.book];
    if (!visitor || !book) return;
    const fullText = `${visitor.name} ${book.title}`.toLowerCase();
    if (!fullText.includes(search)) return;
    const row = document.createElement('tr');
    row.innerHTML = `
          <td>${i + 1}</td>
          <td>${visitor.name}</td>
          <td>${book.title}</td>
          <td>${card.dateTake}</td>
          <td>${card.dateReturn || `<button onclick='returnBook(${i})'>↩️</button>`}</td>
        `;
    tbody.appendChild(row);
  });
}
function showCardForm() {
  const visitorSelect = document.getElementById('cardVisitor');
  const bookSelect = document.getElementById('cardBook');
  visitorSelect.innerHTML = '';
  bookSelect.innerHTML = '';
  visitors.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = v.name;
    visitorSelect.appendChild(opt);
  });
  books.forEach((b, i) => {
    if (b.count > 0) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = b.title;
      bookSelect.appendChild(opt);
    }
  });
  document.getElementById('cardForm').style.display = 'block';
}
function saveCard() {
  const visitorIndex = +document.getElementById('cardVisitor').value;
  const bookIndex = +document.getElementById('cardBook').value;
  if (isNaN(visitorIndex) || isNaN(bookIndex)) {
    alert("Обрано некоректні значення."); return;
  }
  const dateTake = new Date().toLocaleDateString();
  cards.push({ visitor: visitorIndex, book: bookIndex, dateTake, dateReturn: null });
  books[bookIndex].count--;
  localStorage.setItem('books', JSON.stringify(books));
  localStorage.setItem('cards', JSON.stringify(cards));
  document.getElementById('cardForm').style.display = 'none';
  renderBooks();
  renderCards();
}
function returnBook(index) {
  cards[index].dateReturn = new Date().toLocaleDateString();
  books[cards[index].book].count++;
  localStorage.setItem('cards', JSON.stringify(cards));
  localStorage.setItem('books', JSON.stringify(books));
  renderBooks();
  renderCards();
}
function renderStats() {
  const topBooks = {};
  const topVisitors = {};
  cards.forEach(c => {
    topBooks[c.book] = (topBooks[c.book] || 0) + 1;
    topVisitors[c.visitor] = (topVisitors[c.visitor] || 0) + 1;
  });
  const sortedBooks = Object.entries(topBooks).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sortedVisitors = Object.entries(topVisitors).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const bookUl = document.getElementById('topBooks');
  const visUl = document.getElementById('topVisitors');
  bookUl.innerHTML = '';
  visUl.innerHTML = '';
  sortedBooks.forEach(([i, c]) => bookUl.innerHTML += `<li>${books[i].title} — ${c} разів</li>`);
  sortedVisitors.forEach(([i, c]) => visUl.innerHTML += `<li>${visitors[i].name} — ${c} книг</li>`);
}

renderBooks();
renderVisitors();
renderCards();
