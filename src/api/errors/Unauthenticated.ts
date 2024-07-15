import { CustomAPIError } from "./CustomAPIError";

export class Unauthenticated extends CustomAPIError {
  constructor(public message: string) {
    super(message, 401);
  }
}
