/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/db.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/db.js":
/*!*******************!*\
  !*** ./src/db.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };\n\nvar db = void 0;\nvar dbReq = indexedDB.open(\"myDatabase\", 1);\nvar level = 1,\n    pages = 0;\ndbReq.onupgradeneeded = function (event) {\n  db = event.target.result;\n  var todos = db.createObjectStore(\"todos\", { autoIncrement: true });\n};\ndbReq.onsuccess = function (event) {\n  db = event.target.result;\n  getAndDisplayTodos(db);\n};\ndbReq.onerror = function (event) {\n  alert(\"Error while opening database \" + event.target.errorCode);\n};\n\n// function encodeHtml(str) {\n//   return String(str)\n//     .replace(/&/g, \"&amp;\")\n//     .replace(/</g, \"&lt;\")\n//     .replace(/>/g, \"&gt;\")\n//     .replace(/\"/g, \"&quot;\");\n// }\n\nfunction addTodo(db, task) {\n  var transaction = db.transaction([\"todos\"], \"readwrite\");\n  var objectStore = transaction.objectStore(\"todos\");\n  var todo = { text: task, check: false, timestamp: Date.now() };\n  objectStore.add(todo);\n\n  objectStore.onsuccess = function () {\n    console.log(objectStore.result);\n  };\n  transaction.oncomplete = function () {\n    console.log(\"objectStored your new todo task!\");\n    getAndDisplayTodos(db);\n  };\n  transaction.onerror = function (event) {\n    alert(\"Error while storing the todo \" + event.target.errorCode);\n  };\n}\n\nwindow.submitTodo = function submitTodo() {\n  var task = document.getElementById(\"input-text\");\n  if (!task.value) {\n    console.error(\"Please enter a task\");\n  } else {\n    addTodo(db, \"\" + task.value);\n    task.value = \"\";\n  }\n};\n\nfunction getAndDisplayTodos(db, level) {\n  var transaction = db.transaction([\"todos\"], \"readwrite\");\n  var objectStore = transaction.objectStore(\"todos\");\n\n  var req = objectStore.openCursor();\n  var allTodos = [];\n\n  req.onsuccess = function (event) {\n    var cursor = event.target.result;\n    if (cursor != null) {\n      var todo = !cursor.value.key ? _extends({}, cursor.value, { key: cursor.key }) : cursor.value;\n      allTodos.push(todo);\n      cursor.continue();\n    } else {\n      allTodos.sort(function (a, b) {\n        return new Date(b.timestamp) - new Date(a.timestamp);\n      });\n      allTodos.sort(function (a, b) {\n        return a.check - b.check;\n      });\n      pages = allTodos.length;\n      displayTodos(allTodos, level);\n    }\n  };\n  req.onerror = function (event) {\n    alert(\"error in cursor request \" + event.target.errorCode);\n  };\n}\n\nfunction toggleTodo() {\n  var id = parseInt(this.id);\n  var checked = document.getElementById(id).checked;\n  var transaction = db.transaction([\"todos\"], \"readwrite\");\n  var objectStore = transaction.objectStore(\"todos\");\n\n  var req = objectStore.get(id);\n  req.onsuccess = function () {\n    var todo = req.result;\n    if (todo) {\n      todo.check = checked;\n      var updateReq = objectStore.put(todo, id);\n      console.log(\"The transaction that originated this request is \" + updateReq.transaction);\n      updateReq.onsuccess = function () {\n        console.log(\"Todo toggled\");\n      };\n    } else {\n      console.error(\"Todo not found\");\n    }\n  };\n  req.onerror = function (event) {\n    alert(\"Error toggling the todo\" + event.target.errorCode);\n  };\n}\n\nfunction displayTodos(todos) {\n  var ul = document.createElement(\"ul\");\n\n  var counter = 1;\n  for (var i in todos) {\n    if (counter <= 10 * level) {\n      var todo = todos[i];\n      var li = document.createElement(\"li\");\n      var input = document.createElement(\"input\");\n      input.onchange = toggleTodo;\n      input.type = \"checkbox\";\n      input.id = todo.key;\n      input.className = todo.text;\n      input.value = todo.text;\n      input.label = todo.text;\n      todo.check ? input.checked = \"true\" : null;\n      var label = document.createElement(\"label\");\n      label.htmlFor = todo.key;\n      label.className = \"label\";\n      label.innerText = todo.text + \"    \" + \" (\" + new Date(todo.timestamp).toLocaleString() + \")\";\n      li.appendChild(input);\n      li.appendChild(label);\n      ul.appendChild(li);\n    }\n    counter++;\n  }\n  document.getElementById(\"todos\").innerHTML = \"\";\n  document.getElementById(\"todos\").appendChild(ul);\n}\n\nwindow.loadMore = function loadMore() {\n  level++;\n  loadOnScroll();\n  document.getElementById(\"loadmore\").innerHTML = \"\";\n};\n\nfunction loadMoreButton() {\n  var listHTML = \"<button id=\\\"load-btn\\\" class=\\\"load-btn\\\" onclick=\\\"loadMore()\\\">\" + \"Load more\" + \"</button>\";\n  document.getElementById(\"loadmore\").innerHTML = listHTML;\n}\n\nwindow.onscroll = function (ev) {\n  var difference = document.documentElement.scrollHeight - window.innerHeight;\n  var scrollposition = document.documentElement.scrollTop;\n  if (difference - scrollposition <= 0) {\n    // console.log(window.innerHeight, window.pageYOffset, document.body.offsetHeight)\n    // if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {\n    if (level >= pages / 10) {\n      console.log(\"That's all the todos\");\n      return;\n    } else if (level % 3 == 0) {\n      console.log(\"3 levels Loadmore button here\");\n      loadMoreButton();\n    } else {\n      setTimeout(function () {\n        return loadOnScroll();\n      }, 1000);\n    }\n    console.log(\"End reached\");\n  }\n};\n\nfunction loadOnScroll() {\n  var transaction = db.transaction([\"todos\"], \"readwrite\");\n  var objectStore = transaction.objectStore(\"todos\");\n  objectStore.onsuccess = function () {\n    console.log(objectStore.result);\n  };\n  transaction.oncomplete = function () {\n    console.log(\"New todos loaded\");\n    level++;\n    console.log(\"Level:\", level);\n    getAndDisplayTodos(db, level);\n  };\n  transaction.onerror = function (event) {\n    alert(\"Error while loading the todo \" + event.target.errorCode);\n  };\n}\n\n//# sourceURL=webpack:///./src/db.js?");

/***/ })

/******/ });