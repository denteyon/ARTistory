const path = require('path');
const fs = require('fs');
const os = require('os');



const uploadedPath = os.tmpdir();

const deepai = require('deepai');

deepai.setApiKey(process.env.DEEPAI_API_KEY); // May need to change

async function classify(checkImg) {
    var filenames = fs.readdirSync(uploadedPath);

    var min = 100;

    var resultPercentage = 0;
    var resultFilename = "";

    for (const filename of filenames) {
        const resp = await deepai.callStandardApi("image-similarity", {
            image1: fs.createReadStream(uploadedPath + '/' + filename),
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