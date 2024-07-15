import Web3 from "web3";
import { AbiItem } from "web3-utils";
import dotenv from "dotenv";
import contractJSON from "../../truffle/build/contracts/VotingSystem.json";

dotenv.config();
const encoder = new TextEncoder();
const network = process.env.BC_NETWORK || "http://127.0.0.1:7545";
const web3 = new Web3(new Web3.providers.HttpProvider(network));
const contractABI: AbiItem[] = contractJSON.abi as AbiItem[];
const contractOwner = process.env.CONTRACT_OWNER;
const contractOwnerPkey = process.env.CONTRACT_OWNER_PKEY;
const contractAddress = contractJSON.networks["5777"].address;
const votingContract = new web3.eth.Contract(contractABI, contractAddress);

export {
  web3,
  votingContract,
  contractOwner,
  contractOwnerPkey,
  contractAddress,
  contractABI,
};
