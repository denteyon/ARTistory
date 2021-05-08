const path = require('path');
const fs = require('fs');
const os = require('os');
var Art = require('../models/art');

const uploadedPath = os.tmpdir();

const deepai = require('deepai');

deepai.setApiKey(process.env.DEEPAI_API_KEY); // May need to change

async function classify(checkImg) {
    const document_list = await Art.find();

    //var filenames = fs.readdirSync(uploadedPath);

    console.log(document_list);

    var min = 100;

    var resultPercentage = 0;
    var resultFilename = "";

    for (const document of document_list) {
        console.log(uploadedPath+'/'+document.filename);

        const resp = await deepai.callStandardApi("image-similarity", {
            image1: fs.createReadStream(uploadedPath + '/' + document.filename),
            image2: fs.createReadStream(checkImg),
        })

        if (resp.output.distance < min) {
            min = resp.output.distance;
            resultFilename = document.filename;
        }
    }

    resultPercentage = 100 - min;

    return [resultFilename, resultPercentage];
}

exports.classify = classify;