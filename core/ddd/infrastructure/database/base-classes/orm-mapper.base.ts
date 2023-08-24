/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mapper } from "@automapper/core";
import { AggregateRoot } from "@shared-libraries/core/ddd/domain/base-classes/aggregate-root.base";
import { CreateEntityProps } from "@shared-libraries/core/ddd/domain/base-classes/entity.base";
import { DateVO } from "@shared-libraries/core/ddd/domain/value-objects/date.value-object";
import { ID } from "@shared-libraries/core/ddd/domain/value-objects/id.value-object";
import { TenantHelper } from "@shared-libraries/core/utils/tenant.util";
import { TypeormEntityBase } from "./typeorm.entity.base";

export type OrmEntityProps<OrmEntity> = Omit<
  OrmEntity,
  "id" | "createdAt" | "updatedAt"
>;

export interface EntityProps<EntityProps> {
  id: ID;
  props: EntityProps;
}

export abstract class OrmMapper<
  Entity extends AggregateRoot<unknown>,
  OrmEntity
> {
  constructor(
    private entityConstructor: new (props: CreateEntityProps<any>) => Entity,
    private ormEntityConstructor: new (props: any) => OrmEntity,
    private autoMapper: Mapper
  ) {}

  protected abstract toDomainProps(ormEntity: OrmEntity): EntityProps<unknown>;

  protected abstract toOrmProps(entity: Entity): OrmEntityProps<OrmEntity>;

  toDomainEntity(ormEntity: OrmEntity): Entity {
    const { id, props } = this.toDomainProps(ormEntity);
    const ormEntityBase: TypeormEntityBase =
      ormEntity as unknown as TypeormEntityBase;
    return new this.entityConstructor({
      id,
      props,
      createdAt: new DateVO(ormEntityBase.createdAt),
      updatedAt: new DateVO(ormEntityBase.updatedAt),
      tenantId: ormEntityBase.tenantId,
    });
  }

  toOrmEntity(entity: Entity): OrmEntity {
    const props = this.toOrmProps(entity);
    var tenant = new TenantHelper();
    const tenantId = tenant.getTenant() ||   entity.getPropsCopy().tenantId;
    var id = "";
    if (entity.id.value != undefined) {
      id = entity.id.value;
    } else {
      id = entity.id as unknown as string;
    }
    return new this.ormEntityConstructor({
      ...props,
      id: id,
      createdAt: entity.createdAt.value,
      updatedAt: entity.updatedAt.value,
      tenantId: tenantId,
    });
  }
  getAutoMapper() {
    return this.autoMapper;
  }
}
