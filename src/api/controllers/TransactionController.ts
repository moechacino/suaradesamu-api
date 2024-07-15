import { FastifyRequest, FastifyReply } from "fastify";

import { ApiResponder } from "../utils/ApiResponder";
import { TransactionService } from "../services/TransactionService";

export class TransactionController {
  static async getAllVotedEvents(request: FastifyRequest, reply: FastifyReply) {
    const result = await TransactionService.getAllVotedEvents(request);
    ApiResponder.successResponse(reply, 200, result, "");
  }

  static async getAllTransactions(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const result = await TransactionService.getAllTransactions();
    ApiResponder.successResponse(reply, 200, result, "");
  }
}
