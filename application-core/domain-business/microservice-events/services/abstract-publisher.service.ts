import { IEvent, IEventPublisher } from "@nestjs/cqrs";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export abstract class AbstractPublisher implements IEventPublisher {
  abstract PATTERN: string;

  constructor(protected readonly log: Logger) {}

  publish<T extends IEvent>(event: T): void {
    const data = {
      payload: event,
      event: event.constructor.name,
    };

    this.send(this.PATTERN, data);
  }
  publishAsync<T extends IEvent>(event: T): Promise<any> {
    const data = {
      payload: event,
      event: event.constructor.name,
    };

    return this.sendAsync({ cmd: this.PATTERN }, data);
  }
  protected abstract send(pattern: any, data: any): any;
  protected abstract sendAsync(pattern: any, data: any): Promise<any>;
}
