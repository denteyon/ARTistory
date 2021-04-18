var express = require('express');
const multer = require('multer');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var checksum = require('./../util/checksum');
var Art = require('../models/art');

const Blockchain = require('../blockchain');
const TransactionPool = require('../wallet/transaction-pool');
const Wallet = require('../wallet');
const P2pServer = require('../p2p-server');
const Miner = require('../miner');
const { TooManyRequests } = require('http-errors');
const deepAI = require('../machinelearning/deepai_classification');

const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../machinelearning/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //Appending extension
  }
})

var upload = multer({ storage: storage });

var cache = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../machinelearning/cache')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //Appending extension
  }
})

var check = multer({ storage: cache });

/* GET users listing. */
router.post('/addImg', function (req, res, next) {
  var imgChecksum = checksum.generateChecksum('img.jpg');
  res.send('get checksum and add it to blockchain');
});

router.post('/upload', upload.single('artwork'), (req, res) => {
  if (req.file) {
    var author = req.body.author;
    var title = req.body.title;
    var filename = req.file.originalname;
    var imgChecksum = checksum.generateChecksum(req.file.path);

    var artwork = new Art({
      title: title,
      author: author,
      checksum: imgChecksum
    });

    artwork.save(function (err) {
      if (err) return err;

      var recipient = 'server'

      const transaction = wallet.createTransaction(recipient, artwork, bc, tp);
      p2pServer.broadcastTransaction(transaction);

      console.log(tp.transactions);

      const block = bc.addBlock(artwork);

      console.log(`New block added: ${block.toString()}`);

      p2pServer.syncChains();

      res.redirect('blocks');

      //   Art.findOne({ checksum: 'www'}, function (err, docs) {
      //     if (err){
      //         console.log(err);
      //     }
      //     else{
      //         console.log("First function call : ", docs);
      //     }
      // });
      //artwork now exists
      // res.send(author + ' ' + filename + ' ' + imgChecksum);
    });
  }
  else throw 'error';
});

router.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

router.get('/getBlock', (req, res) => {
  var desc = JSON.parse(bc.chain).find(function(item) {
    return data.checksum == req.body.checksum;
  })
  
  if(desc) {
    console.log(desc);
  }
});

// router.get('/transact', (req, res) => {
// const { recipient, amount } = req.body;
//   var art = new Art(
//     {
//       title: req.body.title,
//       author: req.body.author,
//       checksum: req.body.image // calculate checksum here
//     }
//   );

//   const transaction = wallet.createTransaction(recipient, art, bc, tp);
//   p2pServer.broadcastTransaction(transaction);
//   res.redirect('transactions');
// }); 


router.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

// router.post('/mine', (req, res) => {

// });

router.get('/checkImg', function (req, res, next) {
  res.send('find similarity and if match, go check the blockchain');
})

router.post('/check', check.single('checkImg'), async (req, res) => {
  if (req.file) {
    var result = await deepAI.classify(req.file.path);
    await res.send(result);
  }
  else throw 'error';
});

module.exports = router;
