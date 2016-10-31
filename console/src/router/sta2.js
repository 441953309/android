const moment = require('moment');
const mongoose = require('mongoose');

const Ad = mongoose.model('Ad');
const AdGroup = mongoose.model('AdGroup');

const ShowRecord = mongoose.model('ShowRecord');
const ClickRecord = mongoose.model('ClickRecord');

const ShowHourSta = mongoose.model('ShowHourSta');
const ClickHourSta = mongoose.model('ClickHourSta');

export async function showDayList(ctx) {
  let date = moment();//默认今天
  if (ctx.query.date) {
    if (moment(ctx.query.date).isValid()) date = moment(ctx.query.date);
  }

  const jsDate = date.toDate();
  const startTime = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
  const endTime = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate() + 1);

  let staList = await ShowHourSta.aggregate()
    .match({time: {'$gte': startTime, '$lt': endTime}})
    .project({
      group_id: '$group_id',
      show_count: '$show_count',
      show_ip_count: '$show_ip_count',
    })
    .group({
      _id: {group_id: '$group_id'},
      show_count: {$sum: '$show_count'},
      show_ip_count: {$sum: '$show_ip_count'}
    });

  staList = await ShowHourSta.populate(staList, [{path: '_id.group_id', model: 'AdGroup'}]);

  return ctx.render('console/sta_day_show/list', {items: staList, date: date.format('YYYY-MM-DD'), page: {base: '/console/sta/day/show'}});
}

export async function clickDayList(ctx) {
  let date = moment();//默认今天
  if (ctx.query.date) {
    if (moment(ctx.query.date).isValid()) date = moment(ctx.query.date);
  }

  const jsDate = date.toDate();
  const startTime = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
  const endTime = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate() + 1);

  let staList = await ClickHourSta.aggregate()
    .match({time: {'$gte': startTime, '$lt': endTime}})
    .project({
      group_id: '$group_id',
      auto_click_count: '$auto_click_count',
      auto_click_ip_count: '$auto_click_ip_count',
      user_click_count: '$user_click_count',
      user_click_ip_count: '$user_click_ip_count',
    })
    .group({
      _id: {group_id: '$group_id'},
      auto_click_count: {$sum: '$auto_click_count'},
      auto_click_ip_count: {$sum: '$auto_click_ip_count'},
      user_click_count: {$sum: '$user_click_count'},
      user_click_ip_count: {$sum: '$user_click_ip_count'},
    });

  staList = await ClickHourSta.populate(staList, [{path: '_id.group_id', model: 'AdGroup'}]);

  return ctx.render('console/sta_day_click/list', {items: staList, date: date.format('YYYY-MM-DD'), page: {base: '/console/sta/day/click'}});
}

export async function showHourList(ctx) {
  let date = moment().subtract(1, 'h');//默认上一个小时
  if (ctx.query.date) {
    if (moment(ctx.query.date).isValid()) date = moment(ctx.query.date);
  }

  const jsDate = date.toDate();
  const time = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate(), jsDate.getHours());
  const staList = await ShowHourSta.find({time: time}).populate('group_id');

  return ctx.render('console/sta_hour_show/list', {items: staList, date: date.format('YYYY-MM-DD'), time: date.format('HH:00'), page: {base: '/console/sta/hour/show'}});
}

export async function clickHourList(ctx) {
  let date = moment().subtract(1, 'h');//默认上一个小时
  if (ctx.query.date) {
    if (moment(ctx.query.date).isValid()) date = moment(ctx.query.date);
  }

  const jsDate = date.toDate();
  const time = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate(), jsDate.getHours());

  let staList = await ClickHourSta.aggregate()
    .match({time: time})
    .project({
      ad_id: '$ad_id',
      auto_click_count: '$auto_click_count',
      auto_click_ip_count: '$auto_click_ip_count',
      user_click_count: '$user_click_count',
      user_click_ip_count: '$user_click_ip_count',
    })
    .group({
      _id: {ad_id: '$ad_id'},
      auto_click_count: {$sum: '$auto_click_count'},
      auto_click_ip_count: {$sum: '$auto_click_ip_count'},
      user_click_count: {$sum: '$user_click_count'},
      user_click_ip_count: {$sum: '$user_click_ip_count'},
    });

  staList = await ClickHourSta.populate(staList, [{path: '_id.ad_id', model: 'Ad'}]);

  return ctx.render('console/sta_hour_click/list', {items: staList, date: date.format('YYYY-MM-DD'), time: date.format('HH:00'), page: {base: '/console/sta/hour/click'}});
}

export async function realtime_show(ctx) {
  const date = moment();
  const jsDate = date.toDate();
  const time = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate(), jsDate.getHours());

  const showStaList = await ShowRecord.aggregate()
    .match({createdAt: {'$gte': time}})
    .project({
      group_id: '$group_id',
      ip: '$ip',
      year: {$year: '$createdAt'},
      month: {$month: '$createdAt'},
      date: {$dayOfMonth: '$createdAt'},
      hour: {$hour: "$createdAt"}
    })
    .group({
      _id: {group_id: '$group_id', year: '$year', month: '$month', date: '$date', hour: '$hour'},
      count: {$sum: 1},
      ips: {$addToSet: '$ip'}
    });

  const data = {};
  for (let showSta of showStaList) {
    if (!data[showSta._id.group_id]) data[showSta._id.group_id] = {};
    data[showSta._id.group_id].group_id = showSta._id.group_id;
    data[showSta._id.group_id].show_count = showSta.count;
    data[showSta._id.group_id].show_ip_count = showSta.ips.length;
  }

  const items = [];
  for (let group_id in data) {
    const group = await AdGroup.findById(group_id);
    data[group_id].group_name = group.name;
    data[group_id].group_isS = group.isS;
    data[group_id].group_isA = group.isA;
    data[group_id].group_disable = group.disable;
    items.push(data[group_id])
  }

  return ctx.render('console/sta_realtime_show/list', {items, date: date.format('YYYY-MM-DD'), time: date.format('HH:00'), page: {base: '/console/sta/realtime/show'}});
}

export async function realtime_click(ctx) {
  const date = moment();
  const jsDate = date.toDate();
  const time = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate(), jsDate.getHours());

  const autoClickStaList = await ClickRecord.aggregate()
    .match({createdAt: {'$gte': time}, auto: true})
    .project({
      ad_id: '$ad_id',
      ip: '$ip',
      year: {$year: '$createdAt'},
      month: {$month: '$createdAt'},
      date: {$dayOfMonth: '$createdAt'},
      hour: {$hour: "$createdAt"}
    })
    .group({
      _id: {ad_id: '$ad_id', year: '$year', month: '$month', date: '$date', hour: '$hour'},
      count: {$sum: 1},
      ips: {$addToSet: '$ip'}
    });

  const userClickStaList = await ClickRecord.aggregate()
    .match({createdAt: {'$gte': time}, auto: false})
    .project({
      ad_id: '$ad_id',
      ip: '$ip',
      year: {$year: '$createdAt'},
      month: {$month: '$createdAt'},
      date: {$dayOfMonth: '$createdAt'},
      hour: {$hour: "$createdAt"}
    })
    .group({
      _id: {ad_id: '$ad_id', year: '$year', month: '$month', date: '$date', hour: '$hour'},
      count: {$sum: 1},
      ips: {$addToSet: '$ip'}
    });

  const data = {};
  for (let autoClickSta of autoClickStaList) {
    if (!data[autoClickSta._id.ad_id]) data[autoClickSta._id.ad_id] = {};
    data[autoClickSta._id.ad_id].ad_id = autoClickSta._id.ad_id;
    data[autoClickSta._id.ad_id].auto_click_count = autoClickSta.count;
    data[autoClickSta._id.ad_id].auto_click_ip_count = autoClickSta.ips.length;
  }
  for (let userClickSta of userClickStaList) {
    if (!data[userClickSta._id.ad_id]) data[userClickSta._id.ad_id] = {};
    data[userClickSta._id.ad_id].ad_id = userClickSta._id.ad_id;
    data[userClickSta._id.ad_id].user_click_count = userClickSta.count;
    data[userClickSta._id.ad_id].user_click_ip_count = userClickSta.ips.length;
  }

  const items = [];
  for (let ad_id in data) {
    const ad = await Ad.findById(ad_id);
    data[ad_id].ad_name = ad.name;
    items.push(data[ad_id])
  }

  return ctx.render('console/sta_realtime_click/list', {items, date: date.format('YYYY-MM-DD'), time: date.format('HH:00'), page: {base: '/console/sta/realtime/click'}});
}

