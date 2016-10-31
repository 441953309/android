const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ClickRecordSchema = new Schema({
  group_id:{type: Schema.Types.ObjectId, ref: 'AdGroup'},
  ad_id:{type: Schema.Types.ObjectId, ref: 'Ad'},
  ip: String,
  auto: Boolean,
  createdAt: {type: Date, default: Date.now}
});

mongoose.model('ClickRecord', ClickRecordSchema);
