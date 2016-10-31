const mount = require('koa-mount');
const router = require('koa-router')();
const ad = require('./ad.js');
const adAndroid = require('./ad_android');

//iOS
router.get('/cnzz/:cnzz_id', ad.getCnzzHtml);
router.get('/d/:type/:group_id', ad.getAdDemo);   //获取广告demo
router.get('/s/:type/:group_id', ad.getAdScript); //获取广告js代码
router.get('/a/:group_id', ad.getAdGroup);        //获取广告内容
router.get('/j/:type/:group_id/:ad_id', ad.jump); //跳转链接

//api
router.get('/core/a/:group_id', ad.apiAdGroup); //API获取广告内容
router.get('/core/j/:type/:group_id/:ad_id', ad.apiJump); //API跳转链接

//Android
router.get('/an/cnzz/:cnzz_id', adAndroid.getCnzzHtml);
router.get('/an/d/:type/:group_id', adAndroid.getAdDemo);   //获取广告demo
router.get('/an/s/:type/:group_id', adAndroid.getAdScript); //获取广告js代码
router.get('/an/a/:group_id', adAndroid.getAdGroup);        //获取广告内容
router.get('/an/j/:type/:group_id/:ad_id', adAndroid.jump); //跳转链接

router.get('/', ctx => {
  ctx.body='123';
});

export default function configRoutes(app) {
  app.use(mount('/', router.routes()));
}

