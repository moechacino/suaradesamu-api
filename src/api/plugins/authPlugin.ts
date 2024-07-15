import { fastifyPlugin } from "fastify-plugin";
import { FastifyPluginCallback, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { Unauthenticated } from "../errors/Unauthenticated";
import { prismaClient } from "../../config/database";

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: Function;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: number;
      username: string;
    };
  }
}
const SECRET_KEY = process.env.JWT_SECRET || "supersecret";

const authPlugin: FastifyPluginCallback = (server, undefined, done) => {
  server.register(fastifyJwt, { secret: SECRET_KEY });

  server.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authHeader = request.headers.authorization || null;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new Unauthenticated("no token provided");
        }
        const token = authHeader.split(" ")[1];
        const decoded: {
          id: number;
          username: string;
        } = await request.jwtVerify();
        const id = decoded.id;
        const isExist = await prismaClient.admin.findUnique({
          where: { id: id },
        });
        if (isExist?.token !== token) {
          throw new Unauthenticated("no access");
        }
      } catch (error) {
        reply.send(error);
      }
    }
  );

  done();
};

export default fastifyPlugin(authPlugin);
