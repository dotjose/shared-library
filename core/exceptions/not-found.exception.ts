import { ExceptionBase } from "./exception.base";
import { ExceptionCodes } from "./exception.codes";

export class NotFoundException extends ExceptionBase {
  internalCode: string;
  constructor(message = "Not found") {
    super(message);
  }

  readonly code = ExceptionCodes.notFound;
}
