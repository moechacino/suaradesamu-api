import { Transaction } from "web3";
import { prismaClient } from "../../config/database";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import {
  web3,
  votingContract,
  contractOwner,
  contractAddress,
  contractOwnerPkey,
} from "../../config/web3";
import { NotFoundError } from "../errors/NotFoundError";
import {
  CandidateCreateRequest,
  CandidateResponse,
  EducationCreateRequest,
  OrganizationCreateRequest,
  WorkExperienceCreateRequest,
  WorkPlanCreateRequest,
  toCandidateResponse,
} from "../models/CandidateModel";
import { File } from "fastify-multer/lib/interfaces";
import { MulterRequest } from "../../types/multerType";
import { FastifyRequest } from "fastify";
import { BadRequestError } from "../errors/BadRequestError";
import axios from "axios";
function stringifyObj(obj: object) {
  let cache: any = [];
  let str = JSON.stringify(obj, function (key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // reset the cache
  return str;
}
export class CandidateService {
  static async create(request: MulterRequest): Promise<CandidateResponse> {
    const createRequest: CandidateCreateRequest =
      request.body as CandidateCreateRequest;

    const file = request.file as File;

    const transaction = await prismaClient.$transaction(
      async (prismaClient) => {
        const candidate = await prismaClient.candidate.create({
          data: {
            name: createRequest.name,
            age: parseInt(createRequest.age.toString()),
            noUrut: parseInt(createRequest.noUrut.toString()),
            visi: createRequest.visi,
            photoProfileAlt: file.filename!,
            photoProfileUrl: `https://dory-liberal-uniformly.ngrok-free.app/profile/${file.filename}`,
          },
        });

        if (candidate) {
          const data = await votingContract.methods
            .addCandidate(candidate.name, candidate.noUrut)
            .encodeABI();

          const tx: Transaction = {
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
        }
        return { candidate };
      }
    );

    return toCandidateResponse(transaction["candidate"]);
  }

  static async addCredibilitySentiment(request: MulterRequest): Promise<any> {
    const { id } = request.params as { id: string };
    if (isNaN(Number(id))) {
      throw new BadRequestError("id must be number");
    }
    if (!request.file) {
      throw new BadRequestError("File buffer is missing in request");
    }

    const formData = new FormData();
    if (request.file.path) {
      formData.append("file", fs.createReadStream(request.file.path));
    }
    const response = await axios.post(
      "http://localhost:5000/analyze",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const negative_percentage = response.data.negative_percentage;
    const positive_percentage = response.data.positive_percentage;

    const positive_percentage_rounded = positive_percentage.toFixed(1);
    const negative_percentage_rounded = negative_percentage.toFixed(1);
    const transaction = await prismaClient.$transaction(
      async (prismaClient) => {
        const updateCandidate = await prismaClient.candidate.update({
          where: {
            id: parseInt(id),
          },
          data: {
            credibility: positive_percentage_rounded,
          },
        });
        const date_from = Date.parse(response.data.oldest_date);
        const date_to = Date.parse(response.data.newest_date);
        const isExist = await prismaClient.credibility.findUnique({
          where: {
            candidateId: parseInt(id),
          },
        });
        let credibility;
        if (isExist) {
          credibility = await prismaClient.credibility.update({
            where: {
              candidateId: parseInt(id),
            },
            data: {
              positive: positive_percentage_rounded,
              negative: negative_percentage_rounded,
              date_from: new Date(date_from),
              date_to: new Date(date_to),
            },
          });
        } else {
          credibility = await prismaClient.credibility.create({
            data: {
              candidateId: parseInt(id),
              positive: positive_percentage_rounded,
              negative: negative_percentage_rounded,
              date_from: new Date(date_from),
              date_to: new Date(date_to),
            },
          });
        }

        return { updateCandidate, credibility };
      }
    );

    return {
      positive_percentage: positive_percentage_rounded,
      negative_percentage: negative_percentage_rounded,
      candidate: transaction,
    };
  }

  static async addOrganization(request: FastifyRequest): Promise<object> {
    const { id } = request.params as { id: string };
    if (isNaN(Number(id))) {
      throw new BadRequestError("id must be number");
    }
    const organizationRequest: OrganizationCreateRequest =
      request.body as OrganizationCreateRequest;
    const organization = await prismaClient.organizationExperience.create({
      data: {
        candidate: { connect: { id: parseInt(id) } },
        title: organizationRequest.title,
        periodStart: new Date(organizationRequest.periodStart),
        periodEnd: organizationRequest.periodEnd
          ? new Date(organizationRequest.periodEnd)
          : null,
      },
    });
    return organization;
  }

  static async addWorkExperience(request: FastifyRequest): Promise<object> {
    const { id } = request.params as { id: string };
    if (isNaN(Number(id))) {
      throw new BadRequestError("id must be number");
    }
    const workExperienceRequest: WorkExperienceCreateRequest =
      request.body as WorkExperienceCreateRequest;

    const workExperience = await prismaClient.workExperience.create({
      data: {
        candidate: { connect: { id: parseInt(id) } },
        title: workExperienceRequest.title,
        periodStart: new Date(workExperienceRequest.periodStart),
        periodEnd: workExperienceRequest.periodEnd
          ? new Date(workExperienceRequest.periodEnd)
          : null,
      },
    });
    return workExperience;
  }

  static async addEducation(request: FastifyRequest): Promise<object> {
    const { id } = request.params as { id: string };
    if (isNaN(Number(id))) {
      throw new BadRequestError("id must be number");
    }
    const educationRequest: EducationCreateRequest =
      request.body as EducationCreateRequest;
    const education = await prismaClient.education.create({
      data: {
        candidate: { connect: { id: parseInt(id) } },
        degree: educationRequest.degree,
        institution: educationRequest.institution,
        periodStart: new Date(educationRequest.periodStart),
        periodEnd: educationRequest.periodEnd
          ? new Date(educationRequest.periodEnd)
          : null,
      },
    });
    return education;
  }

  static async addWorkPlan(request: FastifyRequest): Promise<object> {
    const { id } = request.params as { id: string };
    if (isNaN(Number(id))) {
      throw new BadRequestError("id must be number");
    }
    const workPlanRequest: WorkPlanCreateRequest =
      request.body as WorkPlanCreateRequest;
    const workPlan = await prismaClient.workPlan.create({
      data: {
        candidate: { connect: { id: parseInt(id) } },
        title: workPlanRequest.title,
        detail: workPlanRequest.detail,
      },
    });
    return workPlan;
  }

  static async getOne(id: number): Promise<any> {
    const candidate = await prismaClient.candidate.findUnique({
      where: {
        id: id,
      },
      include: {
        credibilityDetails: {
          select: {
            positive: true,
            negative: true,
            date_from: true,
            date_to: true,
          },
        },
        organization: {
          select: {
            id: true,
            title: true,
            periodStart: true,
            periodEnd: true,
          },
        },
        workExperience: {
          select: {
            id: true,
            title: true,
            periodStart: true,
            periodEnd: true,
          },
        },
        workPlan: {
          select: {
            id: true,
            title: true,
            detail: true,
          },
        },
        education: {
          select: {
            id: true,
            degree: true,
            institution: true,
            periodStart: true,
            periodEnd: true,
          },
        },
      },
    });

    if (!candidate) {
      return null;
    }

    const formatDate = (
      date: Date | null,
      includeTime: boolean = false
    ): string | null => {
      if (!date) return "sekarang";
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      if (includeTime) {
        options.hour = "numeric";
        options.minute = "numeric";
        options.hour12 = false; // Format 24 jam
      }
      return new Intl.DateTimeFormat("id-ID", options).format(date);
    };
    const formattedCandidate = {
      ...candidate,
      organization: candidate.organization.map((org) => ({
        ...org,
        periodStart: formatDate(org.periodStart),
        periodEnd: formatDate(org.periodEnd),
      })),
      workExperience: candidate.workExperience.map((exp) => ({
        ...exp,
        periodStart: formatDate(exp.periodStart),
        periodEnd: formatDate(exp.periodEnd),
      })),
      education: candidate.education.map((edu) => ({
        ...edu,
        periodStart: formatDate(edu.periodStart),
        periodEnd: formatDate(edu.periodEnd),
      })),
      credibilityDetails: Array.isArray(candidate.credibilityDetails)
        ? candidate.credibilityDetails.map((detail) => ({
            ...detail,
            date_from: formatDate(detail.date_from, true),
            date_to: formatDate(detail.date_to, true),
          }))
        : candidate.credibilityDetails
        ? {
            ...candidate.credibilityDetails,
            date_from: formatDate(candidate.credibilityDetails.date_from, true),
            date_to: formatDate(candidate.credibilityDetails.date_to, true),
          }
        : null,
    };

    return formattedCandidate;
  }

  static async getAll(): Promise<any> {
    const candidates = await prismaClient.candidate.findMany({
      orderBy: {
        noUrut: "asc",
      },
      include: {
        credibilityDetails: {
          select: {
            date_from: true,
            date_to: true,
            positive: true,
            negative: true,
          },
        },
        organization: {
          select: {
            id: true,
            title: true,
            periodStart: true,
            periodEnd: true,
          },
        },
        workExperience: {
          select: {
            id: true,
            title: true,
            periodStart: true,
            periodEnd: true,
          },
        },
        workPlan: {
          select: {
            id: true,
            title: true,
            detail: true,
          },
        },
        education: {
          select: {
            id: true,
            degree: true,
            institution: true,
            periodStart: true,
            periodEnd: true,
          },
        },
      },
    });

    const formatDate = (
      date: Date | null,
      includeTime: boolean = false
    ): string | null => {
      if (!date) return "sekarang";
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      if (includeTime) {
        options.hour = "numeric";
        options.minute = "numeric";
        options.second = "numeric";
        options.hour12 = false; // Format 24 jam
      }
      return new Intl.DateTimeFormat("id-ID", options).format(date);
    };

    const formattedCandidates = candidates.map((candidate) => ({
      ...candidate,
      organization: candidate.organization.map((org) => ({
        ...org,
        periodStart: formatDate(org.periodStart),
        periodEnd: formatDate(org.periodEnd),
      })),
      workExperience: candidate.workExperience.map((exp) => ({
        ...exp,
        periodStart: formatDate(exp.periodStart),
        periodEnd: formatDate(exp.periodEnd),
      })),
      education: candidate.education.map((edu) => ({
        ...edu,
        periodStart: formatDate(edu.periodStart),
        periodEnd: formatDate(edu.periodEnd),
      })),

      credibilityDetails: Array.isArray(candidate.credibilityDetails)
        ? candidate.credibilityDetails.map((detail) => ({
            ...detail,
            date_from: formatDate(detail.date_from, true),
            date_to: formatDate(detail.date_to, true),
          }))
        : candidate.credibilityDetails
        ? {
            ...candidate.credibilityDetails,
            date_from: formatDate(candidate.credibilityDetails.date_from, true),
            date_to: formatDate(candidate.credibilityDetails.date_to, true),
          }
        : null,
    }));

    return formattedCandidates;
  }

  static async testCreateAccount(id: number): Promise<any> {
    const candidate = await prismaClient.candidate.findUnique({
      where: {
        id: id,
      },
    });

    if (!candidate) {
      throw new NotFoundError("candidate not found");
    }
    const data = await votingContract.methods
      .addCandidate(candidate.name, candidate.id)
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
      return receipt.transactionHash;
    } else {
      return false;
    }
  }
}
