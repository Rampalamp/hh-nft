const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;
    let ethUsdPriceFeedAddress;

    log("------------------------");

    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");

        ethUsdPriceFeedAddress = EthUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const lowSVG = await fs.readFileSync("./images/dynamicNft/frown.svg", {
        encoding: "utf-8",
    });
    const highSVG = await fs.readFileSync("./images/dynamicNft/happy.svg", {
        encoding: "utf-8",
    });

    args = [ethUsdPriceFeedAddress, lowSVG, highSVG];
    log("DEPLOYING DYNAMIC SVG...");
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("verifying..");

        await verify(randomIpfsNft.address, args);
    }
};

module.exports.tags = ["all", "dynamic"];
