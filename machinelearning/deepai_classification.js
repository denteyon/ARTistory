const path = require('path');
const fs = require('fs');
const uploadedPath = path.join(__dirname, 'uploads/');
const cachePath = path.join(__dirname, 'cache/');

const deepai = require('deepai');

deepai.setApiKey('155a287f-a64d-45cc-a811-7973b39ee8c6');

async function classify(checkImg) {
    let min = 100;

    await fs.readdir(uploadedPath, async function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        for (const file of files) {
            const resp = await deepai.callStandardApi("image-similarity", {
                image1: fs.createReadStream(uploadedPath + file),
                image2: fs.createReadStream(checkImg),
            })

            console.log(resp.output.distance);

            if (resp.output.distance < min) {
                min = resp;
            }
        }
        console.log("Min:" + min.output.distance);

        return min.output.distance;
    });
}

exports.classify = classify;