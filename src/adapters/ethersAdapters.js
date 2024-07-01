const ethers = require("ethers");

const getEthersSigner = async (config) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  return signer;
};

module.exports = {
  getEthersSigner,
};
