# cli-gulp-koa

## 前言

* 构建：
  * `gulp3.9.1`
  * `koa@2.7.0`  `mongoose@5.3.13`

* **场景：**
  * 前端：
    * 纯JS项目（例如：`JQ、vue`非脚手架项目）`MPA`多页面应用；
    * 联调公司后台；
  * 后台为：
    *  `koa`全栈开发；
* 特点：
  * 前端：
    * 无需指定测试目录地址；
    * 前端页面修改后，自动刷新；
    * 前端新增文件后，需要手动重启；
    * 支持与公司后台联调；
  * 后端：支持全栈开发时，后台服务修改后，自动重启；



## cli

```json
  "scripts": {
     // 前端与后台联调代码
    "web_proxy": "set NODE_ENV=web_proxy&& gulp",
      
     // 前端开发 热启动
    "web_only": "set NODE_ENV=web_only&& gulp",
      
     // 与前端形成简单联调测试，真实联调不开启
    "api_proxy": "set NODE_ENV=api_easy&& node ./api_server/app_auto.js",
    
     // 后台开发 热启动
    "api_only": "node ./api_server/app.js",
     
     // 前后端全部完成
     "all": "node ./api_server/app.js"
  },
```



## 前端：目录结构

- `webapp`  【打包编译后的目录，该目录结构必须与src_webapp保持一致，否则会有文件引用路径错误】
  - `moudles` 【所有的业务模块放入这个文件夹下面】
    - `page/` 【一个文件夹作为一个业务功能模块】
      - `imgs `【该模块的图片】
      - `index.html`
      - `index.less`
      - `index.js` 【把本功能模块需要的AP 配置 到 JS内部】
      - `test_data.js` 【模拟测试数据，用于和后台格式约定】
  - `scripts` 【项目中所有业务需要的公共的JS文件】
    - `common` 【公司自己维护的公共文件】
    - `libs` 【业务需要的其他JS文件，例如JQ，VUE等】
  - `index.html` 【项目的入口HTML文件】





## 前端：gulpfile.js 配置

```js
// 配置
var conf = {
  // 前端测试模式下的端口
  dev_port: 1010,

  // 后台 打包后/测试时 被代理的端口
  api_port: 1011,
};

// 1.形成配置项; 
//    src ：监听哪个目录下的文件；
//    dist: 打包的目录名称
//    libs：依赖文件的目录名称，需要复制
var opts = {
    // 监听哪个目录下的文件；
    src: 'src_webapp',
    // 依赖文件的目录名称，需要复制
    copy: "scripts",
    // 打包的目录名称
    dist: 'webapp',
};
```



## 前端：npm run web_only

* 内部执行核心：只是前端开启编译模式，不涉及后台API的请求；
* 适用场景：**页面功能HTML+CSS+JS 页面功能演示**

```js
switch (env) {
    case "web_proxy":
		// ...
        break;
    
    // 前端初始dev模式
    case "web_only":
        server_opts = {
            notify: false,
            // 服务器根目录
            server: path.resolve(__dirname, opts.dist),
            // 入口文件
            index: './index.html',
            // 服务端口
            port: conf.dev_port,
            // 打印连接日志
            logConnections: true
        };
        console.log("前端开发 热开启");
        break;
}
// 启动代理服务器。
browserSync.init(server_opts);
```





## 前端：npm run web_proxy

* 内部执行核心：
  * 前端开启编译模式，需要涉及后台API的请求；
  * **此时后台的API端口被代理，任何后台都可以；**
* 适用场景：
  * **页面功能完成，和公司后台进行调试**
  * gulp web_proxy模式的小问题：本地代理：`http://localhost:1010/demo_004/index.html` 也会找被代理服务上是否有这个文件，如果有就返回，只是返回，本地的服务器IP还是dev_port；如果没有开启被代理的服务器，页面加载不出来；

```js
switch (env) {
    // 代理后台
    case "web_proxy":
        // 前后端开发模式
        server_opts = {
            // 被代理的后台API端口
            proxy: 'http://localhost:' + conf.api_port,
            
            browser: 'chrome',
            notify: false,
            
            // gulp 前端的端口
            port: conf.dev_port
        };
        console.log("与后台联调模式 开启");
        break;
        
        
    case "web_only":
		// ...
        break;
}
// 启动代理服务器。
browserSync.init(server_opts);
```



## 后台：目录结构

- `api_server`  【后台的根目录】
  - `collection` 【前端的业务模块对应后台的数据库模型】
    - `xx_model.js` 【具体的数据库模型】
  - `moudles` 【前端的业务模块对应后台的设计的API文件】
    - `xx_api.js` 【每个模块对应设计的api文件】
  - `app_auto.js` 【测试模式入口文件，根据模式进入测试不同的文件】
  - `app_simple.js` 【前端联调时，简单地充当后台的服务】
  - `app.js`【后台开发时或者完成后，入口文件】
  - `conf.js`【后台的配置文件】



## 后台：`app_auto.js`

```js
var nodemon = require('gulp-nodemon');
var path = require('path');

var src;
var env = process.env.NODE_ENV;
switch (env) {
  // 简单的与前端联调
  case "api_simple":
    console.log("与前端简单联调测试 热开启");
    src = path.join(__dirname, './app_simple.js');
    break;

    // 后台开发模式
  case "api_only":
    console.log("后台开发 热启动");
    src = path.join(__dirname, './app.js');
    break;
};

nodemon({
  script: src,
  ignore: [
    path.join(__dirname, `../${conf.web_src}/`),
    path.join(__dirname, `../${conf.web_dist}/`),
    path.join(__dirname, '../gulpfile.js'),
  ],
  env: { 'NODE_ENV': 'development' }
});
```



## 后台：npm run api_proxy

* 前端开发完成后，需要与后台进行简单的联调；
* 若后台此时不能配合，该功能可简单的进行联调；

```js
var Koa = require('koa');
var static = require('koa-static');
var path = require('path');
var conf = require('./conf.js');

var app = new Koa();
app.use(static(path.join(__dirname, `../${conf.web_dist}/`)));


// 端口
var Router = require('koa-router');
var api = new Router();

// 配置post async语法
api
  .post('/api/js_demo/font.do', async function(ctx) {
    var size = Math.floor(Math.random() * 200);
    size = size < 60 ? 60 : size;
    var color = Math.floor(Math.random() * 1000000);

    ctx.body = {
      size: size,
      color: color,
    };

  });

// 装载
app
  .use(api.routes())
  .use(api.allowedMethods());

// 
app.listen(conf.api_port, function() {
  console.log("simple server is running at " + conf.api_port);
});
```



## 后台：npm run api_only

* 执行核心：后台开发热启动，完全是后台开发；





## 后台：npm run all

* 执行核心：前端开发完成，后台开发完成，在服务器上部署启动服务时；



