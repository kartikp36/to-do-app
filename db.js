let db;
let dbReq = indexedDB.open("myDatabase", 1);
let level = 1,
  pages = 0;
dbReq.onupgradeneeded = function (event) {
  db = event.target.result;
  let todos = db.createObjectStore("todos", { autoIncrement: true });
};
dbReq.onsuccess = function (event) {
  db = event.target.result;
  getAndDisplayTodos(db);
};
dbReq.onerror = function (event) {
  alert("Error while opening database " + event.target.errorCode);
};

// function encodeHtml(str) {
//   return String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

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
    addTodo(db, `${task.value}`);
    task.value = "";
  }
}

function getAndDisplayTodos(db, level) {
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
      allTodos.sort(function (a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      allTodos.sort(function (a, b) {
        return a.check - b.check;
      });
      pages = allTodos.length;
      displayTodos(allTodos, level);
    }
  };
  req.onerror = function (event) {
    alert("error in cursor request " + event.target.errorCode);
  };
}

function toggleTodo() {
  let id = parseInt(this.id);
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
  const ul = document.createElement("ul");

  var counter = 1;
  for (const i in todos) {
    if (counter <= 10 * level) {
      todo = todos[i];
      const li = document.createElement("li");
      const input = document.createElement("input");
      input.onchange = toggleTodo;
      input.type = "checkbox";
      input.id = todo.key;
      input.className = todo.text;
      input.value = todo.text;
      input.label = todo.text;
      todo.check ? (input.checked = "true") : null;
      var label = document.createElement("label");
      label.htmlFor = todo.key;
      label.innerText =
        todo.text +
        "    " + 
        " (" +
        new Date(todo.timestamp).toLocaleString() +
        ")";
      li.appendChild(input);
      li.appendChild(label);
      ul.appendChild(li);
    }
    counter++;
  }
  document.getElementById("todos").innerHTML = "";
  document.getElementById("todos").appendChild(ul);
}

function loadMoreButton() {
  let listHTML =
    `<button id="load-btn" class="load-btn" onclick="loadMore()">` +
    `Load more` +
    "</button>";
  document.getElementById("loadmore").innerHTML = listHTML;
}

function loadMore() {
  level++;
  loadOnScroll();
  document.getElementById("loadmore").innerHTML = "";
}

window.onscroll = function (ev) {
  const difference = document.documentElement.scrollHeight - window.innerHeight;
  const scrollposition = document.documentElement.scrollTop;
  if (difference - scrollposition <= 0) {

  // console.log(window.innerHeight, window.pageYOffset, document.body.offsetHeight)
  // if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
    if (level >= pages / 10) {
      console.log("That's all the todos");
      return;
    } else if (level % 3 == 0) {
      console.log("3 levels Loadmore button here");
      loadMoreButton();
    } else {
      setTimeout(() => loadOnScroll(), 1000);
    }
    console.log("End reached");
  }
};

function loadOnScroll() {
  let transaction = db.transaction(["todos"], "readwrite");
  let objectStore = transaction.objectStore("todos");
  objectStore.onsuccess = function () {
    console.log(objectStore.result);
  };
  transaction.oncomplete = function () {
    console.log("New todos loaded");
    level++;
    console.log("Level:", level);
    getAndDisplayTodos(db, level);
  };
  transaction.onerror = function (event) {
    alert("Error while loading the todo " + event.target.errorCode);
  };
}
