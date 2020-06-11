(function(modules) {
  function __webpack_require__(moduleId) {
    var module = {
      i: moduleId,
      exports: {},
    };
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    return module.exports;
  }
  return __webpack_require__("./src/index.js");
})({
  "./src/index.js": function(module, exports, __webpack_require__) {
    const a = __webpack_require__('src/a.js');
    const c = __webpack_require__('src/module/c.js');
    a();
    console.log(c);
  },
  "src/a.js": function(module, exports, __webpack_require__) {
    module.exports = function() {
      const {
        name
      } = __webpack_require__('src/module/b.js');
      const {
        age
      } = __webpack_require__('src/module/c.js');
      console.log(`I am ${name}, and i am ${age}`);
    }
  },
  "src/module/b.js": function(module, exports, __webpack_require__) {
    module.exports = {
      name: 'bruce'
    }
  },
  "src/module/c.js": function(module, exports, __webpack_require__) {
    module.exports = {
      age: 30
    }
  },
})