"use strict";

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly &&
      (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })),
      keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2
      ? ownKeys(Object(source), !0).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(
          target,
          Object.getOwnPropertyDescriptors(source)
        )
      : ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(
            target,
            key,
            Object.getOwnPropertyDescriptor(source, key)
          );
        });
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var db;
var dbReq = indexedDB.open("myDatabase", 1);
var level = 1,
  pages = 0;

dbReq.onupgradeneeded = function (event) {
  db = event.target.result;
  var todos = db.createObjectStore("todos", {
    autoIncrement: true,
  });
};

dbReq.onsuccess = function (event) {
  db = event.target.result;
  getAndDisplayTodos(db);
};

dbReq.onerror = function (event) {
  alert("Error while opening database " + event.target.errorCode);
}; // function encodeHtml(str) {
//   return String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

function addTodo(db, task) {
  var transaction = db.transaction(["todos"], "readwrite");
  var objectStore = transaction.objectStore("todos");
  var todo = {
    text: task,
    check: false,
    timestamp: Date.now(),
  };
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
  var task = document.getElementById("input-text");

  if (!task.value) {
    console.error("Please enter a task");
  } else {
    addTodo(db, "".concat(task.value));
    task.value = "";
  }
}

function getAndDisplayTodos(db, level) {
  var transaction = db.transaction(["todos"], "readwrite");
  var objectStore = transaction.objectStore("todos");
  var req = objectStore.openCursor();
  var allTodos = [];

  req.onsuccess = function (event) {
    var _cursor = event.target.result;

    if (_cursor != null) {
      var _todo = !_cursor.value.key
        ? _objectSpread(
            _objectSpread({}, _cursor.value),
            {},
            {
              key: _cursor.key,
            }
          )
        : _cursor.value;

      allTodos.push(_todo);
      try {
        _cursor.continue();
      } catch (error) {
        console.log(error);
      }
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
    alert("error in _cursor request " + event.target.errorCode);
  };
}

function toggleTodo() {
  var id = parseInt(this.id);
  var checked = document.getElementById(id).checked;
  var transaction = db.transaction(["todos"], "readwrite");
  var objectStore = transaction.objectStore("todos");
  var req = objectStore.get(id);

  req.onsuccess = function () {
    var todo = req.result;

    if (todo) {
      todo.check = checked;
      var updateReq = objectStore.put(todo, id);
      console.log(
        "The transaction that originated this request is " +
          updateReq.transaction
      );

      updateReq.onsuccess = function () {
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
  var ul = document.createElement("ul");
  var counter = 1;

  for (var i in todos) {
    if (counter <= 10 * level) {
      var todo = todos[i];
      var li = document.createElement("li");
      var input = document.createElement("input");
      input.onchange = toggleTodo;
      input.type = "checkbox";
      input.id = todo.key;
      input.className = todo.text;
      input.value = todo.text;
      todo.check ? (input.checked = "true") : null;
      var ele = document.createElement("span");
      ele.innerText =
        "".concat(todo.text) +
        "    " +
        counter +
        " " +
        new Date(todo.timestamp).toLocaleString();
      li.appendChild(input);
      li.appendChild(ele);
      ul.appendChild(li);
    }

    counter++;
  }

  document.getElementById("todos").innerHTML = "";
  document.getElementById("todos").appendChild(ul);
}

function loadMoreButton() {
  var listHTML =
    '<button id="load-btn" class="load-btn" onclick="loadMore()">' +
    "Load more" +
    "</button>";
  document.getElementById("loadmore").innerHTML = listHTML;
}

function loadMore() {
  level++;
  loadOnScroll();
  document.getElementById("loadmore").innerHTML = "";
}
window.onscroll = function (ev) {
  // console.log(window.innerHeight, window.pageYOffset, document.body.scrollHeight)
  if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight) {
    if (level >= pages / 10) {
      console.log("That's all the todos");
      return;
    } else if (level % 3 == 0) {
      console.log("3 levels Loadmore button here");
      loadMoreButton();
    } else {
      setTimeout(function () {
        return loadOnScroll();
      }, 1000);
    }

    console.log("End reached");
  }
};

function loadOnScroll() {
  var transaction = db.transaction(["todos"], "readwrite");
  var objectStore = transaction.objectStore("todos");

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
