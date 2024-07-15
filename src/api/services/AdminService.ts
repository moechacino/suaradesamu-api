import { prismaClient } from "../../config/database";
import {
  AdminResponse,
  LoginAdminRequest,
  toAdminResponse,
} from "../models/AdminModel";
import bcrypt from "bcrypt";
import { Unauthenticated } from "../errors/Unauthenticated";
import { NotFoundError } from "../errors/NotFoundError";
import { CustomAPIError } from "../errors/CustomAPIError";
import { FastifyRequest } from "fastify";

export class AdminService {
  static async login(request: FastifyRequest): Promise<AdminResponse> {
    const loginAdminRequest: LoginAdminRequest =
      request.body as LoginAdminRequest;

    let admin = await prismaClient.admin.findUnique({
      where: {
        username: loginAdminRequest.username,
      },
    });
    if (!admin) throw new NotFoundError("you are not registered");

    const isMatch = await bcrypt.compare(
      loginAdminRequest.password,
      admin.password
    );
    if (!isMatch) {
      throw new Unauthenticated("username or password is wrong");
    }

    const token = request.server.jwt.sign(
      {
        id: admin.id,
        username: admin.username,
      },
      { expiresIn: "24h" }
    );

    admin = await prismaClient.admin.update({
      where: { id: admin.id },
      data: {
        token: token,
      },
    });

    return toAdminResponse(admin);
  }

  static async logout(id: number): Promise<AdminResponse> {
    try {
      const admin = await prismaClient.admin.update({
        where: {
          id: id,
        },
        data: {
          token: null,
        },
      });

      return toAdminResponse(admin);
    } catch (error) {
      throw new CustomAPIError(
        JSON.stringify({
          message: "Failed to logout",
          errors: error,
        }),
        500
      );
    }
  }
}
