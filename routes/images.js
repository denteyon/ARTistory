var express = require('express');
var router = express.Router();

var checksum = require('./../util/checksum');
const Blockchain = require('../blockchain');
const TransactionPool = require('../wallet/transaction-pool');
const Wallet = require('../wallet');
const P2pServer = require('../p2p-server');
const Miner = require('../miner');

const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

/* GET users listing. */
router.post('/addImg', function(req, res, next) {
  var imgChecksum = checksum.generateChecksum('img.jpg');
  res.send('get checksum and add it to blockchain');
});

router.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

router.get('/transact', (req, res) => {
  // const { recipient, amount } = req.body;
  let recipient = 'server';
  let amount = '400';
  
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);
  p2pServer.broadcastTransaction(transaction);
  res.redirect('transactions');
});

router.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

router.get('/checkImg', function(req, res, next) {
  res.send('find similarity and if match, go check the blockchain');
})

module.exports = router;
