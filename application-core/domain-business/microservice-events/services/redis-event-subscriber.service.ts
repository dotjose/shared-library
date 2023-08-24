import { Injectable, Logger } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";
import { EventBus } from "@nestjs/cqrs";
import { plainToClass } from "class-transformer";
import { Events } from "../events";

@Injectable()
export class RedisEventSubscriberService {
  constructor(
    private readonly eventBus: EventBus,
    protected readonly log: Logger
  ) {}

  @EventPattern("event_bus")
  async subscribe(data: any) {
    try {
      const event = Events[data.event];

      if (!event) {
        throw new Error(`Not such ${data.event}.`);
      }

      return this.eventBus.publish(plainToClass(event, data.payload));
    } catch (e) {
      this.log.error(e);
    }
  }
}
