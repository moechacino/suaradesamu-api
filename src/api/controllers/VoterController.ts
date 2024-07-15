import { FastifyReply, FastifyRequest } from "fastify";
import { VoterService } from "../services/VoterServices";
import { ApiResponder } from "../utils/ApiResponder";
import { MulterRequest } from "../../types/multerType";
export class VoterController {
  static async addVoterBulk(request: MulterRequest, reply: FastifyReply) {
    const result = await VoterService.addVoterBulk(request);
    ApiResponder.successResponse(
      reply,
      201,
      result,
      "Berhasil Menambahkan Pemilih"
    );
  }

  static async addVoter(request: FastifyRequest, reply: FastifyReply) {
    const result = await VoterService.addVoter(request);
    ApiResponder.successResponse(reply, 201, result, "");
  }
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const result = await VoterService.register(request);
    ApiResponder.successResponse(reply, 201, result, "");
  }
  static async vote(request: FastifyRequest, reply: FastifyReply) {
    const result = await VoterService.vote(request);
    ApiResponder.successResponse(reply, 200, result, "");
  }

  static async getAllVoter(request: FastifyRequest, reply: FastifyReply) {
    const result = await VoterService.getAll();
    ApiResponder.successResponse(reply, 200, result, "");
  }
  static async getVoter(request: FastifyRequest, reply: FastifyReply) {
    const result = await VoterService.getVote(request);
    ApiResponder.successResponse(reply, 200, result, "");
  }

  static async hasVoterVote(request: FastifyRequest, reply: FastifyReply) {
    const result = await VoterService.hasVoterVote(request);
    if (result === true) {
      ApiResponder.errorResponse(reply, 409, "Anda Sudah Melakukan Pemilihan");
    }
    ApiResponder.successResponse(reply, 200, result, "Silahkan memilih");
  }
}
