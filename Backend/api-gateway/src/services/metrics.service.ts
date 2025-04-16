import promClient from 'prom-client';
import express, { Request, Response, Application, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class MetricsService {
  private registry: promClient.Registry;
  private counters: Map<string, promClient.Counter<string>> = new Map();
  private gauges: Map<string, promClient.Gauge<string>> = new Map();
  private histograms: Map<string, promClient.Histogram<string>> = new Map();
  private summaries: Map<string, promClient.Summary<string>> = new Map();
  private isInitialized = false;

  // Create singleton instance
  private static instance: MetricsService;
  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Initialize metrics service with default metrics
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.registry = new promClient.Registry();
    
    // Add default metrics
    promClient.collectDefaultMetrics({
      register: this.registry,
      prefix: 'soundscape_',
      labels: { app: 'api-gateway' }
    });
    
    // API metrics
    this.createCounter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status']
    });
    
    this.createHistogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
    });
    
    this.createCounter({
      name: 'http_request_errors_total',
      help: 'Total HTTP request errors',
      labelNames: ['method', 'route', 'error']
    });
    
    // Business metrics
    this.createCounter({
      name: 'track_plays_total',
      help: 'Total track plays',
      labelNames: ['track_id']
    });
    
    this.createCounter({
      name: 'track_completions_total',
      help: 'Total track completions',
      labelNames: ['track_id']
    });
    
    this.createCounter({
      name: 'user_registrations_total',
      help: 'Total user registrations',
      labelNames: []
    });
    
    this.createCounter({
      name: 'user_logins_total',
      help: 'Total user logins',
      labelNames: ['status']
    });
    
    this.createCounter({
      name: 'track_uploads_total',
      help: 'Total track uploads',
      labelNames: ['status']
    });
    
    this.createHistogram({
      name: 'audio_processing_duration_seconds',
      help: 'Audio processing duration in seconds',
      labelNames: ['operation'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 120, 300]
    });
    
    // GraphQL metrics
    this.createCounter({
      name: 'graphql_requests_total',
      help: 'Total GraphQL requests',
      labelNames: ['operation', 'type']
    });
    
    this.createHistogram({
      name: 'graphql_request_duration_seconds',
      help: 'GraphQL request duration in seconds',
      labelNames: ['operation', 'type'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
    });
    
    // WebSocket metrics
    this.createCounter({
      name: 'websocket_connections_total',
      help: 'Total WebSocket connections',
      labelNames: ['user_role']
    });
    
    this.createCounter({
      name: 'websocket_disconnections_total',
      help: 'Total WebSocket disconnections',
      labelNames: ['user_role']
    });
    
    this.createGauge({
      name: 'websocket_connections_active',
      help: 'Currently active WebSocket connections',
      labelNames: []
    });
    
    this.createGauge({
      name: 'connected_users',
      help: 'Currently connected unique users',
      labelNames: []
    });
    
    // System metrics
    this.createGauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: []
    });
    
    this.createGauge({
      name: 'cpu_usage_percentage',
      help: 'CPU usage percentage',
      labelNames: []
    });
    
    // Start system metrics collection interval
    this.startSystemMetricsCollection();
    
    this.isInitialized = true;
    logger.info('Metrics service initialized');
  }

  /**
   * Create a new counter metric
   */
  createCounter(options: promClient.CounterConfiguration<string>): promClient.Counter<string> {
    const counter = new promClient.Counter(options);
    this.registry.registerMetric(counter);
    this.counters.set(options.name, counter);
    return counter;
  }

  /**
   * Create a new gauge metric
   */
  createGauge(options: promClient.GaugeConfiguration<string>): promClient.Gauge<string> {
    const gauge = new promClient.Gauge(options);
    this.registry.registerMetric(gauge);
    this.gauges.set(options.name, gauge);
    return gauge;
  }

  /**
   * Create a new histogram metric
   */
  createHistogram(options: promClient.HistogramConfiguration<string>): promClient.Histogram<string> {
    const histogram = new promClient.Histogram(options);
    this.registry.registerMetric(histogram);
    this.histograms.set(options.name, histogram);
    return histogram;
  }

  /**
   * Create a new summary metric
   */
  createSummary(options: promClient.SummaryConfiguration<string>): promClient.Summary<string> {
    const summary = new promClient.Summary(options);
    this.registry.registerMetric(summary);
    this.summaries.set(options.name, summary);
    return summary;
  }

  /**
   * Get a counter metric by name
   */
  getCounter(name: string): promClient.Counter<string> | undefined {
    return this.counters.get(name);
  }

  /**
   * Get a gauge metric by name
   */
  getGauge(name: string): promClient.Gauge<string> | undefined {
    return this.gauges.get(name);
  }

  /**
   * Get a histogram metric by name
   */
  getHistogram(name: string): promClient.Histogram<string> | undefined {
    return this.histograms.get(name);
  }

  /**
   * Get a summary metric by name
   */
  getSummary(name: string): promClient.Summary<string> | undefined {
    return this.summaries.get(name);
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, labels: Record<string, string> = {}, value = 1): void {
    const counter = this.getCounter(name);
    if (counter) {
      counter.inc(labels, value);
    } else {
      logger.warn(`Counter metric not found: ${name}`);
    }
  }

  /**
   * Set a gauge value
   */
  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const gauge = this.getGauge(name);
    if (gauge) {
      gauge.set(labels, value);
    } else {
      logger.warn(`Gauge metric not found: ${name}`);
    }
  }

  /**
   * Observe a histogram value
   */
  observeHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const histogram = this.getHistogram(name);
    if (histogram) {
      histogram.observe(labels, value);
    } else {
      logger.warn(`Histogram metric not found: ${name}`);
    }
  }

  /**
   * Observe a summary value
   */
  observeSummary(name: string, value: number, labels: Record<string, string> = {}): void {
    const summary = this.getSummary(name);
    if (summary) {
      summary.observe(labels, value);
    } else {
      logger.warn(`Summary metric not found: ${name}`);
    }
  }

  /**
   * Add metrics middleware to express app
   */
  addMetricsEndpoint(app: Application): void {
    app.get('/metrics', async (req: Request, res: Response) => {
      res.set('Content-Type', this.registry.contentType);
      res.end(await this.registry.metrics());
    });
  }
  
  /**
   * Add request tracking middleware to express app
   */
  addRequestTrackingMiddleware(app: Application): void {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      // Track response
      const end = res.end;
      res.end = (...args: any[]) => {
        const duration = (Date.now() - start) / 1000;
        
        // Get route pattern (not the actual path with params)
        let route = req.route?.path || req.path;
        
        // Increment requests counter
        this.incrementCounter('http_requests_total', {
          method: req.method,
          route,
          status: res.statusCode.toString()
        });
        
        // Observe request duration
        this.observeHistogram('http_request_duration_seconds', duration, {
          method: req.method,
          route,
          status: res.statusCode.toString()
        });
        
        // Track errors
        if (res.statusCode >= 400) {
          this.incrementCounter('http_request_errors_total', {
            method: req.method,
            route,
            error: res.statusCode.toString()
          });
        }
        
        res.end = end;
        return end.apply(res, args);
      };
      
      next();
    });
  }
  
  /**
   * Collect system metrics periodically
   */
  private startSystemMetricsCollection(): void {
    setInterval(() => {
      // Memory usage
      const memoryUsage = process.memoryUsage();
      this.setGauge('memory_usage_bytes', memoryUsage.rss);
      
      // CPU usage - this is approximated since Node.js doesn't provide direct CPU usage
      // In a production environment, use a more accurate method
      const startUsage = process.cpuUsage();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const userCpuUsage = endUsage.user / 1000; // microseconds to milliseconds
        const systemCpuUsage = endUsage.system / 1000;
        const totalCpuUsage = userCpuUsage + systemCpuUsage;
        
        // This is a very rough approximation
        const cpuPercentage = totalCpuUsage / 100;
        this.setGauge('cpu_usage_percentage', cpuPercentage);
      }, 100);
      
    }, 5000); // Collect every 5 seconds
  }
  
  /**
   * Get the Prometheus registry
   */
  getRegistry(): promClient.Registry {
    return this.registry;
  }
}

// Export singleton instance
export const metricsService = MetricsService.getInstance();