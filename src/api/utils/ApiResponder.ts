import fastJsonStringify from "fast-json-stringify";
import { FastifyReply } from "fastify";
const successSchemaObject = {
  type: "object",
  properties: {
    statusCode: { type: "integer" },
    success: { type: "boolean" },
    data: { type: "object", additionalProperties: true },
    message: { type: "string" },
  },
} as const;

const successSchemaArray = {
  type: "object",
  properties: {
    statusCode: { type: "integer" },
    success: { type: "boolean" },
    data: { type: "array", additionalProperties: true },
    message: { type: "string" },
  },
} as const;

const errSchema = {
  type: "object",
  properties: {
    statusCode: { type: "integer" },
    success: { type: "boolean" },
    error: { type: "string" },
  },
} as const;

const successStringifyObject = fastJsonStringify(successSchemaObject);
const successStringifyArray = fastJsonStringify(successSchemaArray);
const errStringify = fastJsonStringify(errSchema);

export class ApiResponder {
  static successResponse(
    reply: FastifyReply,
    statusCode: number,
    data: object | object[],
    message: string
  ) {
    const response = {
      statusCode,
      success: true,
      data,
      message,
    };
    if (Array.isArray(data)) {
      reply
        .status(statusCode)
        .type("application/json")
        .send(successStringifyArray(response));
    } else {
      reply
        .status(statusCode)
        .type("application/json")
        .send(successStringifyObject(response));
    }
  }

  static errorResponse(reply: FastifyReply, statusCode: number, error: string) {
    const response = {
      statusCode,
      success: false,
      error,
    };
    reply
      .status(statusCode)
      .type("application/json")
      .send(errStringify(response));
  }
}
