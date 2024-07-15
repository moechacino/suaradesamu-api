import { CustomAPIError } from "./CustomAPIError";

export class NotFoundError extends CustomAPIError {
  constructor(public message: string) {
    super(message, 404);
  }
}
