import { Logger } from "@nestjs/common";
import { UnitOfWorkPort } from "@shared-libraries/core/ddd/domain/ports/unit-of-work.port";
import { Result } from "@shared-libraries/core/ddd/domain/utils/result.util";
import { rejects } from "assert";
import { QueryRunner, EntityTarget, Repository, getConnection } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";

export class TypeormUnitOfWork implements UnitOfWorkPort {
  constructor(private readonly logger: Logger) {
  }

  private queryRunners: Map<string, QueryRunner> = new Map();

  getQueryRunner(correlationId: string): QueryRunner {
    const queryRunner = this.queryRunners.get(correlationId);
    if (!queryRunner) {
      throw new Error(
        'Query runner not found. Incorrect correlationId or transaction is not started. To start a transaction wrap operations in a "execute" method.'
      );
    }
    return queryRunner;
  }

  getOrmRepository<Entity>(
    entity: EntityTarget<Entity>,
    correlationId: string
  ): Repository<Entity> {
    const queryRunner = this.getQueryRunner(correlationId);
    return queryRunner.manager.getRepository(entity);
  }

  /**
   * Execute a UnitOfWork.
   * Database operations wrapped in a `execute` method will run
   * in a single transactional operation, so everything gets
   * saved (including changes done by Domain Events) or nothing at all.
   */
  async execute<T>(
    correlationId: string,
    callback: () => Promise<T>,
    options?: { isolationLevel: IsolationLevel }
  ): Promise<T> {
    if (!correlationId) {
      throw new Error("Correlation ID must be provided");
    }
    const queryRunner = getConnection().createQueryRunner();
    this.queryRunners.set(correlationId, queryRunner);
    this.logger.debug(`[Starting transaction]`);
    await queryRunner.startTransaction(options?.isolationLevel);
    return new Promise<any>(async (resolve) => {
      try {
        let result = await callback();
        resolve(result);
      } catch (err) {
        let error = Result.err(err);

        resolve(error);
      }
    })
      .then(async (result) => {
        if ((result as unknown as Result<any>)?.isErr) {
          await this.rollbackTransaction(correlationId, result);
          return result;
        }

        try {
          await queryRunner.commitTransaction();
        } catch (error) {
          await this.rollbackTransaction(correlationId, error);
          return Result.err(error).unwrap();
        } finally {
          await this.finish(correlationId);
        }

        this.logger.debug(`[Transaction committed]`);

        return result;
      })
      .catch(async (error) => {
        await this.rollbackTransaction(correlationId, error);
        return Result.err(error).unwrap();
      });
  }

  private async rollbackTransaction(correlationId: string, error: any) {
    const queryRunner = this.getQueryRunner(correlationId);
    if (queryRunner) {
      try {
        await queryRunner.rollbackTransaction();

        this.logger.error(`[Transaction rolled back] ${JSON.stringify(error)}`);
      } finally {
        await this.finish(correlationId);
      }
    }
  }

  private async finish(correlationId: string): Promise<void> {
    const runner = this.getQueryRunner(correlationId);
    if (runner) runner.release();
    this.queryRunners.delete(correlationId);
  }
}
