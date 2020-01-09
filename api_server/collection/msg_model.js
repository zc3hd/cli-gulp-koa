var mongoose = require('mongoose');

// 集合标识
var model_key = 'msg';

// 文档模型
var doc_model = new mongoose.Schema({
  // 留言
  info: String,
});

// 模型
module.exports = mongoose.model(model_key, doc_model, model_key);