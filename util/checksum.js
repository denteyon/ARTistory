const crypto = require('crypto');
const fs = require('fs');

function generateChecksum(filepath, algorithm, encoding) {
  const img = fs.readFileSync(filepath);
  const str = img.toString('base64');
  const data = Buffer.from(str, 'base64');
  return crypto
    .createHash(algorithm || 'md5')
    .update(data, 'utf8')
    .digest(encoding || 'hex');
}

exports.generateChecksum = generateChecksum;
