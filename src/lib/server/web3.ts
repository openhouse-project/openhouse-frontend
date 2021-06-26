import Web3 from 'web3';
import env from './env';
export default new Web3(env.ETH_PROVIDER_URL);
