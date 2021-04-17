var crypto = require('crypto');
var fs = require('fs');

function generateChecksum(data, algorithm, encoding) {
    return crypto
            .createHash(algorithm || 'md5')
            .update(data, 'utf8')
            .digest(encoding || 'hex');
}

exports.generateChecksum = generateChecksum;