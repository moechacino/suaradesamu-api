import { FastifyRequest } from "fastify";
import {
  contractAddress,
  contractOwner,
  contractOwnerPkey,
  votingContract,
  web3,
} from "../../config/web3";
import { BadRequestError } from "../errors/BadRequestError";
import { prismaClient } from "../../config/database";

export class VotingService {
  static async startVoting(request: FastifyRequest) {
    const { durationInMiliseconds } = request.body as {
      durationInMiliseconds: string;
    };
    if (isNaN(Number(durationInMiliseconds))) {
      throw new BadRequestError("id must be number");
    }
    await votingContract.methods.checkIsVotingEnd().send({
      from: contractOwner,
      gasPrice: web3.utils.toWei("10", "gwei"),
    });
    const data = await votingContract.methods
      .startVoting(parseInt(durationInMiliseconds))
      .encodeABI();
    const tx = {
      from: contractOwner,
      to: contractAddress,
      gasPrice: web3.utils.toWei("10", "gwei"),
      data: data,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      contractOwnerPkey || "FAKE PKEY"
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    const votingStatus: {
      "0": any;
      "1": any;
      "2": any;
    } = await votingContract.methods.getVotingStatus().call();

    const doesVotingRun = votingStatus["0"];
    const start = new Date(Number(BigInt(votingStatus["1"])) * 1000);
    const end = new Date(Number(BigInt(votingStatus["2"])) * 1000);
    const formattedVotingStatus = {
      votingStatus: doesVotingRun,
      start: start,
      end: end,
    };
    return formattedVotingStatus;
  }

  static async endVoting(): Promise<object> {
    await votingContract.methods.checkIsVotingEnd().send({
      from: contractOwner,
      gasPrice: web3.utils.toWei("10", "gwei"),
    });

    const data = await votingContract.methods.endVoting().encodeABI();
    const tx = {
      from: contractOwner,
      to: contractAddress,
      gasPrice: web3.utils.toWei("10", "gwei"),
      data: data,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      contractOwnerPkey || "FAKE PKEY"
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    const votingStatus: {
      "0": any;
      "1": any;
      "2": any;
    } = await votingContract.methods.getVotingStatus().call();

    const doesVotingRun = votingStatus["0"];
    const start = new Date(Number(BigInt(votingStatus["1"])) * 1000);
    const end = new Date(Number(BigInt(votingStatus["2"])) * 1000);
    const formattedVotingStatus = {
      votingStatus: doesVotingRun,
      start: start,
      end: end,
    };
    return formattedVotingStatus;
  }
  static async getVotingStatus() {
    await votingContract.methods.checkIsVotingEnd().send({
      from: contractOwner,
      gasPrice: web3.utils.toWei("10", "gwei"),
    });
    const votingStatus: {
      "0": any;
      "1": any;
      "2": any;
    } = await votingContract.methods.getVotingStatus().call();

    console.log(votingStatus);
    const doesVotingRun = votingStatus["0"];
    const start = new Date(Number(BigInt(votingStatus["1"])) * 1000);
    const end = new Date(Number(BigInt(votingStatus["2"])) * 1000);
    const formattedVotingStatus = {
      votingStatus: doesVotingRun,
      start: start,
      end: end,
    };
    return formattedVotingStatus;
  }

  static async getVotingCount(): Promise<object> {
    const voterCount = await votingContract.methods.getVoterCount().call();
    const formattedVoterCount = parseInt(
      web3.utils.toBigInt(voterCount).toString()
    );
    console.log(formattedVoterCount);
    const votesCount = await votingContract.methods.getVotesCount().call();
    const formattedVotesCount = parseInt(
      web3.utils.toBigInt(votesCount).toString()
    );
    const inPersen =
      Math.round((formattedVotesCount / formattedVoterCount) * 100 * 10) / 10;

    await votingContract.methods.checkIsVotingEnd().send({
      from: contractOwner,
      gasPrice: web3.utils.toWei("10", "gwei"),
    });
    const votingStatus: {
      "0": any;
      "1": any;
      "2": any;
    } = await votingContract.methods.getVotingStatus().call();
    const doesVotingRun = votingStatus["0"];
    const end = new Date(Number(BigInt(votingStatus["2"])) * 1000);

    const nowDate = new Date();

    const candidates = await prismaClient.candidate.findMany({
      select: {
        id: true,
        noUrut: true,
        name: true,
      },
      orderBy: {
        noUrut: "asc",
      },
    });
    let candidatesVotesData:
      | object
      | {
          id: number;
          noUrut: number;
          name: string;
          voteCount?: number | null;
        }[] = candidates;
    if (nowDate > end || !doesVotingRun) {
      candidatesVotesData = [];
      for (const val of candidates) {
        const candidate: {
          "0": string;
          "1": string;
          "2": string;
          __length__: number;
        } = await votingContract.methods.getCandidate(val.noUrut).call();
        const candidateId = candidate["0"].toString();
        const candidateName = candidate["1"];
        const voteCount = candidate["2"].toString();
        const formattedCandidates = {
          id: candidateId,
          name: candidateName,
          voteCount: voteCount,
        };
        if (Array.isArray(candidatesVotesData)) {
          candidatesVotesData.push({
            id: val.id,
            name: formattedCandidates.name,
            voteCount: parseInt(formattedCandidates.voteCount),
            noUrut: parseInt(formattedCandidates.id),
          });
        }
      }
    }
    return {
      totalPemilih: formattedVoterCount,
      totalSuaraMasuk: formattedVotesCount,
      totalSuaraMasukDalamPersen: inPersen,
      isVotingRun: doesVotingRun,
      candidateVotesData: candidatesVotesData,
    };
  }
}
