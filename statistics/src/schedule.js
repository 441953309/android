require("babel-core/register");

const schedule = require('node-schedule');
const moment = require('moment');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.db);
require('./models');
mongoose.Promise = global.Promise;

const Ad = mongoose.model('Ad');
const AdGroup = mongoose.model('AdGroup');
const ShowRecord = mongoose.model('ShowRecord');
const ClickRecord = mongoose.model('ClickRecord');

const ShowHourSta = mongoose.model('ShowHourSta');
const ClickHourSta = mongoose.model('ClickHourSta');

async function staHourShow(time) {
  try {
    const startTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours());
    const endTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours() + 1);

    if (moment().isBefore(endTime))throw 'This time is not in the past!';

    const hourSta = await ShowHourSta.findOne({time: startTime});
    if (hourSta)throw 'This time has been statistics!';

    const showStaList = await ShowRecord.aggregate()
      .match({createdAt: {'$gte': startTime, '$lt': endTime}})
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
      data[showSta._id.group_id].time = startTime;
      data[showSta._id.group_id].group_id = showSta._id.group_id;
      data[showSta._id.group_id].show_count = showSta.count;
      data[showSta._id.group_id].show_ip_count = showSta.ips.length;
    }

    for (let group_id in data) {
      await ShowHourSta.create(data[group_id]);
    }
  } catch (err) {
    console.error(err);
  }
}

async function staHourClick(time) {
  try {
    const startTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours());
    const endTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours() + 1);

    if (moment().isBefore(endTime))throw 'This time is not in the past!';

    const hourSta = await ClickHourSta.findOne({time: startTime});
    if (hourSta)throw 'This time has been statistics!';

    const autoClickStaList = await ClickRecord.aggregate()
      .match({createdAt: {'$gte': startTime, '$lt': endTime}, auto: true})
      .project({
        group_id: '$group_id',
        ad_id: '$ad_id',
        ip: '$ip',
        year: {$year: '$createdAt'},
        month: {$month: '$createdAt'},
        date: {$dayOfMonth: '$createdAt'},
        hour: {$hour: "$createdAt"}
      })
      .group({
        _id: {group_id: '$group_id', ad_id: '$ad_id', year: '$year', month: '$month', date: '$date', hour: '$hour'},
        count: {$sum: 1},
        ips: {$addToSet: '$ip'}
      });

    const userClickStaList = await ClickRecord.aggregate()
      .match({createdAt: {'$gte': startTime, '$lt': endTime}, auto: false})
      .project({
        group_id: '$group_id',
        ad_id: '$ad_id',
        ip: '$ip',
        year: {$year: '$createdAt'},
        month: {$month: '$createdAt'},
        date: {$dayOfMonth: '$createdAt'},
        hour: {$hour: "$createdAt"}
      })
      .group({
        _id: {group_id: '$group_id', ad_id: '$ad_id', year: '$year', month: '$month', date: '$date', hour: '$hour'},
        count: {$sum: 1},
        ips: {$addToSet: '$ip'}
      });

    const data = {};
    for (let autoClickSta of autoClickStaList) {
      if (!data[autoClickSta._id.group_id]) data[autoClickSta._id.group_id] = {};
      if (!data[autoClickSta._id.group_id][autoClickSta._id.ad_id]) data[autoClickSta._id.group_id][autoClickSta._id.ad_id] = {};
      data[autoClickSta._id.group_id][autoClickSta._id.ad_id].time = startTime;
      data[autoClickSta._id.group_id][autoClickSta._id.ad_id].group_id = autoClickSta._id.group_id;
      data[autoClickSta._id.group_id][autoClickSta._id.ad_id].ad_id = autoClickSta._id.ad_id;
      data[autoClickSta._id.group_id][autoClickSta._id.ad_id].auto_click_count = autoClickSta.count;
      data[autoClickSta._id.group_id][autoClickSta._id.ad_id].auto_click_ip_count = autoClickSta.ips.length;
    }
    for (let userClickSta of userClickStaList) {
      if (!data[userClickSta._id.group_id]) data[userClickSta._id.group_id] = {};
      if (!data[userClickSta._id.group_id][userClickSta._id.ad_id]) data[userClickSta._id.group_id][userClickSta._id.ad_id] = {};
      data[userClickSta._id.group_id][userClickSta._id.ad_id].time = startTime;
      data[userClickSta._id.group_id][userClickSta._id.ad_id].group_id = userClickSta._id.group_id;
      data[userClickSta._id.group_id][userClickSta._id.ad_id].ad_id = userClickSta._id.ad_id;
      data[userClickSta._id.group_id][userClickSta._id.ad_id].user_click_count = userClickSta.count;
      data[userClickSta._id.group_id][userClickSta._id.ad_id].user_click_ip_count = userClickSta.ips.length;
    }

    for (let group_id in data) {
      for (let ad_id in data[group_id]) {
        await ClickHourSta.create(data[group_id][ad_id]);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function sta() {
  const now = new Date();
  console.log('sta : ' + now);
  
  for (let i = 1; i < 300; i++) {
    let time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - i);
    let showHourSta = await ShowHourSta.findOne({time: time});
    let clickHourSta = await ClickHourSta.findOne({time: time});
    if (showHourSta && clickHourSta) break;
    console.log('Hour: ' + time);
    await staHourShow(time);
    await staHourClick(time);
  }

  //删除3个小时之前的明细数据
  let time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 3);
  let showHourSta = await ShowHourSta.findOne({time: time});
  let clickHourSta = await ClickHourSta.findOne({time: time});
  if (showHourSta && clickHourSta) {
    console.log(new Date() + ' : Remove Record: ' + time);
    await ShowRecord.remove({createdAt: {'$lt': time}});
    await ClickRecord.remove({createdAt: {'$lt': time}});
    console.log(new Date() + ' : Remove Record: complete');
  }
}

var rule = new schedule.RecurrenceRule();
rule.minute = 10;
schedule.scheduleJob(rule, function () {
  sta();
});