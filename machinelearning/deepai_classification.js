const path = require('path');
const fs = require('fs');
const os = require('os');
const deepai = require('deepai');

const uploadedPath = os.tmpdir();
const Art = require('../models/art');

deepai.setApiKey(process.env.DEEPAI_API_KEY); // May need to change

async function classify(checkImg) {
  const documentList = await Art.find();

  // const filenames = fs.readdirSync(uploadedPath);

  console.log(documentList);

  const min = 100;

  const resultPercentage = 0;
  const resultFilename = '';

  for (const document of documentList) {
    const name = path.join(uploadedPath + '/' + document.filename);
    console.log(name);
    console.log(checkImg);

    const resp = await deepai.callStandardApi("image-similarity", {
      image1: fs.createReadStream(name),
      image2: fs.createReadStream(checkImg),
    });

    if (resp.output.distance < min) {
      min = resp.output.distance;
      resultFilename = document.filename;
    }
  }

  resultPercentage = 100 - min;

  return [resultFilename, resultPercentage];
}

exports.classify = classify;
