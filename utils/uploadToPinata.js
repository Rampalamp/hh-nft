const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;

const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

async function storeImages(imagesFilePath) {
    //get full images path
    const fullImagesPath = path.resolve(imagesFilePath);

    const files = fs.readdirSync(fullImagesPath);

    let responses = [];

    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`
        );

        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile);

            responses.push(response);
        } catch (e) {
            console.log(e);
        }
    }

    return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
    const options = {
        pinataMetadata: {
            name: metadata.name,
        },
    };
    try {
        const response = await pinata.pinJSONToIPFS(metadata, options);
        return response;
    } catch (error) {
        console.log(error);
    }
    return null;
}

module.exports = { storeImages, storeTokenUriMetadata };
