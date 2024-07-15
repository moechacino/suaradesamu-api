import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CustomAPIError } from "../errors/CustomAPIError";
import { VotingController } from "../controllers/VotingController";
import { VotingValidator } from "../validators/votingValidator";

const startVotingValidation = VotingValidator.startVoting();
async function votingRoutes(fastify: FastifyInstance) {
  try {
    fastify.post(
      "/start",
      {
        schema: startVotingValidation,
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      VotingController.startVoting
    );
    fastify.post(
      "/end",
      {
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      VotingController.endVoting
    );
    fastify.get("/status", VotingController.getVotingStatus);
    fastify.get("/real-count", VotingController.getVotingCount);
  } catch (error) {
    throw new CustomAPIError(error as string, 500);
  }
}

export default votingRoutes;
