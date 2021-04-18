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
const uploadedPath = path.join(__dirname, '../machinelearning/uploads/');

router.post('/upload', upload.single('artwork'), (req, res) => {
  if (req.file) {
    var author = req.body.author;
    var title = req.body.title;
    var filename = req.file.originalname;
    var imgChecksum = checksum.generateChecksum(req.file.path);

    var artwork = new Art({
      title: title,
      author: author,
      filename: filename,
      checksum: imgChecksum
    });

    Art.findOne({ filename: filename }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      if (docs) { // already exists
        res.redirect('blocks');
      } else {
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
        });
      }
    });
  }
  else throw 'error';
});

router.get('/blocks', (req, res) => {
  res.json(bc.chain);
});


router.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

router.post('/check', check.single('checkImg'), async (req, res) => {
  if (req.file) {
    var result = await deepAI.classify(req.file.path);
    var resultArtwork = null;

    await Art.findOne({ filename: result.resultFilename }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      if (!docs) {
        console.log("No entry");
      } else {
        resultArtwork = docs;
      }
    });

    console.log(result.resultPercentage);

    if (result.resultPercentage < 90) {
      res.send("Not registered");
    } else if (result.resultPercentage !== 100) {
      res.send(resultArtwork);
    } else {
      console.log(uploadedPath + ' ' + result.resultFilename);
      var imgChecksum = checksum.generateChecksum(uploadedPath + result.resultFilename);
      var desc = JSON.parse(bc.chain).find(function (item) {
        return item.data.checksum == imgChecksum;
      })
    
      if (desc) {
        console.log(desc);
      }
    }

    await res.send(result);
  }
  else throw 'error';
});

module.exports = router;
