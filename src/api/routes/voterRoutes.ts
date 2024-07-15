import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CustomAPIError } from "../errors/CustomAPIError";
import { VoterValidator } from "../validators/voterValidator";
import { VoterController } from "../controllers/VoterController";
import multer from "fastify-multer";
const registerValidator: object = VoterValidator.register();
const voteValidator: object = VoterValidator.vote();
const getVoteValidator: object = VoterValidator.getVote();
const addVoterValidation = VoterValidator.addVoter();
async function voterRoutes(fastify: FastifyInstance) {
  try {
    fastify.post(
      "/",
      {
        schema: addVoterValidation,
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      VoterController.addVoter
    );
    fastify.post(
      "/register",
      {
        schema: registerValidator,
      },
      VoterController.register
    );
    fastify.post(
      "/vote",
      {
        schema: voteValidator,
      },
      VoterController.vote
    );
    fastify.post("/can-vote", VoterController.hasVoterVote);
    fastify.post(
      "/search",
      {
        schema: getVoteValidator,
      },
      VoterController.getVoter
    );
    fastify.get(
      "/",
      {
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      VoterController.getAllVoter
    );
    fastify.post(
      "/bulk",
      {
        preHandler: multer({ storage: multer.memoryStorage() }).single("file"),
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      VoterController.addVoterBulk
    );
  } catch (error) {
    throw new CustomAPIError(error as string, 500);
  }
}

export default voterRoutes;
