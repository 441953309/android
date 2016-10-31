var fs = require('fs');
var path = require('path');
var validator = require('validator');
const mongoose = require('mongoose');
const Ad = mongoose.model('Ad');
const AdUrl = mongoose.model('AdUrl');
const AdGroup = mongoose.model('AdGroup');

//ad
export async function adList(ctx) {
  const page = parseInt(ctx.query.page) > 0 ? parseInt(ctx.query.page) : 1;
  const perPage = parseInt(ctx.query.perPage) > 0 ? parseInt(ctx.query.perPage) : 50;
  const startRow = (page - 1) * perPage;

  const count = await Ad.count();
  const ads = await Ad.find({}).skip(startRow).limit(perPage).sort('disable -weight').populate('groups', 'name');

  const items = [];
  for (let ad of ads) {
    let item = ad.toObject();
    const urls = await AdUrl.find({adId: ad._id}).sort('-weight disable');

    let sum = 0;
    for(let url of urls){
      if(!url.disable) sum += url.weight;
    }

    item.urls = [];
    for(let url of urls){
      if(!url.disable){
        item.urls.push(`${url.name}(${Math.round(url.weight * 100 / sum)}%)`);
      }else{
        item.urls.push(`${url.name}(0%)`);
      }
    }

    items.push(item);
  }

  return ctx.render('console/ad/list', {items: items, page: {currentPage: page, total: Math.ceil(count / perPage), base: '/console/ad'}});
}

export async function showCreateAd(ctx) {
  const groups = await AdGroup.find({disable: false}).sort('-weight');
  return ctx.render('console/ad/edit', {groupList: groups});
}

export async function createAd(ctx) {
  const groups = await AdGroup.find({disable: false}).sort('-weight');
  if (!ctx.body.imgName) return ctx.render('console/ad/edit', {error: '请输入图片名称', groupList: groups});
  if (!ctx.body.url) return ctx.render('console/ad/edit', {error: '请输入链接', groupList: groups});

  const body = {};
  body.imgName = ctx.body.imgName;
  body.url = ctx.body.url;
  if (ctx.body.name)body.name = ctx.body.name;
  if (ctx.body.des)body.des = ctx.body.des;
  if (ctx.body.weight)body.weight = ctx.body.weight;
  body.isS = !!ctx.body.isS;
  body.isA = !!ctx.body.isA;
  body.isWX = !!ctx.body.isWX;
  body.disable = !!ctx.body.disable;
  body.isAll = !!ctx.body.isAll;

  body.groups = [];
  if (!body.isAll && ctx.body.groups) {
    if (ctx.body.groups instanceof Array) {
      for (let groupId of ctx.body.groups) {
        if (mongoose.Types.ObjectId.isValid(groupId))body.groups.push(groupId)
      }
    } else if (mongoose.Types.ObjectId.isValid(ctx.body.groups)) {//只选择一个的时候
      body.groups.push(ctx.body.groups)
    }
  }

  await Ad.create(body);
  return ctx.redirect('/console/ad');
}

export async function showEditAd(ctx) {
  var id = ctx.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});

  const ad = await Ad.findById(id);
  if (!ad)return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});

  const groups = await AdGroup.find({disable: false}).sort('-weight');
  const urls = await AdUrl.find({adId: id}).sort('-weight disable');
  return ctx.render('console/ad/edit', {action: 'edit', ad, groupList: groups, urlList: urls});
}

export async function editAd(ctx) {
  var id = ctx.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});

  const ad = await Ad.findById(id)
  if (!ad)return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});

  if (ctx.body.imgName)ad.imgName = ctx.body.imgName;
  if (ctx.body.url) ad.url = ctx.body.url;
  if (ctx.body.name)ad.name = ctx.body.name;
  if (ctx.body.des)ad.des = ctx.body.des;
  if (ctx.body.weight)ad.weight = ctx.body.weight;
  ad.isS = !!ctx.body.isS;
  ad.isA = !!ctx.body.isA;
  ad.isWX = !!ctx.body.isWX;
  ad.disable = !!ctx.body.disable;
  ad.isAll = !!ctx.body.isAll;

  const groups = [];
  if (!ad.isAll && ctx.body.groups) {
    if (ctx.body.groups instanceof Array) {
      for (let groupId of ctx.body.groups) {
        if (mongoose.Types.ObjectId.isValid(groupId))groups.push(groupId)
      }
    } else if (mongoose.Types.ObjectId.isValid(ctx.body.groups)) {//只选择一个的时候
      groups.push(ctx.body.groups)
    }
  }
  ad.groups = groups;

  await ad.save();

  return ctx.redirect('/console/ad');
}

//url
export async function showCreateUrl(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.ad_id)) ctx.throw(400);
  return ctx.render('console/ad_url/edit', {adId: ctx.params.ad_id});
}

export async function createUrl(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.ad_id)) ctx.throw(400);

  const body = {};
  body.adId = ctx.params.ad_id;
  if (ctx.body.name)body.name = ctx.body.name;
  if (ctx.body.des)body.des = ctx.body.des;
  if (ctx.body.url)body.url = ctx.body.url;
  if (ctx.body.weight)body.weight = ctx.body.weight;
  body.disable = !!ctx.body.disable;

  await AdUrl.create(body);
  return ctx.redirect(`/console/ad/edit/${ctx.params.ad_id}`);
}

export async function showEditUrl(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) ctx.throw(400);
  const url = await AdUrl.findById(ctx.params.id);
  return ctx.render('console/ad_url/edit', {action: 'edit', adId: url.adId, url});
}

export async function editUrl(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});
  const url = await AdUrl.findById(ctx.params.id)
  if (!url)return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});

  if (ctx.body.name)url.name = ctx.body.name;
  if (ctx.body.des)url.des = ctx.body.des;
  if (ctx.body.url) url.url = ctx.body.url;
  if (ctx.body.weight)url.weight = ctx.body.weight;
  url.disable = !!ctx.body.disable;

  await url.save();
  return ctx.redirect(`/console/ad/edit/${url.adId}`);
}

//group
export async function groupList(ctx) {
  const page = parseInt(ctx.query.page) > 0 ? parseInt(ctx.query.page) : 1;
  const perPage = parseInt(ctx.query.perPage) > 0 ? parseInt(ctx.query.perPage) : 50;
  const startRow = (page - 1) * perPage;

  const count = await AdGroup.count();
  const groups = await AdGroup.find({}).skip(startRow).limit(perPage).sort('disable -weight');

  const items = [];
  for (let group of groups) {
    let item = group.toObject();
    const ads = await Ad.find({disable: false, $or: [{isAll: true}, {groups: item._id}]}, 'name');
    item.ads = [];
    for (let ad of ads) {
      item.ads.push(ad.name);
    }
    items.push(item);
  }

  return ctx.render('console/ad_group/list', {items: items, page: {currentPage: page, total: Math.ceil(count / perPage), base: '/console/group'}});
}

export async function showCreateGroup(ctx) {
  return ctx.render('console/ad_group/edit');
}

export async function createGroup(ctx) {
  var name = validator.trim(ctx.body.name);
  if (!name) {
    const ads = await Ad.find({disable: false});
    return ctx.render('console/ad_group/edit', {error: '请输入渠道名称', adList: ads});
  }

  var des = validator.trim(ctx.body.des);
  var cnzz_id = validator.trim(ctx.body.cnzz_id);
  var weight = validator.trim(ctx.body.weight);
  var isS = !!ctx.body.isS;
  var isA = !!ctx.body.isA;
  var isWX = !!ctx.body.isWX;
  var canClose = !!ctx.body.canClose;
  var disable = !!ctx.body.disable;

  await AdGroup.create({name, des, cnzz_id, weight, disable, isS, isA, isWX, canClose});
  return ctx.redirect('/console/group');
}

export async function showEditGroup(ctx) {
  var id = ctx.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});

  const group = await AdGroup.findById(id)
  if (!group)return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});

  return ctx.render('console/ad_group/edit', {action: 'edit', group})
}

export async function editGroup(ctx) {
  var id = ctx.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});

  const group = await AdGroup.findById(id)
  if (!group)return ctx.render('console/notify/notify', {error: '此列表项不存在或已被删除。'});

  var name = validator.trim(ctx.body.name);
  if (name) group.name = name;

  var des = validator.trim(ctx.body.des);
  var cnzz_id = validator.trim(ctx.body.cnzz_id);
  var weight = validator.trim(ctx.body.weight);
  var isS = !!ctx.body.isS;
  var isA = !!ctx.body.isA;
  var isWX = !!ctx.body.isWX;
  var canClose = !!ctx.body.canClose;
  var disable = !!ctx.body.disable;

  group.des = des;
  group.cnzz_id = cnzz_id;
  group.weight = weight;
  group.isS = isS;
  group.isA = isA;
  group.isWX = isWX;
  group.canClose = canClose;
  group.disable = disable;

  await group.save();
  return ctx.redirect('/console/group');
}
