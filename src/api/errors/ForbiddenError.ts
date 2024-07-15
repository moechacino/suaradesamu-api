import { CustomAPIError } from "./CustomAPIError";

export class ForbiddenError extends CustomAPIError {
  constructor(public message: string) {
    super(message, 403);
  }
}
