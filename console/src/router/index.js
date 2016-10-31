const mount = require('koa-mount');
const router = require('koa-router')();
const admin = require('./admin');
const ad = require('./ad');
const sta2 = require('./sta2')

router.get('/login', admin.showLogin);
router.post('/login', admin.login);

router.get('/register', admin.showRegister);
router.post('/register', admin.register);

router.all('/*', admin.loginRequired);
router.get('/', ctx => ctx.render('console/index'))

router.get('/ad', ad.adList);
router.get('/ad/create', ad.showCreateAd);
router.post('/ad/create', ad.createAd);
router.get('/ad/edit/:id', ad.showEditAd);
router.post('/ad/edit/:id', ad.editAd);

router.get('/url/create/:ad_id', ad.showCreateUrl);
router.post('/url/create/:ad_id', ad.createUrl);
router.get('/url/edit/:id', ad.showEditUrl);
router.post('/url/edit/:id', ad.editUrl);

router.get('/group', ad.groupList);
router.get('/group/create', ad.showCreateGroup);
router.post('/group/create', ad.createGroup);
router.get('/group/edit/:id', ad.showEditGroup);
router.post('/group/edit/:id', ad.editGroup);

router.get('/sta/day/show', sta2.showDayList);
router.get('/sta/day/click', sta2.clickDayList);
router.get('/sta/hour/show', sta2.showHourList);
router.get('/sta/hour/click', sta2.clickHourList);
router.get('/sta/realtime/show', sta2.realtime_show);
router.get('/sta/realtime/click', sta2.realtime_click);

export default function configRoutes(app) {
  app.use(mount('/console', router.routes()));
}