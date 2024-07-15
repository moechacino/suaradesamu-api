import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { adminValidator } from "../validators/adminValidator";
import { AdminController } from "../controllers/AdminController";
import { CustomAPIError } from "../errors/CustomAPIError";

const loginValidator: object = adminValidator.login();
async function adminRoutes(fastify: FastifyInstance) {
  try {
    fastify.post(
      "/login",
      {
        schema: loginValidator,
      },
      AdminController.login
    );

    fastify.patch(
      "/logout",
      {
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      AdminController.logout
    );
  } catch (error) {
    throw new CustomAPIError(error as string, 500);
  }
}

export default adminRoutes;
