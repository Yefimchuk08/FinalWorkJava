
  let books = JSON.parse(localStorage.getItem('books')) || [];
  let visitors = JSON.parse(localStorage.getItem('visitors')) || [];
  let cards = JSON.parse(localStorage.getItem('cards')) || [];
  let editingBook = null;
  let editingVisitor = null;

  function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'stats') renderStats();
    if (id === 'cards') renderCards();
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

  function sortVisitors(by) {
    if (by === 'id') renderVisitors();
    else visitors.sort((a, b) => a.name.localeCompare(b.name));
    renderVisitors();
  }


  function renderCards() {
    const tbody = document.getElementById('cardsTable');
    const search = document.getElementById('cardSearch').value.toLowerCase();
    tbody.innerHTML = '';
    cards.filter(c => {
      const book = books[c.book]?.title || "";
      const visitor = visitors[c.visitor]?.name || "";
      return book.toLowerCase().includes(search) || visitor.toLowerCase().includes(search);
    }).forEach((c, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${i + 1}</td><td>${visitors[c.visitor]?.name || "-"}</td>
        <td>${books[c.book]?.title || "-"}</td>
        <td>${c.dateTake}</td>
        <td>${c.dateReturn || `<button onclick="returnBook(${i})">↩️</button>`}</td>`;
      tbody.appendChild(row);
    });
  }

  function showCardForm() {
    const bsel = document.getElementById('bookSelect');
    const vsel = document.getElementById('visitorSelect');
    bsel.innerHTML = books.map((b, i) => b.count > 0 ? `<option value="${i}">${b.title}</option>` : '').join('');
    vsel.innerHTML = visitors.map((v, i) => `<option value="${i}">${v.name}</option>`).join('');
    document.getElementById('cardForm').style.display = 'block';
  }

  function saveCard() {
    const book = +document.getElementById('bookSelect').value;
    const visitor = +document.getElementById('visitorSelect').value;
    if (books[book].count < 1) return alert("Книга недоступна");
    cards.push({ book, visitor, dateTake: new Date().toLocaleDateString(), dateReturn: null });
    books[book].count--;
    localStorage.setItem('cards', JSON.stringify(cards));
    localStorage.setItem('books', JSON.stringify(books));
    document.getElementById('cardForm').style.display = 'none';
    renderCards();
    renderBooks();
  }

  function returnBook(i) {
    cards[i].dateReturn = new Date().toLocaleDateString();
    books[cards[i].book].count++;
    localStorage.setItem('cards', JSON.stringify(cards));
    localStorage.setItem('books', JSON.stringify(books));
    renderCards();
    renderBooks();
  }


  function renderStats() {
    const bookStat = {}, visitorStat = {};
    cards.forEach(c => {
      if (!bookStat[c.book]) bookStat[c.book] = 0;
      if (!visitorStat[c.visitor]) visitorStat[c.visitor] = 0;
      bookStat[c.book]++;
      visitorStat[c.visitor]++;
    });
    const topBooks = Object.entries(bookStat).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topVisitors = Object.entries(visitorStat).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const bookList = document.getElementById('topBooks');
    bookList.innerHTML = topBooks.map(([i, count]) => `<li>${books[i]?.title || "-"} (${count})</li>`).join('');

    const visitorList = document.getElementById('topVisitors');
    visitorList.innerHTML = topVisitors.map(([i, count]) => `<li>${visitors[i]?.name || "-"} (${count})</li>`).join('');
  }


  renderBooks();
  renderVisitors();
