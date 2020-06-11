#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const beautify = require("js-beautify");
const userConfig = require(path.resolve("./tiny-webpack.config.js"));

// 默认配置
const defaultConfig = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
  },
};

// 最终配置
const config = { ...defaultConfig, ...userConfig };

class TinyWebpack {
  constructor(config) {
    this.config = config;
    this.entry = config.entry;
    // 当前工作目录
    this.root = process.cwd();
    this.modules = {};
  }

  /**
   * 执行打包
   */
  start() {
    console.log("My Webpack Start", this.config);
    const entryPath = path.resolve(this.root, this.entry);
    // 生成依赖关系图
    this.createModules(entryPath, this.entry);
    // 生成bundle
    this.createBundle();
  }

  /**
   * 创建模块
   * @param {String} modulePath 模块绝对路径
   * @param {String} moduleName 模块名称（或相对路径）
   */
  createModules(modulePath, moduleName) {
    const moduleContent = fs.readFileSync(modulePath, "utf-8");
    const { code, deps } = this.parse(moduleContent, moduleName);
    if (!this.modules[moduleName]) {
      this.modules[moduleName] = {
        code,
        deps,
      };
    }

    // 递归的获取依赖
    if (deps.length > 0) {
      for (const dep of deps) {
        const absPath = path.resolve(this.root, dep);
        this.createModules(absPath, dep);
      }
    }
  }

  /**
   * 解析模块的依赖
   * @param {String} code 模块代码
   * @param {any} parent 模块所在相对路径
   */
  parse(moduleContent, moduleName) {
    const parent = path.dirname(moduleName);
    let requireRegex = /require\(['"](.*)['"]\)/g;
    let exportsRegex = /module.exports/;
    const deps = [];
    // 将 require('**') => __webpack_require__([moduleName])
    let code = moduleContent.replace(requireRegex, function (match, $1) {
      // 依赖模块相对路径
      const depPath = path.join(parent, $1.replace(/'|"/g, ""));
      deps.push(depPath);
      return `__webpack_require__('${depPath}')`;
    });
    if (!code.match(exportsRegex) && moduleName !== this.entry) {
      code = `module.exports = function(){${code}}`;
    }

    return { code, deps };
  }

  /**
   * 生成bundle文件
   */
  createBundle() {
    let modules = "";
    for (const name in this.modules) {
      modules += `
        "${name}": function(module, exports, __webpack_require__){
          ${this.modules[name].code}
        },
      `;
    }
    const bundle = `
      (function(modules){
        function __webpack_require__(moduleId) {
          var module = {
            i: moduleId,
            exports: {},
          };
          modules[moduleId].call(
            module.exports,
            module,
            module.exports,
            __webpack_require__
          );
          return module.exports;
        }
        return __webpack_require__("${this.entry}");
      })({${modules}})
    `;

    const { path: distPath, filename } = this.config.output;
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
    }
    fs.writeFileSync(
      path.resolve(distPath, filename),
      beautify(bundle, { indent_size: 2, preserve_newlines: false })
    );
  }
}

const tinyWebpack = new TinyWebpack(config);
tinyWebpack.start();
