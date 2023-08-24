import { Module, Logger } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { RedisPublisher } from "./services/redis-publisher.service";
import { RedisEventSubscriberService } from "./services/redis-event-subscriber.service";

@Module({
  imports: [ConfigModule.forRoot(), CqrsModule],
  providers: [RedisEventSubscriberService, RedisPublisher, Logger],
  exports: [RedisEventSubscriberService, RedisPublisher],
})
export class RedisEventBusModule {}
