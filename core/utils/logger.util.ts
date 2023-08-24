
import { Injectable, LoggerService } from "@nestjs/common";
import { Tracer, Context } from "@opentelemetry/api";
@Injectable()
export class LoggerUtil implements LoggerService {
  constructor(private tracer: Tracer, private context: Context) {
  }

  log(message: string, ...meta: unknown[]): void {
    let timestamp = new Date().toUTCString();
    this.context.setValue(Symbol("Log"), JSON.stringify({ message, ...meta, timestamp }));

  }
  error(_message: string, _trace?: unknown, ..._meta: unknown[]): void { }
  warn(_message: string, ..._meta: unknown[]): void { }
  debug(_message: string, ..._meta: unknown[]): void { }
  setContext(_context: string): void { }
}
