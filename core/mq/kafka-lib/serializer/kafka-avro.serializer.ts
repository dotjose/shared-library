import { Injectable } from "@nestjs/common";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { KafkaLogger } from "../loggers";
import { IKafkaModuleSchemaRegistryConfiguration } from "../interfaces";
import {
  getSchemaRegistryKeySubjectByTopic,
  getSchemaRegistryValueSubjectByTopic,
} from "../helpers/topic-subject.helper";
import { EmitKafkaEventPayload } from "../interfaces";
import { Message } from "kafkajs";

@Injectable()
export class KafkaAvroSerializer {
  private schemaRegistry: SchemaRegistry;
  schemas: Map<string, { keyId: number | null; valueId: number }> = new Map();

  constructor(private readonly kafkaLogger: KafkaLogger) {}

  /**
   * Initialize
   * @param configuration
   * @param topics
   */
  async initialize(
    configuration: IKafkaModuleSchemaRegistryConfiguration,
    topics: string[]
  ): Promise<void> {
    this.schemaRegistry = new SchemaRegistry(
      configuration.api,
      configuration?.options
    );
    await this.fetchAllSchemaIds(topics);
  }

  /**
   * Fetch all schemas initially
   * @param topics
   * @private
   */
  private async fetchAllSchemaIds(topics: string[]): Promise<void> {
    for await (const topic of topics) {
      await this.fetchSchemaIds(topic);
    }
  }

  /**
   * Fetch a single schema by topic and store in internal schema map
   * @param topic
   * @private
   */
  private async fetchSchemaIds(topic: string): Promise<void> {
    try {
      const keyId =
        (await this.schemaRegistry.getLatestSchemaId(
          getSchemaRegistryKeySubjectByTopic(topic)
        )) || null;
      const valueId = await this.schemaRegistry.getLatestSchemaId(
        getSchemaRegistryValueSubjectByTopic(topic)
      );
      this.schemas.set(topic, {
        keyId,
        valueId,
      });
    } catch (reject) {
      /*  this.kafkaLogger.error(
          `Error while fetching schema ids for topic ${topic}`,
          reject,
        );*/
      //  // throw reject;
    }
  }

  /**
   * Serialize given payload to be compliant with KafkaJS
   * @param value
   */
  async serialize<V, K>(
    value: EmitKafkaEventPayload<V, K> & Omit<Message, "key" | "value">
  ): Promise<any | undefined> {
    const message: any = {
      value: value, // await this.schemaRegistry.encode(ids.valueId, value.event),
      partition: value?.partition,
      headers: value?.headers,
      timestamp: value?.timestamp,
    };

    return message;
  }
}
