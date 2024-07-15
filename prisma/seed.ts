import { prismaClient } from "../src/config/database";
import bcrypt from "bcrypt";
import { dumpVoter } from "./dump/voter";
import {
  contractAddress,
  contractOwner,
  contractOwnerPkey,
  votingContract,
  web3,
} from "../src/config/web3";
import crypto, { createHash } from "crypto";
import path from "path";
import fs from "fs";
function hashData(data: string): string {
  const hash = createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
}

const addAdmin = async () => {
  const isExist = await prismaClient.admin.findUnique({
    where: {
      username: "admin1",
    },
  });
  if (!isExist) {
    const username = "admin";
    const password = await bcrypt.hash("suaradesamu", 10);
    await prismaClient.admin.create({
      data: {
        username: username,
        password: password,
      },
    });
  }
};

const addVoterAndPin = async () => {
  for (const val of dumpVoter) {
    const createdVoter = await prismaClient.voter.create({
      data: {
        nfcSerialNumber: val.nfsSerialNumber,
        name: val.name,
        NIK: val.NIK,
      },
    });
    const hashedNIK = hashData(createdVoter.NIK);
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
    await prismaClient.pin.create({
      data: {
        pinCode: val.PIN,
        voterId: createdVoter.id,
      },
    });
  }
};

const addCandidate = async () => {
  const candidateData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "seederCandidate.json"), "utf-8")
  );

  for (const candidate of candidateData) {
    const createdCandidate = await prismaClient.candidate.create({
      data: {
        name: candidate.name,
        age: candidate.age,
        noUrut: candidate.noUrut,
        visi: candidate.visi,
        photoProfileUrl: candidate.photoProfileUrl,
        photoProfileAlt: candidate.photoProfileAlt,
        workPlan: {
          create: candidate.workPlan,
        },
        education: {
          create: candidate.education,
        },
        workExperience: {
          create: candidate.workExperience,
        },
        organization: {
          create: candidate.organization,
        },
      },
    });

    const data = await votingContract.methods
      .addCandidate(createdCandidate.name, createdCandidate.noUrut)
      .encodeABI();

    const tx = {
      from: contractOwner,
      to: contractAddress,
      gasPrice: web3.utils.toWei("10", "gwei"),

      data: data,
    };

    if (contractOwnerPkey) {
      const signedTx = await web3.eth.accounts.signTransaction(
        tx,
        contractOwnerPkey
      );
      const receipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );
    }
  }
};

(async () => {
  try {
    await addAdmin();
    await addVoterAndPin();
    await addCandidate();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prismaClient.$disconnect;
  }
})();
