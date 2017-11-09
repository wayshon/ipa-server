const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

const fs = require('fs');
const path = require('path');
const plist = require('plist');
const process = require('child_process');
 
let dealFun = () => {
  let originFile = fs.readFileSync(path.join(__dirname,'/public/plist-file/tempInfo.plist'), 'utf8');

  // 删除tempInfo文件
  fs.unlink(path.join(__dirname,'/public/plist-file/tempInfo.plist'),err => {
    err && console.log(err)
  });
  let originObj = plist.parse(originFile),
      CFBundleDisplayName = originObj.CFBundleDisplayName,
      CFBundleShortVersionString = originObj.CFBundleShortVersionString,
      CFBundleIdentifier = originObj.CFBundleIdentifier;
  
  let targetFile = fs.readFileSync(path.join(__dirname,'/public/plist-file/manifest.plist'), 'utf8')
  let targetObj = plist.parse(targetFile);
  targetObj.items[0].metadata.title = CFBundleDisplayName;
  targetObj.items[0].metadata['bundle-version'] = CFBundleShortVersionString;
  targetObj.items[0].metadata['bundle-identifier'] = CFBundleIdentifier;
  targetObj.items[0].assets[0].url = 'https://wayshon.com/ipa/RTN/RTN.ipa';
  
  let targetPlist = plist.build(targetObj)
  console.log(targetPlist)
  
  if (!fs.existsSync(path.join(__dirname,'/public/plist-file'))) {
    fs.mkdirSync(path.join(__dirname,'/public/plist-file'));
  }
    
  fs.writeFile(path.join(__dirname,'/public/plist-file/targetPlist.plist'), targetPlist, error => {
    if (error) {
        throw(error)
    } else {
        console.log('write finish')
    }
  });
}

let cmd = `plistutil -i ${path.join(__dirname,'/public/plist-file/Info.plist')} -o ${path.join(__dirname,'/public/plist-file/tempInfo.plist')}`

process.exec(cmd, (error, stdout, stderr) => {
  if (error !== null) {
    console.log('exec error: ' + error);
  }
  dealFun();
});

module.exports = app
