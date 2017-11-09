const fs = require('fs'),
    tool = require("../utils/Tools"),
    adm_zip = require('adm-zip'),
    childProcess = require('child_process'),
    plist = require('plist'),
    cwdPath = process.cwd();

let ipaPath = '';

class UtilsController {
    async upload(ctx, next) {
        let req = ctx.request.body,
            ipa = req.files.ipa;

        let date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            time = `${y}-${m}-${d}`;

        let folder = `${cwdPath}/public/ipa/${time}`,
            filePath = `${folder}/${ipa.name}`,
            tempPath = `${cwdPath}/public/temp`

        if (!fs.existsSync(`${cwdPath}/public/ipa/${time}`)) {
            fs.mkdirSync(`${cwdPath}/public/ipa/${time}`);
        }

        let reader = fs.createReadStream(ipa.path),
            stream = fs.createWriteStream(filePath);
        reader.pipe(stream);

        ipaPath =  `http://wayshon.com:3344/ipa/${time}/${ipa.name}`

        new adm_zip(ipa.path).extractAllTo(tempPath, true);
        
        let plistPath = `${process.cwd()}/public/temp/Payload/ctripzhuanche.app`,
            targetPath = `${process.cwd()}/public/ipa/${time}`;

        await creatPlist(plistPath, targetPath);

        // 删除temp里的文件
        childProcess.exec(`rm -rf ${tempPath}/${ipa.name}`, (error, stdout, stderr) => {
            error && console.log(error)
        });

        ctx.body = {
            msg: `http://wayshon.com:3344/ipa/${time}/manifest.plist`
        }
    }
}

let dealFun = async (plistPath, targetPath) => {
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
    console.log(manifest)

    await writeFile(plistPath, targetPath, manifest);
    return 1;
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

let creatPlist = async (plistPath, targetPath) => {
    await exec(plistPath);
    await dealFun(plistPath, targetPath);
    return 1;
}


module.exports = new UtilsController();
