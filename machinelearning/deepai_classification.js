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

exports.classify = classify;