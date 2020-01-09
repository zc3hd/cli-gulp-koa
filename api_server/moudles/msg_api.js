const Router = require('koa-router');

function Msg_api(app, router) {
  var me = this;
  me.app = app;
  me.router = router;

  me.router_list = new Router();

  // 数据模型
  me.model_msg = require('../Models/msg_model.js');
}

Msg_api.prototype = {
  init: function() {
    var me = this;

    // 设计
    me.router_list
      .post('/all', async function(ctx) {
        // console.log(ctx.request.body);
        // 
        const data = await me._list_all();
        ctx.body = data;

      })
      .post('/add', async function(ctx) {
        const data = await me._list_add(ctx.request.body);
        ctx.body = data;
      })
      .post('/del', async function(ctx) {
        const data = await me._list_del(ctx.request.body);
        ctx.body = data;
      });

    // 设置前缀
    me.router.use('/api/list',
      me.router_list.routes(),
      me.router_list.allowedMethods());


    // 加载当前API
    me.app
      .use(me.router.routes())
      .use(me.router.allowedMethods());

  },
  _list_all: function() {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.model_msg
        .find()
        .sort({ '_id': -1 })
        .then(function(data) {
          resolve(data);
        });
    });
  },
  _list_add: function(obj) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.model_msg
        .create(obj)
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 
  _list_del: function(obj) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.model_msg
        .deleteOne(obj)
        .then(function(data) {
          resolve(data);
        });
    });
  }
};

module.exports = Msg_api;