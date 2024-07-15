import Fastify from "fastify";
import { CustomAPIError } from "./api/errors/CustomAPIError";
import publicApi from "./api/routes/publicApi";
import { ApiResponder } from "./api/utils/ApiResponder";
import authPlugin from "./api/plugins/authPlugin";
import multer from "fastify-multer";
import cors from "@fastify/cors";
import path from "path";
import {
  ContractExecutionError,
  Eip838ExecutionError,
  TransactionNotFound,
} from "web3";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
const port = (Number(process.env.PORT) as number) || 9000;
const allowedOrigins = [
  process.env.DEV_ORIGIN || "http://localhost:9000",
  process.env.PROD_ORIGIN,
  process.env.NGROK_ORIGIN,
].filter((origin): origin is string => Boolean(origin));

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
});
const pathProfile = path.join(__dirname, "../uploads/candidate/profile");

fastify.register(require("@fastify/static"), {
  root: pathProfile,
  prefix: "/profile/",
});

fastify.register(multer.contentParser);

fastify.setErrorHandler((error, request, reply) => {
  console.log(error);

  if (error instanceof CustomAPIError) {
    ApiResponder.errorResponse(reply, error.statusCode, error.message);
  } else if (error.validation) {
    ApiResponder.errorResponse(reply, 400, error.message);
  } else if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      ApiResponder.errorResponse(reply, 409, "Some data has used");
    }
    ApiResponder.errorResponse(reply, 500, error.message);
  } else if (error instanceof ContractExecutionError) {
    if (error.cause instanceof Eip838ExecutionError) {
      ApiResponder.errorResponse(reply, 409, error.cause.message);
    }
    ApiResponder.errorResponse(reply, 500, error.message);
  } else if (error.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED") {
    ApiResponder.errorResponse(reply, 401, error.message);
  } else if (error instanceof TransactionNotFound) {
    ApiResponder.errorResponse(reply, 404, "Transaksi tidak ditemukan");
  } else {
    console.log(error.code);
    reply.status(500).send("Something went wrong please try again later");
  }
});

fastify.register(authPlugin);

fastify.register(publicApi, { prefix: "/api" });
fastify.get("/", async (req, res) => {
  res.send("Home");
});

fastify.listen({ port: port, host: "127.0.0.1" }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`server is listening on ${address}`);
});
