const books = [];
const RENDER_EVENT = "render-books";
const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "BOOKSHELF_APPS";
let currentDeleteBookId = null;
let currentEditBookId = null;

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
  document.dispatchEvent(new Event(SAVED_EVENT));
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const bookItem of data) {
      books.push(bookItem);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;
  const textTitle = document.createElement("h2");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${year}`;

  const textContainer = document.createElement("div");
  textContainer.classList.add("action");

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(textTitle, textAuthor, textYear, textContainer);

  if (isComplete) {
    textContainer.append(
      createUndoButton(id),
      createDeleteButton(id),
      createEditButton(id)
    );
  } else {
    textContainer.append(
      createCompleteButton(id),
      createDeleteButton(id),
      createEditButton(id)
    );
  }

  return container;
}

function createUndoButton(bookId) {
  const undoButton = document.createElement("button");
  undoButton.classList.add("green");
  undoButton.innerText = "Belum selesai dibaca";

  undoButton.addEventListener("click", function () {
    undoBookFromCompleted(bookId);
  });

  return undoButton;
}

function createDeleteButton(bookId) {
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("red");
  deleteButton.innerText = "Hapus buku";

  deleteButton.addEventListener("click", function () {
    showDeleteDialog(bookId);
  });

  return deleteButton;
}

function createCompleteButton(bookId) {
  const completeButton = document.createElement("button");
  completeButton.classList.add("green");
  completeButton.innerText = "Selesai dibaca";

  completeButton.addEventListener("click", function () {
    addBookToCompleted(bookId);
  });

  return completeButton;
}

function createEditButton(bookId) {
  const editButton = document.createElement("button");
  editButton.classList.add("blue");
  editButton.innerText = "Edit buku";

  editButton.addEventListener("click", function () {
    editBook(bookId);
  });

  return editButton;
}

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookIsComplete = document.getElementById("inputBookIsComplete").checked;

  const book = generateBookObject(
    generateId(),
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete
  );

  books.push(book);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBookToCompleted(bookId) {
  const book = findBook(bookId);
  book.isComplete = true;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function removeBookFromCompleted(bookId) {
  const index = findBookIndex(bookId);
  books.splice(index, 1);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function undoBookFromCompleted(bookId) {
  const book = findBook(bookId);
  book.isComplete = false;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function showDeleteDialog(bookId) {
  currentDeleteBookId = bookId;
  const modal = document.getElementById("dialog");
  modal.style.display = "block";
}

document
  .getElementById("confirmDeleteButton")
  .addEventListener("click", function () {
    if (currentDeleteBookId !== null) {
      removeBookFromCompleted(currentDeleteBookId);
      currentDeleteBookId = null;
      document.getElementById("dialog").style.display = "none";
    }
  });

document
  .getElementById("cancelDeleteButton")
  .addEventListener("click", function () {
    document.getElementById("dialog").style.display = "none";
  });

document.querySelector(".close-button").addEventListener("click", function () {
  document.getElementById("dialog").style.display = "none";
});

function openEditDialog(book) {
  document.getElementById("editBookTitle").value = book.title;
  document.getElementById("editBookAuthor").value = book.author;
  document.getElementById("editBookYear").value = book.year;
  document.getElementById("editBookIsComplete").checked = book.isComplete;

  currentEditBookId = book.id;

  const editModal = document.getElementById("editDialog");
  editModal.style.display = "block";
}

function closeEditDialog() {
  const editModal = document.getElementById("editDialog");
  editModal.style.display = "none";
}

function editBook(bookId) {
  const book = findBook(bookId);
  if (book) {
    openEditDialog(book);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("editCloseButton")
    .addEventListener("click", closeEditDialog);

  window.addEventListener("click", function (event) {
    const editModal = document.getElementById("editDialog");
    if (event.target === editModal) {
      editModal.style.display = "none";
    }
  });

  document
    .getElementById("editBook")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const bookTitle = document.getElementById("editBookTitle").value;
      const bookAuthor = document.getElementById("editBookAuthor").value;
      const bookYear = document.getElementById("editBookYear").value;
      const bookIsComplete =
        document.getElementById("editBookIsComplete").checked;

      const book = findBook(currentEditBookId);
      if (book) {
        book.title = bookTitle;
        book.author = bookAuthor;
        book.year = bookYear;
        book.isComplete = bookIsComplete;

        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
        closeEditDialog();
      }
    });
});

document
  .getElementById("searchBook")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const searchTitle = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();
    document.dispatchEvent(
      new CustomEvent(RENDER_EVENT, { detail: { searchTitle } })
    );
  });

document.addEventListener(RENDER_EVENT, function (event) {
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedBookList = document.getElementById("completeBookshelfList");
  uncompletedBookList.innerHTML = "";
  completedBookList.innerHTML = "";

  const searchTitle = event.detail ? event.detail.searchTitle : "";

  for (const book of books) {
    if (!searchTitle || book.title.toLowerCase().includes(searchTitle)) {
      const bookElement = makeBook(book);
      if (book.isComplete) {
        completedBookList.append(bookElement);
      } else {
        uncompletedBookList.append(bookElement);
      }
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log("Data berhasil disimpan.");
});

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

console.log(books);
