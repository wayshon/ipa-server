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
}

module.exports = new Tools();