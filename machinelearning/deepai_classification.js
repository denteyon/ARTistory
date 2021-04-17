const deepai = require('deepai');

deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K');

(async function() {
    var resp = await deepai.callStandardApi("image-similarity", {
        image1: "img1.jpeg",
        image2: "img2.png",
    });
    console.log(resp);
})()
