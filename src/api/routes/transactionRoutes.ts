import { FastifyInstance } from "fastify";
import { CustomAPIError } from "../errors/CustomAPIError";
import { VotingValidator } from "../validators/votingValidator";
import { TransactionController } from "../controllers/TransactionController";

async function transactionRoutes(fastify: FastifyInstance) {
  try {
    fastify.get("/voted", TransactionController.getAllVotedEvents);
    fastify.get("/", TransactionController.getAllTransactions);
  } catch (error) {
    throw new CustomAPIError(error as string, 500);
  }
}

export default transactionRoutes;
