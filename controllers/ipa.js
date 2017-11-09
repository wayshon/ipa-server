const fs = require('fs'),
    tool = require("../utils/Tools"),
    unzip = require("unzip"),
    childProcess = require('child_process'),
    plist = require('plist');

class UtilsController {
    async upload(ctx, next) {
        let req = ctx.request.body,
            ipa = req.files.ipa;

        let date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            time = `${y}-${m}-${d}`;

        let folder = `${process.cwd()}/public/ipa/${time}`,
            filePath = `${folder}/${ipa.name}`

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        // let reader = fs.createReadStream(ipa.path),
        //     stream = fs.createWriteStream(filePath);
        // reader.pipe(stream);

        fs.createReadStream(ipa.path).pipe(unzip.Extract({ path: filePath }));

        await creatPlist(`public/ipa/${time}/Payload/ctripzhuanche.app`);

        ctx.body = {
            msg: `http://wayshon.com:3344/ipa/${time}/Payload/ctripzhuanche.app/targetPlist.plist`
        }
    }
}

let dealFun = async (plistPath) => {
    let originFile = fs.readFileSync(`${plistPath}/tempInfo.plist`, 'utf8');

    // 删除tempInfo文件
    fs.unlink(`${plistPath}/tempInfo.plist`, err => {
        err && console.log(err)
    });
    let originObj = plist.parse(originFile),
        CFBundleDisplayName = originObj.CFBundleDisplayName,
        CFBundleShortVersionString = originObj.CFBundleShortVersionString,
        CFBundleIdentifier = originObj.CFBundleIdentifier;

    let targetFile = fs.readFileSync('/public/plist-file/manifest.plist', 'utf8')
    let targetObj = plist.parse(targetFile);
    targetObj.items[0].metadata.title = CFBundleDisplayName;
    targetObj.items[0].metadata['bundle-version'] = CFBundleShortVersionString;
    targetObj.items[0].metadata['bundle-identifier'] = CFBundleIdentifier;
    // TODO:ADDR
    targetObj.items[0].assets[0].url = 'https://wayshon.com/ipa/RTN/RTN.ipa';

    let targetPlist = plist.build(targetObj)
    console.log(targetPlist)

    await writeFile(plistPath, targetPlist);
    return 1;
}

let exec = async (plistPath) => {
    return new Promise((resolve, reject) => {
        let cmd = `plistutil -i ${plistPath}/Info.plist -o ${plistPath}/targetPlist.plist')}`
        
        process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            }
            resolve()
        });
    })
}

let writeFile = (plistPath, targetPlist) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(`${plistPath}/targetPlist.plist`, targetPlist, error => {
            if (error) {
                reject(error)
            } else {
                resolve()
            }
        });
    })
}

let creatPlist = async (plistPath) => {
    await exec(plistPath);
    await dealFun(plistPath);
    return 1;
}


module.exports = new UtilsController();
