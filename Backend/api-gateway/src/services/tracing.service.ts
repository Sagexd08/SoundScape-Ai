import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { logger } from '../utils/logger';

export class TracingService {
  private provider: NodeTracerProvider;
  private isInitialized = false;

  // Create singleton instance
  private static instance: TracingService;
  public static getInstance(): TracingService {
    if (!TracingService.instance) {
      TracingService.instance = new TracingService();
    }
    return TracingService.instance;
  }

  /**
   * Initialize tracing service
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Set up OpenTelemetry logging
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

    // Create a tracer provider
    this.provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'soundscape-api-gateway',
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
      })
    });

    // Configure exporters based on environment
    if (process.env.JAEGER_ENDPOINT) {
      // Use Jaeger exporter
      const jaegerExporter = new JaegerExporter({
        endpoint: process.env.JAEGER_ENDPOINT,
      });
      this.provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
      logger.info(`Tracing configured with Jaeger exporter: ${process.env.JAEGER_ENDPOINT}`);
    }

    if (process.env.OTLP_ENDPOINT) {
      // Use OTLP exporter (for systems like Honeycomb, Lightstep, etc.)
      const otlpExporter = new OTLPTraceExporter({
        url: process.env.OTLP_ENDPOINT,
        headers: {
          'x-honeycomb-team': process.env.HONEYCOMB_API_KEY || '',
        },
      });
      this.provider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));
      logger.info(`Tracing configured with OTLP exporter: ${process.env.OTLP_ENDPOINT}`);
    }

    // Register provider globally
    this.provider.register();

    // Register instrumentations for automatic tracing
    registerInstrumentations({
      instrumentations: [
        // HTTP & Express instrumentation
        new HttpInstrumentation({
          // Avoid health check noise
          ignoreIncomingPaths: ['/health', '/metrics'],
          // Avoid tracing third-party API calls
          ignoreOutgoingUrls: [/\/health$/, /\/metrics$/]
        }),
        new ExpressInstrumentation(),
        
        // GraphQL instrumentation
        new GraphQLInstrumentation({
          mergeItems: true,
          depth: 10
        }),
        
        // Database instrumentations
        new MongoDBInstrumentation(),
        new PgInstrumentation(),
        new RedisInstrumentation(),
        new IORedisInstrumentation()
      ],
    });

    this.isInitialized = true;
    logger.info('Tracing service initialized');
  }

  /**
   * Get the tracer provider
   */
  getProvider(): NodeTracerProvider {
    return this.provider;
  }

  /**
   * Shut down the tracer provider
   */
  async shutdown(): Promise<void> {
    if (this.provider) {
      await this.provider.shutdown();
      logger.info('Tracing service shut down');
    }
  }
}

// Export singleton instance
export const tracingService = TracingService.getInstance();