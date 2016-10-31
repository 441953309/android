const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp');

let AdUrlSchema = new Schema({
  adId: {type: Schema.Types.ObjectId, ref: 'Ad'},
  name: String,
  des: String,
  url: String,
  weight: {type: Number, default: 1},
  disable: {type: Boolean, default: false}
});

AdUrlSchema.plugin(timestamps);
mongoose.model('AdUrl', AdUrlSchema);
