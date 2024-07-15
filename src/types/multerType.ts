import { FastifyRequest } from "fastify";
import { File } from "fastify-multer/lib/interfaces";

export interface MulterRequest extends FastifyRequest {
  file: File;
}
