const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp');
const crypto = require('crypto');

const AdminSchema = new Schema({
  username: {type: String, required: true, unique: true, lowercase: true},
  hashedPassword: {type: String, required: true},
  salt: {type: String, required: true},
  disable: {type: Boolean, default: true}
});

AdminSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password)
  })
  .get(function () {
    return this._password;
  });


AdminSchema.methods = {
  //验证用户密码
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },
  //生成盐
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },
  //生成密码
  encryptPassword: function (password) {
    if (!password || !this.salt) return '';
    const salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');
  }
}

AdminSchema.plugin(timestamps);

mongoose.model('Admin', AdminSchema);
