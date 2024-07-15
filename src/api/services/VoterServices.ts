import crypto, { createHash } from "crypto";
import { FastifyRequest } from "fastify";
import {
  VoterGetVoteRequest,
  VoterRegisterRequest,
  VoterVoteRequest,
  toVoterResponse,
} from "../models/VoterModel";
import { prismaClient } from "../../config/database";
import { ForbiddenError } from "../errors/ForbiddenError";
import {
  contractABI,
  contractAddress,
  contractOwner,
  contractOwnerPkey,
  votingContract,
  web3,
} from "../../config/web3";
import xlsx from "xlsx";
import { BadRequestError } from "../errors/BadRequestError";
import { ConflictRequestError } from "../errors/ConflictRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { MulterRequest } from "../../types/multerType";
import { File } from "fastify-multer/lib/interfaces";

import { findAbiFunctionBySignature } from "./TransactionService";
import { AbiInput } from "web3";
const cryptoAlgorithm = "aes-256-cbc";
const key = "1SuaraDesaMuPkey1";
const iv = "1234567890123456";

function generateKeyFromPassword(password: string): Buffer {
  return crypto.createHash("sha256").update(password).digest();
}
function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function hashData(data: string): string {
  const hash = createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
}

function encrypt(text: string, chiperKey: string): string {
  const usedKey = generateKeyFromPassword(chiperKey);
  const iv = crypto.randomBytes(16); // Generate IV for each encryption
  const cipher = crypto.createCipheriv(cryptoAlgorithm, usedKey, iv);
  let encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const ivHex = iv.toString("hex");
  const encryptedHex = encrypted.toString("hex");
  return `${ivHex}:${encryptedHex}`;
}

function decrypt(encryptedText: string, chiperKey: string): string {
  const usedKey = generateKeyFromPassword(chiperKey);
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const ivBuffer = Buffer.from(ivHex, "hex");
  const encryptedBuffer = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(cryptoAlgorithm, usedKey, ivBuffer);
  let decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
async function generateUniquePin() {
  let isUnique = false;
  let newPin = "";

  while (!isUnique) {
    newPin = generatePin();
    const existingPin = await prismaClient.pin.findUnique({
      where: {
        pinCode: newPin,
      },
    });
    if (!existingPin) {
      isUnique = true;
    }
  }

  return newPin;
}
export class VoterService {
  static async addVoterBulk(request: MulterRequest): Promise<any> {
    const file = request.file as File;
    if (!file) {
      throw new BadRequestError("No File Uploaded");
    }
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: {
      nfcSerialNumber: string;
      NIK: string;
      name: string;
    }[] = xlsx.utils.sheet_to_json(worksheet);
    const formattedData = data.map((row) => ({
      ...row,
      NIK: row.NIK.toString(),
    }));
    let transactionData: any[] = [];
    const transaction = await prismaClient.$transaction(
      async (prismaClient) => {
        for (const val of formattedData) {
          const hashedNIK = hashData(val.NIK);
          await votingContract.methods
            .checkIfNIKNotRegistered(hashedNIK)
            .call();
          const isVoterExist = await prismaClient.voter.findUnique({
            where: {
              nfcSerialNumber: val.nfcSerialNumber,
            },
          });
          if (!isVoterExist) {
            const voter = await prismaClient.voter.create({
              data: val,
            });

            const uniquePin = await generateUniquePin();
            const pin = await prismaClient.pin.create({
              data: {
                voterId: voter.id,
                pinCode: uniquePin,
              },
            });
            const data = await votingContract.methods
              .addNIK(hashedNIK)
              .encodeABI();

            const tx = {
              from: contractOwner,
              to: contractAddress,
              gasPrice: web3.utils.toWei("10", "gwei"),
              data: data,
            };

            const signedTx = await web3.eth.accounts.signTransaction(
              tx,
              contractOwnerPkey || "FAKE_PKEY"
            );

            const receipt = await web3.eth.sendSignedTransaction(
              signedTx.rawTransaction
            );
            transactionData.push(val);
          }
        }
      },
      {
        timeout: 60000,
      }
    );

    return transaction;
  }
  static async addVoter(request: FastifyRequest): Promise<object> {
    const { nik, nfcSN, name } = request.body as {
      nik: string;
      nfcSN: string;
      name: string;
    };
    console.log(typeof nik);
    const isExist = await prismaClient.voter.findFirst({
      where: {
        OR: [{ nfcSerialNumber: nfcSN }, { NIK: nik }],
      },
    });

    if (isExist) {
      throw new ConflictRequestError(
        "NIK or NFC Serial Number is already registered"
      );
    }
    const hashedNIK = hashData(nik);
    await votingContract.methods.checkIfNIKNotRegistered(hashedNIK).call();

    const transaction = await prismaClient.$transaction(
      async (prismaClient) => {
        const voter = await prismaClient.voter.create({
          data: {
            name: name,
            nfcSerialNumber: nfcSN,
            NIK: nik,
          },
        });
        const uniquePin = await generateUniquePin();
        const pin = await prismaClient.pin.create({
          data: {
            voterId: voter.id,
            pinCode: uniquePin,
          },
        });
        const data = await votingContract.methods.addNIK(hashedNIK).encodeABI();

        const tx = {
          from: contractOwner,
          to: contractAddress,
          gasPrice: web3.utils.toWei("10", "gwei"),
          data: data,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          tx,
          contractOwnerPkey || "FAKE_PKEY"
        );

        const receipt = await web3.eth.sendSignedTransaction(
          signedTx.rawTransaction
        );
        return {
          voter,
          transactionHash: receipt.transactionHash,
        };
      }
    );

    return {
      addedNIK: transaction["voter"],
      transactionHash: transaction["transactionHash"],
    };
  }

  static async getAll(): Promise<object[]> {
    const voters = await prismaClient.voter.findMany({
      select: {
        id: true,
        name: true,
        NIK: true,
        nfcSerialNumber: true,
      },
    });
    return voters;
  }

  static async register(request: FastifyRequest): Promise<any> {
    votingContract.accountProvider;
    const voterRegisterRequest: VoterRegisterRequest =
      request.body as VoterRegisterRequest;

    const voter = await prismaClient.voter.findUnique({
      where: {
        nfcSerialNumber: voterRegisterRequest.nfcSN,
      },
      include: {
        pin: {
          select: {
            pinCode: true,
          },
        },
      },
    });

    if (!voter) {
      throw new NotFoundError("Anda tidak memiliki hak pilih");
    }
    if (voterRegisterRequest.pin !== voter.pin?.pinCode) {
      throw new ForbiddenError("Pin tidak sesuai");
    }

    return voter;
  }

  static async vote(request: FastifyRequest): Promise<any> {
    const voterVoteRequest: VoterVoteRequest = request.body as VoterVoteRequest;

    const voter = await prismaClient.voter.findUnique({
      where: {
        nfcSerialNumber: voterVoteRequest.nfcSerialNumber,
      },
      include: {
        pin: {
          select: {
            pinCode: true,
          },
        },
      },
    });

    if (!voter) {
      throw new NotFoundError("NIK Tidak Terdaftar");
    }

    const candidate = await prismaClient.candidate.findUnique({
      where: {
        id: parseInt(voterVoteRequest.candidateId.toString()),
      },
      select: {
        name: true,
        noUrut: true,
      },
    });
    const hashedNIK = hashData(voter.NIK);
    console.log(hashedNIK);
    await votingContract.methods.checkIfNIKRegistered(hashedNIK).call();
    await votingContract.methods
      .checkIfCandidateValid(candidate?.noUrut)
      .call();

    const newAccount = web3.eth.accounts.create();
    const account = web3.eth.accounts.privateKeyToAccount(
      newAccount.privateKey
    );
    const data = votingContract.methods
      .vote(candidate?.noUrut, hashedNIK)
      .encodeABI();

    await web3.eth.sendTransaction({
      from: contractOwner,
      to: account.address,
      value: web3.utils.toWei("0.2", "ether"),
      gasPrice: web3.utils.toWei("10", "gwei"),
    });

    console.log(account);
    const thisBalance = await web3.eth.getBalance(account.address);
    console.log(`balance: ${thisBalance}`);
    const tx = {
      from: account.address,
      to: contractAddress,
      gasPrice: web3.utils.toWei("10", "gwei"),
      data: data,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      newAccount.privateKey
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    const encryptedTransactionHash = encrypt(
      receipt.transactionHash.toString(),
      voterVoteRequest.nfcSerialNumber
    );
    return {
      transactionAddress: encryptedTransactionHash,
    };
  }

  static async getVote(request: FastifyRequest): Promise<any> {
    const { nfcSerialNumber, transactionAddress } =
      request.body as VoterGetVoteRequest;
    const voter = await prismaClient.voter.findUnique({
      where: { nfcSerialNumber: nfcSerialNumber },
    });

    const hashedNIK = hashData(voter?.NIK || "fake");
    const decryptedTransaction = decrypt(
      transactionAddress,
      voter?.nfcSerialNumber!
    );
    const tx = await web3.eth.getTransaction(decryptedTransaction);

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
    const block = await web3.eth.getBlock(tx.blockNumber);
    const timestamp = block.timestamp;
    const nowDate = new Date(Number(timestamp) * 1000);
    const wibOffset = 7 * 60; // WIB is UTC+7
    const dateTransactionWIB = new Date(
      nowDate.getTime() + wibOffset * 60 * 1000
    );
    const date = dateTransactionWIB.toISOString().split("T")[0];
    const time = dateTransactionWIB.toISOString().split("T")[1].slice(0, 5);

    let data: object;
    if (!decodedInputs._NIK || !decodedInputs._candidateId) {
      data = {
        fulldate: dateTransactionWIB,
        date: date,
        time: time,
        candidateNumber: null,
        candidateName: null,
        candidatePhoto: null,
        transactionAddress: decryptedTransaction,
      };
    } else {
      if (hashedNIK === decodedInputs._NIK) {
        const candidate = await prismaClient.candidate.findUnique({
          where: {
            noUrut: parseInt(decodedInputs._candidateId),
          },
          select: {
            name: true,
            photoProfileUrl: true,
          },
        });
        data = {
          fulldate: dateTransactionWIB,
          date: date,
          time: time,
          candidateNumber: decodedInputs._candidateId,
          candidateName: candidate?.name,
          candidatePhoto: candidate?.photoProfileUrl,
          transactionAddress: decryptedTransaction,
        };
      } else {
        throw new ForbiddenError("KTP dan Alamat Transaksi Tidak Sesuai");
      }
    }

    return data;
  }

  static async hasVoterVote(request: FastifyRequest): Promise<any> {
    if (!request.body) {
      throw new BadRequestError("request body is needed");
    }
    const { nfcSerialNumber } = request.body as { nfcSerialNumber: string };
    if (!nfcSerialNumber) {
      throw new BadRequestError("'nfcSerialNumber' is required");
    }
    const voter = await prismaClient.voter.findUnique({
      where: {
        nfcSerialNumber: nfcSerialNumber,
      },
      select: {
        id: true,
        nfcSerialNumber: true,
        NIK: true,
      },
    });

    if (!voter) {
      throw new NotFoundError("Tidak Terdaftar");
    }

    const hashedNIK = hashData(voter.NIK);
    try {
      await votingContract.methods.checkIfNIKHasUsed(hashedNIK).call();
    } catch (error) {
      return true;
    }
    return {
      id: voter.id,
      nfcSerialNumber: voter.nfcSerialNumber,
    };
  }
}
