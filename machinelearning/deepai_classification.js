const path = require('path');
const fs = require('fs');
const directoryPath = path.join(__dirname, 'machinelearning');

const deepai = require('deepai');

deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K');

async function classify(img1, img2) {
    const resp = await deepai.callStandardApi("image-similarity", {
        image1: img1,
        image2: img2,
    });
    console.log(resp);
    return resp;
}

function runClassification(img) {
    var results = {};

    var min = 100;
    var minFile = "";

    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach(function (file) {
            results[file] = classify(img, file).then(() => 100);
            if (results[file] < min) {
                min = results[file];
                minFile = file;
            }
        });
    });

    return minFile;
}

exports.runClassification = runClassification;