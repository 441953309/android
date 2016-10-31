const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ShowRecordSchema = new Schema({
  group_id:{type: Schema.Types.ObjectId, ref: 'AdGroup'},
  ip: String,
  createdAt: {type: Date, default: Date.now}
});

mongoose.model('ShowRecord', ShowRecordSchema);
