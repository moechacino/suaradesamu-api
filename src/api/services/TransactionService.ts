import { FastifyRequest } from "fastify";
import {
  contractABI,
  contractAddress,
  votingContract,
  web3,
} from "../../config/web3";
import {
  AbiFragment,
  AbiFunctionFragment,
  AbiInput,
  AbiItem,
  EventLog,
} from "web3";

export function findAbiFunctionBySignature(
  contractABI: AbiItem[],
  functionSignature: string
): AbiItem | undefined {
  return contractABI.find((item) => {
    if (item.type === "function") {
      const abiFunction = item as AbiFunctionFragment; // Type assertion to AbiItem
      const encodedSignature =
        web3.eth.abi.encodeFunctionSignature(abiFunction);
      return encodedSignature === functionSignature;
    }
    return false;
  });
}

async function getTransactionDetails(txHash: string): Promise<any> {
  const tx = await web3.eth.getTransaction(txHash);
  const receipt = await web3.eth.getTransactionReceipt(txHash);

  let decodedInputs: any = null;
  if (tx.input) {
    const functionSignature = tx.input.slice(0, 10);
    const abiFunction = findAbiFunctionBySignature(
      contractABI,
      functionSignature
    );

    if (abiFunction) {
      if (abiFunction.inputs) {
        const mutableInputs: AbiInput[] = abiFunction.inputs.map((param) => ({
          ...param,
        }));

        decodedInputs = web3.eth.abi.decodeParameters(
          mutableInputs,
          tx.input.slice(10)
        );
      }
      for (const key in decodedInputs) {
        if (typeof decodedInputs[key] === "bigint") {
          decodedInputs[key] = decodedInputs[key].toString();
        }
      }
    }
  }

  return {
    from: tx.from?.toString(),
    to: tx.to?.toString(),
    value: web3.utils.fromWei(tx.value, "ether").toString(),
    gas: tx.gas?.toString(),
    gasPrice: web3.utils.fromWei(tx.gasPrice, "gwei").toString(),
    input: decodedInputs,
    contractAddress: contractAddress?.toString(),
    cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
    gasUsed: receipt.gasUsed.toString(),
    blockNumber: Number(tx.blockNumber),
    // status: receipt.status,
    // logs: receipt.logs,
  };
}

export class TransactionService {
  static async getAllTransactions(): Promise<any> {
    const latestBlockNumber = await web3.eth.getBlockNumber();
    const transactions: any[] = [];

    for (let i = latestBlockNumber; i >= 0; i--) {
      const block = await web3.eth.getBlock(i, true);
      if (block && block.transactions) {
        for (const tx of block.transactions) {
          if (
            typeof tx !== "string" &&
            tx.to &&
            tx.to.toLowerCase() === contractAddress.toLowerCase()
          ) {
            const txDetails = await getTransactionDetails(tx.hash);
            const timestamp = block.timestamp;
            const date = new Date(Number(timestamp) * 1000);
            const wibOffset = 7 * 60; // WIB offset
            const dateTransactionWIB = new Date(
              date.getTime() + wibOffset * 60 * 1000
            );

            transactions.push({
              ...txDetails,
              date: dateTransactionWIB,
            });
          }
        }
      }
    }
    return transactions;
  }

  static async getAllVotedEvents(request: FastifyRequest): Promise<any> {
    const events: (string | EventLog)[] = await votingContract.getPastEvents(
      "Voted" as "allEvents",
      {
        fromBlock: 0,
        toBlock: "latest",
      }
    );

    const formattedEvents = await Promise.all(
      events.map(async (event) => {
        if (typeof event !== "string") {
          const block = await web3.eth.getBlock(event.blockNumber);
          const timestamp = block.timestamp;
          const date = new Date(Number(timestamp) * 1000);
          const wibOffset = 7 * 60;
          const dateTransactionWIB = new Date(
            date.getTime() + wibOffset * 60 * 1000
          );
          return {
            blockNumber: Number(event.blockNumber),
            contractName: "VotingSystem",
            contractAddress: contractAddress.toString(),
            signature: `${event.event} (voter: address, candidateId: uint256)`,
            txHash: event.transactionHash?.toString(),
            logIndex: event.logIndex?.toString(),
            date: dateTransactionWIB,
            returnValues: {
              voter: (event.returnValues.voter as string).toString(),
              candidateId: (
                event.returnValues.candidateId as string
              ).toString(),
            },
          };
        }
        return null;
      })
    );

    return formattedEvents
      .filter((event) => event !== null)
      .sort((a, b) => b!.blockNumber - a!.blockNumber);
  }
}
