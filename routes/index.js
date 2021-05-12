const TITLE = 'ARTistory';
const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: TITLE });
});

module.exports = router;
