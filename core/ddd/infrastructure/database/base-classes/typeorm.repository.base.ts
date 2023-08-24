import { FindConditions, FindOneOptions, ObjectLiteral, Repository } from "typeorm";
import {
  QueryParams,
  FindManyPaginatedParams,
  RepositoryPort,
  DataWithPaginationMeta,
} from "../../../domain/ports/repository.ports";
import { OrmMapper } from "./orm-mapper.base";
import { Logger } from "@nestjs/common";
import { AggregateRoot } from "@shared-libraries/core/ddd/domain/base-classes/aggregate-root.base";
import { DomainEvents } from "@shared-libraries/core/ddd/domain/domain-events";
import { ID } from "@shared-libraries/core/ddd/domain/value-objects/id.value-object";
import { TenantHelper } from "@shared-libraries/core/utils/tenant.util";

export type WhereCondition<OrmEntity> =
  | FindConditions<OrmEntity>[]
  | FindConditions<OrmEntity>
  | ObjectLiteral
  | string;

export abstract class TypeormRepositoryBase<Entity extends AggregateRoot<unknown>, EntityProps, OrmEntity>
  implements RepositoryPort<Entity, EntityProps>
{
  protected constructor(
    protected readonly repository: Repository<OrmEntity>,
    protected readonly mapper: OrmMapper<Entity, OrmEntity>,
    protected readonly logger: Logger
  ) {}

  /**
   * Specify relations to other tables.
   * For example: `relations = ['user', ...]`
   */
  protected abstract relations: string[];

  protected tableName = this.repository.metadata.tableName;

  protected abstract prepareQuery(params: QueryParams<EntityProps>): WhereCondition<OrmEntity>;

  async save(entity: Entity): Promise<Entity> {
    entity.validate(); // Protecting invariant before saving
    const ormEntity = this.mapper.toOrmEntity(entity);

    const result = await this.repository.save(ormEntity as any);
    await DomainEvents.publishEvents(entity.id, this.logger, this.correlationId);
    this.logger.debug(`[${entity.constructor.name}] persisted ${entity.id.value}`);
    return this.mapper.toDomainEntity(result);
  }
  async update(_Id: string, entity: Entity): Promise<any> {
    entity.validate(); // Protecting invariant before saving
    const ormEntity = this.mapper.toOrmEntity(entity);
    const result = await this.repository.save(ormEntity as any);
    await DomainEvents.publishEvents(entity.id, this.logger, this.correlationId);
    this.logger.debug(`[${entity.constructor.name}] updated ${entity.id.value}`);
    return result;
  }

  async saveMultiple(entities: Entity[]): Promise<Entity[]> {
    const ormEntities = entities.map((entity) => {
      entity.validate();
      return this.mapper.toOrmEntity(entity);
    });
    const result = await this.repository.save(ormEntities as any);
    await Promise.all(entities.map((entity) => DomainEvents.publishEvents(entity.id, this.logger, this.correlationId)));
    this.logger.debug(`[${entities}]: persisted ${entities.map((entity) => entity.id)}`);
    return result.map((entity) => this.mapper.toDomainEntity(entity));
  }

  async findOne(params: QueryParams<EntityProps> = {}, _options?: FindOneOptions<Entity>): Promise<Entity | undefined> {
    var tenantHelper = new TenantHelper();
    const tenantId = tenantHelper.getTenant();
    params.tenantId = tenantId;
    const where = this.prepareQuery(params);
    const found = await this.repository.findOne({
      where,
      relations: this.relations,
    });
    return found ? this.mapper.toDomainEntity(found) : undefined;
  }

  async findOneOrThrow(params: QueryParams<EntityProps> = {}): Promise<Entity> {
    const found = await this.findOne(params);
    if (!found) {
      // NotFoundException();
    }
    return found;
  }

  async findOneByIDOrThrow(id: ID): Promise<Entity> {
    const found = await this.repository.findOne({
      where: { id: id.value },
    });

    return this.mapper.toDomainEntity(found);
  }
  async findOneByIdOrThrow(id: string): Promise<Entity> {
    const found = await this.repository.findOne({
      where: { id: id },
    });

    return this.mapper.toDomainEntity(found);
  }
  async findOneByID(id: ID): Promise<Entity> {
    const found = await this.repository.findOne({
      where: { id: id.value },
    });

    return this.mapper.toDomainEntity(found);
  }

  async findMany(params: QueryParams<EntityProps> = {}): Promise<Entity[]> {
    var tenantHelper = new TenantHelper();
    const tenantId = tenantHelper.getTenant();
    params.tenantId = tenantId;
    const result = await this.repository.find({
      where: this.prepareQuery(params),
      relations: this.relations,
    });

    return result.map((item) => this.mapper.toDomainEntity(item));
  }

  async findManyPaginated({
    params = {},
    pagination,
    orderBy,
  }: FindManyPaginatedParams<EntityProps>): Promise<DataWithPaginationMeta<EntityProps[]>> {
    var tenantHelper = new TenantHelper();
    const tenantId = tenantHelper.getTenant();
    params.tenantId = tenantId;
    const [data, count] = await this.repository.findAndCount({
      skip: pagination?.skip,
      take: pagination?.limit,
      where: this.prepareQuery(params),
      relations: this.relations,
    });

    const result: DataWithPaginationMeta<any> = {
      data: data.map((item) => this.mapper.toDomainEntity(item).getPropsCopy()),
      count,
      limit: pagination?.limit,
      page: pagination?.page,
    };

    return result;
  }

  async delete(entity: Entity): Promise<Entity> {
    entity.validate();
    await this.repository.remove(this.mapper.toOrmEntity(entity));
    await DomainEvents.publishEvents(entity.id, this.logger, this.correlationId);
    this.logger.debug(`[${entity.constructor.name}] deleted ${entity.id.value}`);
    return entity;
  }

  protected correlationId?: string;

  setCorrelationId(correlationId: string): this {
    this.correlationId = correlationId;
    this.setContext();
    return this;
  }

  private setContext() {}
}
