import { ExceptionBase } from "./exception.base";
import { ExceptionCodes } from "./exception.codes";

export class ConflictException extends ExceptionBase {
  internalCode: string;
  readonly code = ExceptionCodes.conflict;
}
