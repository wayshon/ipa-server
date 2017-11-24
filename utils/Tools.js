const QRCode = require('qrcode');

class Tools {
    isNotBlank(val) {
        if (typeof (val) == "undefined" || val == null || val == "") {
            return false;
        }
        return true;
    }

    isBlank(val) {
        if (typeof (val) == "undefined" || val == null || val == "") {
            return true;
        }
        return false;
    }

    async getQRCodeUrl (path) {
        return new Promise((resolve, reject) => {
            QRCode.toDataURL(path, (err, url) => {
                if (err) {
                    reject(err)
                }
                resolve(url);
            })
        })
    }
}

module.exports = new Tools();