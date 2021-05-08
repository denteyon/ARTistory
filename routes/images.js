const TITLE = 'ARTistory';

var express = require('express');
const multer = require('multer');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var os = require('os');

var checksum = require('./../util/checksum');
var Art = require('../models/art');

const Blockchain = require('../blockchain');
const TransactionPool = require('../wallet/transaction-pool');
const Wallet = require('../wallet');
const P2pServer = require('../p2p-server');
const Miner = require('../miner');
const deepAI = require('../machinelearning/deepai_classification');
const imagePath = os.tmpdir();

const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagePath)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //Appending extension
  }
})

var cache = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagePath)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //Appending extension
  }
})

var upload = multer({ storage: storage });
var check = multer({ storage: cache });
// const uploadedPath = path.join(__dirname, '../../machinelearning/uploads/');
const uploadedPath = imagePath;


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
        res.render('warning', { title: TITLE, message: 'This artwork has already existed in our blockchain. It cannot be uploaded again.'});
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

          var bitmap = fs.readFileSync(req.file.path);

          res.render('upload', {title: TITLE, artworktitle: title, artworkauthor: author, img: Buffer.from(bitmap).toString('base64')});
        });
      }
    });
  }
  else throw 'error';
});

router.post('/check', check.single('checkImg'), async (req, res) => {
  if (req.file) {
    var result = await deepAI.classify(req.file.path);
    var resultArtwork = null;

    await Art.findOne({ filename: result[0] }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      if (!docs) {
        console.log("No entry");
      } else {
        resultArtwork = docs;
      }
    });

    if (result[1] < 90) {
      res.render('warning', { title: TITLE, message: 'This artwork has not been registered in our blockchain yet.'});
    } else if (result[1] !== 100) {
      //res.render('check', { title: TITLE, resultpercentage: result[1], artworktitle: resultArtwork.title, artworkauthor: resultArtwork.author});
      var bitmap_uploaded = fs.readFileSync(uploadedPath+'/'+result[0]);
      var bitmap_check = fs.readFileSync(req.file.path);
      res.render('check', {title: TITLE, resultpercentage: result[1], artworktitle: resultArtwork.title, artworkauthor: resultArtwork.author, img_upload: Buffer.from(bitmap_uploaded).toString('base64'), img_check: Buffer.from(bitmap_check).toString('base64')});
    } else {
      var imgChecksum = checksum.generateChecksum(uploadedPath+ '/' + result[0]);
      var desc = bc.chain.find(function (item) {
        return item.data.checksum === imgChecksum;
      })

      if (desc) {
        console.log(desc);
      }

      var bitmap_uploaded = fs.readFileSync(uploadedPath+result[0]);
      var bitmap_check = fs.readFileSync(req.file.path);
      res.render('check', {title: TITLE, resultpercentage: result[1], artworktitle: resultArtwork.title, artworkauthor: resultArtwork.author, img_upload: Buffer.from(bitmap_uploaded).toString('base64'), img_check: Buffer.from(bitmap_check).toString('base64')});
      //res.render('check', { title: TITLE, resultpercentage: result[1], artworktitle: resultArtwork.title, artworkauthor: resultArtwork.author});
    }
  }
  else throw 'error';
});

module.exports = router;
