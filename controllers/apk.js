const fs = require('fs'),
      tool = require("../utils/Tools"),
      adm_zip = require('adm-zip'),
      childProcess = require('child_process'),
      plist = require('plist'),
      cwdPath = process.cwd();

class UtilsController {
    async upload(ctx, next) {
        try {
            let req = ctx.request.body,
                apk = req.files.apk;

            let projectName = '';

            let nameArr = apk.name.split('.');
            for (let i = 0; i < nameArr.length - 1; i++) {
                projectName += nameArr[0];
            }

            console.log(projectName)
            console.log(nameArr[nameArr.length - 1])

            if (!projectName || nameArr[nameArr.length - 1] != 'apk') {
                return ctx.body = {
                    msg: '给我传apk包好嘛！'
                }
            }

            let folder = `/root/html-file/home-page/apk`,
                filePath = `${folder}/${apk.name}`;

            // let folder = `${process.cwd()}/public/apk`,
            //     filePath = `${folder}/${apk.name}`;


            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder);
            }

            let reader = fs.createReadStream(apk.path),
                stream = fs.createWriteStream(filePath);
            reader.pipe(stream);

            let apkPath =  `https://wayshon.com/apk/${apk.name}`;
            let imgUrl = await tool.getQRCodeUrl(apkPath),
                qrImgUrl = imgUrl.replace('image/png', 'image/octet-stream');

            await ctx.render('download', {
                title: "下载app",
                qrImgUrl: qrImgUrl,
                pageUrl: apkPath
            })
        } catch (e) {
            console.log(e)
            ctx.body = {
                code: 500,
                msg: JSON.stringify(e)
            }
        }
    }
}




module.exports = new UtilsController();
