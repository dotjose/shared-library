import { Injectable } from "@nestjs/common";
import { Client, ClientProxy, Transport } from "@nestjs/microservices";
import { AbstractPublisher } from "./abstract-publisher.service";
@Injectable()
export class RedisPublisher extends AbstractPublisher {
  TRANSPORT = Transport.REDIS;
  PATTERN = "event_bus";

  @Client({
    transport: Transport.REDIS,
    options: {
      url: process.env.REDIS_SERVER_URL,
    },
  })
  client: ClientProxy;

  protected async send(pattern: any, data: any) {
    try {
      await this.client.send(pattern, data).toPromise();
    } catch (e) {
      this.log.error(e);
    }
  }
  protected async sendAsync(pattern: any, data: any) {
    try {
      await this.client.emit(pattern, data);
    } catch (e) {
      this.log.error(e);
    }
  }
}
