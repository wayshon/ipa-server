const fs = require('fs'),
    tool = require("../utils/Tools"),
    adm_zip = require('adm-zip'),
    childProcess = require('child_process'),
    plist = require('plist'),
    cwdPath = process.cwd();

class UtilsController {
    async upload(ctx, next) {
        let req = ctx.request.body,
            ipa = req.files.ipa;

        let projectName = ipa.name.split('.')[0];

        let folder = `/root/html-file/home-page/ipa/${projectName}`,
            filePath = `${folder}/${ipa.name}`,
            tempPath = `${cwdPath}/public/temp`;

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        let reader = fs.createReadStream(ipa.path),
            stream = fs.createWriteStream(filePath);
        reader.pipe(stream);

        let ipaPath =  `https://wayshon.com/ipa/${projectName}/${ipa.name}`

        new adm_zip(ipa.path).extractAllTo(tempPath, true);
        
        let plistPath = `${process.cwd()}/public/temp/Payload/ctripzhuanche.app`;

        let CFBundleDisplayName = await creatPlist(plistPath, folder, ipaPath);

        // 删除temp里的文件
        childProcess.exec(`rm -rf ${tempPath}/${ipa.name}`, (error, stdout, stderr) => {
            error && console.log(error)
        });

        // ctx.body = {
        //     manifest: `http://wayshon.com:3344/ipa/${projectName}/manifest.plist`,
        //     ipaPath: ipaPath
        // }

        // await ctx.render('download', {
        //     title: CFBundleDisplayName,
        //     manifest: `https://wayshon.com/ipa/${projectName}/manifest.plist`,
        // })

        let url = `tms-services://?action=download-manifest&url=https://wayshon.com/ipa/${projectName}/manifest.plist`

        ctx.response.body = fs.createReadStream(`/root/html-file/home-page/ipa/download.html?path=${encodeURI(url)}`);
    }
}

let dealFun = async (plistPath, targetPath, ipaPath) => {
    let originFile = fs.readFileSync(`${plistPath}/tempInfo.plist`, 'utf8');

    // 删除tempInfo文件
    fs.unlink(`${plistPath}/tempInfo.plist`, err => {
        err && console.log(err)
    });
    let originObj = plist.parse(originFile),
        CFBundleDisplayName = originObj.CFBundleDisplayName,
        CFBundleShortVersionString = originObj.CFBundleShortVersionString,
        CFBundleIdentifier = originObj.CFBundleIdentifier;

    let targetFile = fs.readFileSync(`${process.cwd()}/public/plist-file/model.plist`, 'utf8')
    let targetObj = plist.parse(targetFile);
    targetObj.items[0].metadata.title = CFBundleDisplayName;
    targetObj.items[0].metadata['bundle-version'] = CFBundleShortVersionString;
    targetObj.items[0].metadata['bundle-identifier'] = CFBundleIdentifier;
    // TODO:ADDR
    targetObj.items[0].assets[0].url = ipaPath;

    let manifest = plist.build(targetObj)
    // console.log(manifest)

    await writeFile(plistPath, targetPath, manifest);
    return CFBundleDisplayName;
}

let exec = async (plistPath) => {
    return new Promise((resolve, reject) => {
        let cmd = `plistutil -i ${plistPath}/Info.plist -o ${plistPath}/tempInfo.plist`
        
        childProcess.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            }
            resolve()
        });
    })
}

let writeFile = (plistPath, targetPath, manifest) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(`${targetPath}/manifest.plist`, manifest, error => {
            if (error) {
                reject(error)
            } else {
                resolve()
            }
        });
    })
}

let creatPlist = async (plistPath, targetPath, ipaPath) => {
    await exec(plistPath);
    let CFBundleDisplayName = await dealFun(plistPath, targetPath, ipaPath);
    return CFBundleDisplayName;
}


module.exports = new UtilsController();
