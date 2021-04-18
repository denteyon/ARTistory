const path = require('path');
const fs = require('fs');

const uploadedPath = path.join(__dirname, 'uploads/');

const deepai = require('deepai');

deepai.setApiKey('be7ff4a9-4e9a-440f-83c7-c3c7444be508'); // May need to change

async function classify(checkImg) {
    var filenames = fs.readdirSync(uploadedPath);

    var min = 100;

    var resultPercentage = 0;
    var resultFilename = "";

    for (const filename of filenames) {
        const resp = await deepai.callStandardApi("image-similarity", {
            image1: fs.createReadStream(uploadedPath + filename),
            image2: fs.createReadStream(checkImg),
        })

        if (resp.output.distance < min) {
            min = resp.output.distance;
            resultFilename = filename;
        }
    }

    resultPercentage = 100 - min;

    return [resultFilename, resultPercentage];
}

exports.classify = classify;