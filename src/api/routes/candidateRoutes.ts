import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
} from "fastify";
import path from "path";
import { CustomAPIError } from "../errors/CustomAPIError";
import { CandidateController } from "../controllers/CandidateController";
import multer from "fastify-multer";
import multerOption from "../plugins/multer";
import { CandidateValidator } from "../validators/candidateValidator";
const createOrganizationValidation = CandidateValidator.createOrganization();
const createWorkExperienceValidation =
  CandidateValidator.createWorkExperience();
const createEducationValidation = CandidateValidator.createEducation();
const createWorkPlanValidation = CandidateValidator.createWorkPlan();
async function candidateRoutes(fastify: FastifyInstance) {
  try {
    fastify.post("/:id", CandidateController.testCreateAccount);
    fastify.get("/", CandidateController.getAll);
    fastify.get("/:id", CandidateController.getOne);
    fastify.post(
      "/create",
      {
        preHandler: multer(multerOption).single("file"),
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      CandidateController.create
    );

    fastify.post(
      "/credibility-sentiment/:id",
      {
        preHandler: multer({
          storage: multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, "uploads");
            },
            filename: function (req, file, cb) {
              cb(null, file.originalname);
            },
          }),
        }).single("file"),
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      CandidateController.addCredibilitySentiment
    );

    fastify.post(
      "/organization/:id",
      {
        schema: createOrganizationValidation,
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      CandidateController.addOrganizationExperience
    );
    fastify.post(
      "/work-experience/:id",
      {
        schema: createWorkExperienceValidation,
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      CandidateController.addWorkExperience
    );
    fastify.post(
      "/education/:id",
      {
        schema: createEducationValidation,
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      CandidateController.addEducation
    );
    fastify.post(
      "/work-plan/:id",
      {
        schema: createWorkPlanValidation,
        onRequest: (request: FastifyRequest, reply: FastifyReply) =>
          fastify.authenticate(request, reply),
      },
      CandidateController.addWorkPlan
    );
  } catch (error) {
    throw new CustomAPIError(error as string, 500);
  }
}

export default candidateRoutes;
