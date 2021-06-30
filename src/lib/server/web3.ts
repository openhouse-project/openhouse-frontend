import Web3 from 'web3';
export default new Web3(process.env['ETH_PROVIDER_URL'] || "");
