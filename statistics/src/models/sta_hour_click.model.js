const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ClickHourStaSchema = new Schema({
  group_id: {type: Schema.Types.ObjectId, ref: 'AdGroup'},
  ad_id: {type: Schema.Types.ObjectId, ref: 'Ad'},
  time: Date,
  auto_click_count: Number,
  auto_click_ip_count: Number,
  user_click_count: Number,
  user_click_ip_count: Number,
  createdAt: {type: Date, default: Date.now}
});

mongoose.model('ClickHourSta', ClickHourStaSchema);
