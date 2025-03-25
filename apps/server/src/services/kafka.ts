import { Kafka, Producer, Partitioners } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma";

// Validate required environment variables
if (!process.env.KAFKA_BROKER_URL || !process.env.KAFKA_USERNAME || !process.env.KAFKA_PASSWORD) {
  throw new Error('Missing required Kafka environment variables');
}

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER_URL],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    mechanism: "plain",
  },
});

let producer: null | Producer = null;

async function createProducer() {
  if (producer) return producer;
  const _producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    topic: "MESSAGES",
    messages: [{ key: `message-${Date.now()}`, value: message }],
  });
  return true;
}

export async function startConsuming() {
    console.log("Consumer is running")
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();

  await consumer.subscribe({ topic: "MESSAGES",fromBeginning:true });

  await consumer.run({
    autoCommit:true,
    eachMessage:async ({message,pause}) => {
        console.log("New Message received")
        if(!message.value) return
        try {
            await prismaClient.message.create({
                data:{
                    text:message.value?.toString()
                }
            })
        } catch (error) {
            console.log("Something is wrong")
            pause()
            setTimeout(()=> {
                consumer.resume([{ topic: "MESSAGES" }])
            },60*1000)
        }
    }
  })
}

export default kafka;
