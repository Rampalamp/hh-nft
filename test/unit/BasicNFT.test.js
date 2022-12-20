const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");

const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT", function () {
          let basicNFT, deployer;

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;

              await deployments.fixture(["basic"]);

              basicNFT = await ethers.getContract("BasicNFT", deployer);
          });

          describe("constructor", function () {
              it("Initializes the NFT with Dogie as its name, and DOG as its symbol", async function () {
                  const name = await basicNFT.name();
                  const symbol = await basicNFT.symbol();

                  assert.equal(name, "Dogie");
                  assert.equal(symbol, "DOG");
              });
          });

          describe("safeMint", function () {
              it("Mints a new NFT, adding the minter to balanceOf, updates tokenCounter, checks owner", async function () {
                  const balanceBefore = await basicNFT.balanceOf(deployer);
                  const tokenCounterBefore = await basicNFT.getTokenCounter();

                  const tx = await basicNFT.mintNft();
                  tx.wait(1);

                  const balanceAfter = await basicNFT.balanceOf(deployer);
                  const tokenCounterAfter = await basicNFT.getTokenCounter();
                  const owner = await basicNFT.ownerOf(0);

                  assert.equal(balanceBefore, 0);
                  assert.equal(tokenCounterBefore, 0);

                  assert.equal(balanceAfter, 1);
                  assert.equal(tokenCounterAfter, 1);
                  assert.equal(owner, deployer);
              });
          });
      });
