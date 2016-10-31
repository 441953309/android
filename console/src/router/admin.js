var validator = require('validator');
const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');

export async function loginRequired(ctx, next) {
  if (ctx.session.admin) {
    await next();
  } else {
    ctx.redirect('/console/login');
  }
}

export async function showRegister(ctx) {
  await ctx.render('console/admin/register');
}

export async function register(ctx) {
  var name = validator.trim(ctx.body.name);
  var pass = validator.trim(ctx.body.pass);
  var re_pass = validator.trim(ctx.body.re_pass);

  if (!name || !pass || !re_pass) return ctx.render('console/admin/register', {error: '信息不完整。', name: name});
  if (name.length < 6) return ctx.render('console/admin/register', {error: '用户名至少需要5个字符。', name: name});
  if (!validator.isAlphanumeric(name)) return ctx.render('console/admin/register', {error: '用户名只能使用0-9，a-z，A-Z。', name: name});
  if (pass !== re_pass) return ctx.render('console/admin/register', {error: '两次输入密码不一致。', name: name});

  let admin = await Admin.findOne({username: name});
  if (admin) return ctx.render('console/admin/register', {error: '用户名已被使用。', name: name});

  let disable = true;
  if (name === '441953309' || name === 'xiaopeng') disable = false;

  const newAdmin = await Admin({username: name, password: pass, disable});
  await newAdmin.save();
  return ctx.render('console/admin/register', {success: '注册成功'});
}

export async function showLogin(ctx) {
  await ctx.render('console/admin/login');
}

export async function login(ctx) {
  var name = validator.trim(ctx.body.name);
  var pass = validator.trim(ctx.body.pass);

  if (!name || !pass) return ctx.render('console/admin/login', {error: '信息不完整。', name: name});

  const admin = await Admin.findOne({username: name});
  if (!admin || !admin.authenticate(pass))return ctx.render('console/admin/login', {error: '用户名或密码错误。', name: name});

  if (admin.disable)return ctx.render('console/admin/login', {error: '用户已被禁用。', name: name});

  ctx.session.admin = admin;
  ctx.redirect('/console');
}
