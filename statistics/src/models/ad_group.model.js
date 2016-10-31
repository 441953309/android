const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp');

let AdGroupSchema = new Schema({
  name: String,
  des: String,
  isS: {type: Boolean, default: true},    //是否展示
  isA: {type: Boolean, default: true},    //是否自动点击
  isWX: {type: Boolean, default: false},  //是否微信渠道
  canClose: {type: Boolean, default: true},//是否显示关闭按钮
  ads: [{type: Schema.Types.ObjectId, ref: 'Ad'}],
  weight: {type: Number, default: 1},
  disable: {type: Boolean, default: false},
  cnzz_id: String
});

AdGroupSchema.plugin(timestamps);
mongoose.model('AdGroup', AdGroupSchema);
