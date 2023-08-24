import { AutoMap } from "@automapper/classes";
import {
  Column,
  CreateDateColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export abstract class TypeormEntityBase {
  constructor(props?: unknown) {
    if (props) {
      Object.assign(this, props);
    }
  }
  @AutoMap()
  @PrimaryColumn({ update: false })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({
    update: false,
  })
  createdAt: Date;

  @UpdateDateColumn({})
  updatedAt: Date;
  @Column({ default: null })
  tenantId: string;
}
