var crypto = require('crypto');
var fs = require('fs');

function generateChecksum(filepath, algorithm, encoding) {
    var img = fs.readFileSync(filepath);
    let str = img.toString('base64')
    data = Buffer.from(str, 'base64');
    return crypto
        .createHash(algorithm || 'md5')
        .update(data, 'utf8')
        .digest(encoding || 'hex');
}

exports.generateChecksum = generateChecksum;