var crypto = require('crypto');
var fs = require('fs');

function generateChecksum(file, algorithm, encoding) {
    fs.readFile(file, function (err, data) {
        return crypto
            .createHash(algorithm || 'md5')
            .update(data, 'utf8')
            .digest(encoding || 'hex');
    });
}

exports.generateChecksum = generateChecksum;