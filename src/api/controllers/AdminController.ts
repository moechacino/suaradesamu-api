import { FastifyReply, FastifyRequest } from "fastify";
import { LoginAdminRequest } from "../models/AdminModel";
import { AdminService } from "../services/AdminService";
import { ApiResponder } from "../utils/ApiResponder";

export class AdminController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    const result = await AdminService.login(request);
    console.log(result);
    ApiResponder.successResponse(reply, 200, result, "");
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    const id = request.user.id;
    const result = await AdminService.logout(id);
    ApiResponder.successResponse(reply, 200, result, "");
  }
}
