const Koa = require('koa');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.db);
require('./models');
mongoose.Promise = global.Promise;

const app = new Koa();
require('./config/koa')(app);
require('./router')(app);

export default app;
