const { assert, expect } = require("chai");
const { getNamedAccounts, ethers, deployments, network } = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft", function () {
          let randomIpfsNft, deployer, vrfCoordinatorV2Mock;

          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["mocks", "random"]);
              randomIpfsNft = await ethers.getContract("RandomIpfsNft");
              vrfCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock"
              );
          });

          describe("constructor", () => {
              it("Checks that first token URI exists and is set to IPFS", async function () {
                  const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(
                      0
                  );

                  assert(dogTokenUriZero.includes("ipfs://"));
              });
          });

          describe("requestNft", () => {
              it("fails if payment isn't sent with the request", async function () {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreEthSent"
                  );
              });

              it("reverts if payment amount is less than the mint fee", async function () {
                  const fee = await randomIpfsNft.getMintFee();

                  await expect(
                      randomIpfsNft.requestNft({
                          value: fee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWith("RandomIpfsNft__NeedMoreEthSent");
              });

              it("emits an event and kicks off a random word quest", async function () {
                  const fee = await randomIpfsNft.getMintFee();

                  await expect(
                      randomIpfsNft.requestNft({ value: fee.toString() })
                  ).to.emit(randomIpfsNft, "NftRequested");
              });
          });

          describe("fulfillRandomWords", () => {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNft.tokenURI(
                                  "0"
                              );
                              const tokenCounter =
                                  await randomIpfsNft.getTokenCounter();

                              assert.equal(
                                  tokenUri.toString().includes("ipfs://"),
                                  true
                              );
                              assert.equal(tokenCounter.toString(), "1");

                              resolve();
                          } catch (error) {
                              console.log(error);
                              reject(error);
                          }
                      });

                      try {
                          const fee = await randomIpfsNft.getMintFee();
                          const requestNftResponse =
                              await randomIpfsNft.requestNft({
                                  value: fee.toString(),
                              });

                          const requestNftReceipt =
                              await requestNftResponse.wait(1);

                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          );
                      } catch (error) {
                          console.log(error);
                          reject(error);
                      }
                  });
              });
          });
      });
