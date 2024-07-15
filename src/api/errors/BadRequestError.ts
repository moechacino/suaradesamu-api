import { CustomAPIError } from "./CustomAPIError";

export class BadRequestError extends CustomAPIError {
  constructor(public message: string) {
    super(message, 400);
  }
}
