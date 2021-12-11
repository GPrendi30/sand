const jdenticon = require('jdenticon');
const fs = require('fs');


function generateIdenticon (username, created) {
    // set value
    const value = username + created;
    const size = 200;

    // returns png buffer to save in db
    return jdenticon.toPng(value, size);
}

function generateIdenticonSaveFile (username, created, outpath) {
    if (!outpath.includes('.png')) return;
    const pngBuffer = generateIdenticon(username, created);
    fs.writeFileSync(outpath, pngBuffer);
}

module.exports.generateIdenticon = generateIdenticon;
module.exports.generateIdenticonSaveFile = generateIdenticon;
