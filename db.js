let db;
let dbReq = indexedDB.open("myDatabase", 1);
dbReq.onupgradeneeded = function (event) {
  db = event.target.result;
  let todos = db.createObjectStore("todos", { autoIncrement: true });
};
dbReq.onsuccess = function (event) {
  db = event.target.result;
  let task = document.getElementById("input-text");
  getAndDisplayTodos(db);
};
dbReq.onerror = function (event) {
  alert("Error while opening database " + event.target.errorCode);
};

function addTodo(db, task) {
  let transaction = db.transaction(["todos"], "readwrite");
  let objectStore = transaction.objectStore("todos");

  let todo = { text: task, check: false, timestamp: Date.now() };
  objectStore.add(todo);

  objectStore.onsuccess = function () {
    console.log(objectStore.result);
  };
  transaction.oncomplete = function () {
    console.log("objectStored your new todo task!");
    getAndDisplayTodos(db);
  };
  transaction.onerror = function (event) {
    alert("Error while storing the todo " + event.target.errorCode);
  };
}

function submitTodo() {
  let task = document.getElementById("input-text");
  if (!task.value) {
    console.error("Please enter a task");
  } else {
    addTodo(db, task.value);
    task.value = "";
  }
}

function getAndDisplayTodos(db) {
  let transaction = db.transaction(["todos"], "readwrite");
  let objectStore = transaction.objectStore("todos");

  let req = objectStore.openCursor();
  let allTodos = [];

  req.onsuccess = function (event) {
    let cursor = event.target.result;
    if (cursor != null) {
      let todo = !cursor.value.key
        ? { ...cursor.value, key: cursor.key }
        : cursor.value;
      allTodos.push(todo);
      cursor.continue();
    } else {
      displayTodos(allTodos);
    }
  };
  req.onerror = function (event) {
    alert("error in cursor request " + event.target.errorCode);
  };
}
function toggleTodo(db, id) {
  let checked = document.getElementById(id).checked;
  let transaction = db.transaction(["todos"], "readwrite");
  let objectStore = transaction.objectStore("todos");

  let req = objectStore.get(id);
  req.onsuccess = function () {
    let todo = req.result;
    if (todo) {
      todo.check = checked;
      const updateReq = objectStore.put(todo, id);
      console.log(
        "The transaction that originated this request is " +
          updateReq.transaction
      );
      updateReq.onsuccess = () => {
        console.log("Todo toggled");
      };
    } else {
      console.error("Todo not found");
    }
  };
  req.onerror = function (event) {
    alert("Error toggling the todo" + event.target.errorCode);
  };
}

function displayTodos(todos) {
  let listHTML = "<ul>";
  for (const i in todos) {
    let todo = todos[i];
    listHTML +=
      "<li>" +
      `<input onchange="toggleTodo(db, ${todo.key})" type="checkbox" id=${
        todo.key
      } name=${todo.key} value=${todo.text} ${
        todo.check ? `checked="true"` : null
      }>` +
      todo.text +
      " " +
      new Date(todo.timestamp).toLocaleString() +
      "</li>";
  }
  document.getElementById("todos").innerHTML = listHTML;
}
