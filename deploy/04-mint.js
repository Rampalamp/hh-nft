const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
//script to mint one of each basic/random/dynamic NFTs
module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts();

    //basic
    const basicNft = await ethers.getContract("BasicNft", deployer);
    const basicMintTx = await basicNft.mintNft();
    await basicMintTx.wait(1);
    console.log(
        `Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`
    );

    //random
    const randomNft = await ethers.getContract("RandomIpfsNft", deployer);
    const mintFee = await randomNft.getMintFee();

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000); // 5 mins
        randomNft.once("NftMinted", async () => {
            resolve();
        });

        const randomNftTx = await randomNft.requestNft({
            value: mintFee.toString(),
        });
        const randomNftMintTxReceipt = await randomNftTx.wait(1);

        if (developmentChains.includes(network.name)) {
            const requestId =
                randomNftMintTxReceipt.events[1].args.requestId.toString();

            const vrfCoordinatorV2Mock = await ethers.getContract(
                "VRFCoordinatorV2Mock",
                deployer
            );

            await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestId,
                randomNft.address
            );
        }
    });

    console.log(
        `Random IPFS NFT index 0 tokenURI: ${await randomNft.tokenURI(0)}`
    );

    const highValue = ethers.utils.parseEther("1000");
    const dynamicNft = await ethers.getContract("DynamicSvgNft", deployer);

    const dynamicNftMintTx = await dynamicNft.mintNft(highValue.toString());
    await dynamicNftMintTx.wait(1);

    console.log(
        `Dynamic SVG NFT index 1 of tokenURI : ${await dynamicNft.tokenURI(1)}`
    );
};
