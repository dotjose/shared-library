import * as crypto from "crypto";

export function generateSepaId() {
  return crypto.randomBytes(15).toString("hex");
}
