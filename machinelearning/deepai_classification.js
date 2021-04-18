const path = require('path');
const fs = require('fs');

const uploadedPath = path.join(__dirname, 'uploads/');

const deepai = require('deepai');

deepai.setApiKey('155a287f-a64d-45cc-a811-7973b39ee8c6'); // May need to change

async function classify(checkImg) {
    var filenames = fs.readdirSync(uploadedPath);

    var min = 100;

    for (const file of filenames) {
        const resp = await deepai.callStandardApi("image-similarity", {
            image1: fs.createReadStream(uploadedPath + file),
            image2: fs.createReadStream(checkImg),
        })

        if (resp.output.distance < min) {
            min = resp.output.distance;
        }
    }

    return min.toString();
}

exports.classify = classify;