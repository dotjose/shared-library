import { KafkaAvroDeserializer } from "./kafka-avro.deserializer";
import { Test, TestingModule } from "@nestjs/testing";
import { KafkaLogger } from "../loggers";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
jest.mock("@kafkajs/confluent-schema-registry");

describe("KafkaAvroDeserializer", () => {
  let kafkaAvroDeserializer: KafkaAvroDeserializer;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaAvroDeserializer,
        {
          provide: KafkaLogger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();
    kafkaAvroDeserializer = module.get<KafkaAvroDeserializer>(KafkaAvroDeserializer);
  });

  it("should be defined", () => {
    expect(kafkaAvroDeserializer).toBeDefined();
  });

  test.skip("should initialize the schema registry and run a probe", async () => {
    const getLatestSchemaId = jest.spyOn(SchemaRegistry.prototype, "getLatestSchemaId").mockResolvedValueOnce(1);

    await kafkaAvroDeserializer.initialize(
      {
        api: { host: "http://my-host.com:9093" },
      },
      "random.subject"
    );
    expect(SchemaRegistry).toHaveBeenCalledWith(
      {
        host: "http://my-host.com:9093",
      },
      undefined
    );
    expect(getLatestSchemaId).toHaveBeenCalledWith("random.subject");
  });

  test.skip("should deserialize a kafka message properly", async () => {
    const date = new Date("August 10, 2021");
    const decode = jest.spyOn(SchemaRegistry.prototype, "decode").mockImplementation(async (msg: Buffer) => {
      if (msg.toString() === "test-key") {
        return {
          id: "test-id1",
        };
      }
      return {
        name: "name-val",
      };
    });

    const result = await kafkaAvroDeserializer.deserialize({
      value: Buffer.from("test-value"),
      key: Buffer.from("test-key"),
      timestamp: date.valueOf().toString(),
      attributes: 0,
      offset: "10",
      size: 1,
    });
    expect(result.arrival).toEqual(date);
    expect(result.event).toEqual({
      name: "test-value",
    });
    expect(result.key).toEqual({
      id: "test-key",
    });
    expect(decode).toHaveBeenCalledTimes(2);
  });
});
