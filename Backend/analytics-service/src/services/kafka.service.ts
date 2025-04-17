import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import { logger } from '../utils/logger';

// Kafka configuration
const kafkaHost = process.env.KAFKA_BROKERS || 'kafka:9092';
const clientId = process.env.KAFKA_CLIENT_ID || 'analytics-service';

/**
 * Kafka Service
 * 
 * Provides a simple interface for producing and consuming Kafka messages
 */
class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private isProducerConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId,
      brokers: kafkaHost.split(','),
      logLevel: logLevel.WARN,
      retry: {
        initialRetryTime: 300,
        retries: 10
      }
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000
    });

    this.initialize();
  }

  /**
   * Initialize Kafka producer
   */
  private async initialize() {
    try {
      await this.producer.connect();
      this.isProducerConnected = true;
      logger.info('Kafka producer connected');
    } catch (error) {
      logger.error('Error connecting to Kafka producer:', error);
      this.isProducerConnected = false;
      
      // Retry connection after delay
      setTimeout(() => this.initialize(), 5000);
    }
  }

  /**
   * Send message to Kafka topic
   * 
   * @param params Message parameters
   * @returns Success status
   */
  async send(params: { topic: string; messages: any[] }): Promise<boolean> {
    try {
      if (!this.isProducerConnected) {
        logger.warn('Kafka producer not connected, attempting to reconnect');
        await this.producer.connect();
        this.isProducerConnected = true;
      }

      await this.producer.send(params);
      return true;
    } catch (error) {
      logger.error(`Error sending message to Kafka topic ${params.topic}:`, error);
      this.isProducerConnected = false;
      return false;
    }
  }

  /**
   * Create and start a Kafka consumer
   * 
   * @param groupId Consumer group ID
   * @param topics Topics to subscribe to
   * @param onMessage Message handler
   * @returns Consumer instance
   */
  async createConsumer(
    groupId: string,
    topics: string[],
    onMessage: (message: any) => Promise<void>
  ): Promise<Consumer> {
    try {
      // Check if consumer already exists
      if (this.consumers.has(groupId)) {
        return this.consumers.get(groupId)!;
      }

      // Create new consumer
      const consumer = this.kafka.consumer({
        groupId,
        sessionTimeout: 30000,
        heartbeatInterval: 3000
      });

      // Connect consumer
      await consumer.connect();
      logger.info(`Kafka consumer ${groupId} connected`);

      // Subscribe to topics
      await consumer.subscribe({
        topics,
        fromBeginning: false
      });

      // Start consuming
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value ? JSON.parse(message.value.toString()) : null;
            await onMessage({
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
              value,
              headers: message.headers,
              timestamp: message.timestamp
            });
          } catch (error) {
            logger.error(`Error processing Kafka message from ${topic}:`, error);
          }
        }
      });

      // Store consumer
      this.consumers.set(groupId, consumer);
      return consumer;
    } catch (error) {
      logger.error(`Error creating Kafka consumer ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect all Kafka clients
   */
  async disconnect(): Promise<void> {
    try {
      // Disconnect producer
      if (this.isProducerConnected) {
        await this.producer.disconnect();
        this.isProducerConnected = false;
      }

      // Disconnect all consumers
      for (const [groupId, consumer] of this.consumers.entries()) {
        await consumer.disconnect();
        this.consumers.delete(groupId);
      }

      logger.info('Kafka clients disconnected');
    } catch (error) {
      logger.error('Error disconnecting Kafka clients:', error);
    }
  }
}

// Export singleton instance
export const kafkaService = new KafkaService();
export const kafkaProducer = kafkaService;
