/* eslint-disable no-console */
const TITLE = 'ARTistory';
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const os = require('os');

const router = express.Router();
const checksum = require('../util/checksum');
const Art = require('../models/art');

const Blockchain = require('../blockchain');
const TransactionPool = require('../wallet/transaction-pool');
const Wallet = require('../wallet');
const P2pServer = require('../p2p-server');
// const Miner = require('../miner');
const deepAI = require('../machinelearning/deepai_classification');

const imagePath = os.tmpdir();

const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
// const miner = new Miner(bc, tp, wallet, p2pServer);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, imagePath);
  },
  filename(req, file, cb) {
    cb(null, file.originalname); // Appending extension
  },
});

const cache = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, imagePath);
  },
  filename(req, file, cb) {
    cb(null, file.originalname); // Appending extension
  },
});

const upload = multer({ storage });
const check = multer({ storage: cache });
// const uploadedPath = path.join(__dirname, '../../machinelearning/uploads/');
const uploadedPath = imagePath;

router.post('/upload', upload.single('artwork'), (req, res) => {
  if (req.file) {
    const { author, title } = req.body;
    const filename = req.file.originalname;
    const imgChecksum = checksum.generateChecksum(req.file.path);

    const artwork = new Art({
      title,
      author,
      filename,
      checksum: imgChecksum,
    });

    Art.findOne({ filename }, (err, docs) => {
      if (err) {
        console.log(err);
      }
      if (docs) { // already exists
        res.render('warning', { title: TITLE, message: 'This artwork has already existed in our blockchain. It cannot be uploaded again.' });
      } else {
        artwork.save((error) => {
          if (error) return error;

          const recipient = 'server';

          const transaction = wallet.createTransaction(recipient, artwork, bc, tp);
          p2pServer.broadcastTransaction(transaction);

          console.log(tp.transactions);

          const block = bc.addBlock(artwork);

          console.log(`New block added: ${block.toString()}`);

          p2pServer.syncChains();

          const bitmap = fs.readFileSync(req.file.path);

          res.render('upload', {
            title: TITLE, artworktitle: title, artworkauthor: author, img: Buffer.from(bitmap).toString('base64'),
          });
        });
      }
    });
  } else throw new Error({ code: 403, message: 'error' });
});

router.post('/check', check.single('checkImg'), async (req, res) => {
  if (req.file) {
    const result = await deepAI.classify(req.file.path);
    let resultArtwork = null;

    await Art.findOne({ filename: result[0] }, (err, docs) => {
      if (err) {
        console.log(err);
      }
      if (!docs) {
        console.log('No entry');
      } else {
        resultArtwork = docs;
      }
    });

    if (result[1] < 90) {
      res.render('warning', { title: TITLE, message: 'This artwork has not been registered in our blockchain yet.' });
    } else if (result[1] !== 100) {
      const bitmapUploaded = fs.readFileSync(`${uploadedPath}/${result[0]}`);
      const bitmapCheck = fs.readFileSync(req.file.path);
      res.render('check', {
        title: TITLE,
        resultpercentage: result[1],
        artworktitle: resultArtwork.title,
        artworkauthor: resultArtwork.author,
        img_upload: Buffer.from(bitmapUploaded).toString('base64'),
        img_check: Buffer.from(bitmapCheck).toString('base64'),
      });
    } else {
      const imgChecksum = checksum.generateChecksum(`${uploadedPath}/${result[0]}`);
      const desc = bc.chain.find((item) => item.data.checksum === imgChecksum);

      if (desc) {
        console.log(desc);
      }

      const bitmapUploaded = fs.readFileSync(`${uploadedPath}/${result[0]}`);
      const bitmapCheck = fs.readFileSync(req.file.path);
      res.render('check', {
        title: TITLE,
        resultpercentage: result[1],
        artworktitle: resultArtwork.title,
        artworkauthor: resultArtwork.author,
        img_upload: Buffer.from(bitmapUploaded).toString('base64'),
        img_check: Buffer.from(bitmapCheck).toString('base64'),
      });
    }
  } else {
    throw new Error({ code: 403, message: 'Error' });
  }
});

module.exports = router;
