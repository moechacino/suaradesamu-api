import { FastifyRequest, FastifyReply } from "fastify";
import { VotingService } from "../services/VotingController";
import { ApiResponder } from "../utils/ApiResponder";

export class VotingController {
  static async startVoting(request: FastifyRequest, reply: FastifyReply) {
    const result = await VotingService.startVoting(request);
    ApiResponder.successResponse(reply, 200, result, "Voting has been started");
  }
  static async endVoting(request: FastifyRequest, reply: FastifyReply) {
    const result = await VotingService.endVoting();

    ApiResponder.successResponse(reply, 200, result, "Voting has been ended");
  }
  static async getVotingStatus(request: FastifyRequest, reply: FastifyReply) {
    const result = await VotingService.getVotingStatus();
    ApiResponder.successResponse(reply, 200, result, "");
  }

  static async getVotingCount(request: FastifyRequest, reply: FastifyReply) {
    const result = await VotingService.getVotingCount();
    ApiResponder.successResponse(reply, 200, result, "");
  }
}
