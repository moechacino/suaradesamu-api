import { CustomAPIError } from "./CustomAPIError";

export class ConflictRequestError extends CustomAPIError {
  constructor(public message: string) {
    super(message, 409);
  }
}
