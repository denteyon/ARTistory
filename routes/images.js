var express = require('express');
var router = express.Router();

var checksum = require('./../util/checksum');

/* GET users listing. */
router.get('/addImg', function(req, res, next) {
  var imgChecksum = checksum.generateChecksum('img.jpg');
  res.send('get checksum and add it to blockchain');
});

router.get('/checkImg', function(req, res, next) {
  res.send('find similarity and if match, go check the blockchain');
})

module.exports = router;
