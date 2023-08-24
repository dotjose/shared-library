import { CommandBus, QueryBus } from "@nestjs/cqrs";

export abstract class RestBaseController {
  protected readonly commandBus: CommandBus;
  protected readonly queryBus: QueryBus;
  constructor(commandBus: CommandBus, queryBus: QueryBus) {
    this.commandBus = commandBus;
    this.queryBus = queryBus;
  }
}
