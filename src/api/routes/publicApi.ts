import { FastifyInstance } from "fastify";
import adminRoutes from "./adminRoutes";
import candidateRoutes from "./candidateRoutes";
import voterRoutes from "./voterRoutes";
import votingRoutes from "./votingRoutes";
import transactionRoutes from "./transactionRoutes";

async function publicApi(server: FastifyInstance) {
  server.register(adminRoutes, { prefix: "/admin" });
  server.register(candidateRoutes, { prefix: "/candidate" });
  server.register(voterRoutes, { prefix: "/voter" });
  server.register(votingRoutes, { prefix: "/voting" });
  server.register(transactionRoutes, { prefix: "/transactions" });
}

export default publicApi;
