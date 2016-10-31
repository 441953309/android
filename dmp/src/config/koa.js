const convert = require('koa-convert');
const cors = require('koa-cors');
const userAgent = require('koa-useragent');

export default function configKoa(app) {
  app.use(convert(cors()));
  app.use(convert(userAgent()));

  app.on('error', err => console.error(err));
}
