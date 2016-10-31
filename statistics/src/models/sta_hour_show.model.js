const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ShowHourStaSchema = new Schema({
  group_id: {type: Schema.Types.ObjectId, ref: 'AdGroup'},
  time: Date,
  show_count: Number,
  show_ip_count: Number,
  createdAt: {type: Date, default: Date.now}
});

mongoose.model('ShowHourSta', ShowHourStaSchema);
