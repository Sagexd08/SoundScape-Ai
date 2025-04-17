import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../config/supabase';
import { logger } from '../../lib/utils/logger';

interface FilterOperator {
  operator: 'in' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'eq';
  value: any;
}

type FilterValue = string | number | boolean | null | FilterOperator;

interface QueryOptions {
  select?: string;
  relationships?: Array<{
    table: string;
    fields: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    column: string;
    order: 'asc' | 'desc';
  };
}

export class DatabaseService {
  private supabase: SupabaseClient;
  private static instance: DatabaseService;

  private constructor() {
    this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    logger.info('Database service initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Get Supabase client
   */
  public getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Create a record in a table
   */
  async create<T = any>(table: string, data: Partial<T>, options: QueryOptions = {}): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select(options.select || '*')
        .single();

      if (error) {
        logger.error(`Error creating record in ${table}:`, error);
        throw error;
      }

      return result as T;
    } catch (error) {
      logger.error(`Error in create operation for ${table}:`, error);
      throw error;
    }
  }

  /**
   * Get a record by ID
   */
  async getById<T = any>(table: string, id: string, options: QueryOptions = {}): Promise<T> {
    try {
      let select = options.select || '*';
      
      if (options.relationships?.length) {
        select = [
          select,
          ...options.relationships.map(r => `${r.table}(${r.fields})`)
        ].join(', ');
      }

      const { data, error } = await this.supabase
        .from(table)
        .select(select)
        .eq('id', id)
        .single();

      if (error) {
        logger.error(`Error getting record from ${table}:`, error);
        throw error;
      }

      return data as T;
    } catch (error) {
      logger.error(`Error in getById operation for ${table}:`, error);
      throw error;
    }
  }

  /**
   * Query records with filters
   */
  async query<T = any>(
    table: string, 
    filters: Record<string, FilterValue> = {}, 
    options: QueryOptions = {}
  ): Promise<{ data: T[]; count: number }> {
    try {
      let query = this.supabase
        .from(table)
        .select(options.select || '*', { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && 'operator' in value && value.operator) {
            const filterOp = value as FilterOperator;
            switch (filterOp.operator) {
              case 'in':
                query = query.in(key, filterOp.value);
                break;
              case 'gt':
                query = query.gt(key, filterOp.value);
                break;
              case 'gte':
                query = query.gte(key, filterOp.value);
                break;
              case 'lt':
                query = query.lt(key, filterOp.value);
                break;
              case 'lte':
                query = query.lte(key, filterOp.value);
                break;
              case 'like':
                query = query.like(key, filterOp.value);
                break;
              case 'ilike':
                query = query.ilike(key, filterOp.value);
                break;
              case 'eq':
                query = query.eq(key, filterOp.value);
                break;
            }
          } else {
            // Default to equality
            query = query.eq(key, value);
          }
        }
      });

      // Apply pagination
      if (options.pagination) {
        const { page, limit } = options.pagination;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }

      // Apply sorting
      if (options.sort) {
        const { column, order } = options.sort;
        query = query.order(column, { ascending: order === 'asc' });
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error(`Error querying records from ${table}:`, error);
        throw error;
      }

      return {
        data: data as T[],
        count: count || data.length
      };
    } catch (error) {
      logger.error(`Error in query operation for ${table}:`, error);
      throw error;
    }
  }

  /**
   * Update a record
   */
  async update<T = any>(
    table: string, 
    id: string, 
    data: Partial<T>, 
    options: QueryOptions = {}
  ): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select(options.select || '*')
        .single();

      if (error) {
        logger.error(`Error updating record in ${table}:`, error);
        throw error;
      }

      return result as T;
    } catch (error) {
      logger.error(`Error in update operation for ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async delete(table: string, id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        logger.error(`Error deleting record from ${table}:`, error);
        throw error;
      }
    } catch (error) {
      logger.error(`Error in delete operation for ${table}:`, error);
      throw error;
    }
  }

  /**
   * Execute a raw SQL query
   */
  async rawQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    try {
      const { data, error } = await this.supabase.rpc('execute_sql', {
        query_text: query,
        query_params: params
      });

      if (error) {
        logger.error('Error executing raw query:', error);
        throw error;
      }

      return data as T[];
    } catch (error) {
      logger.error('Error in rawQuery operation:', error);
      throw error;
    }
  }

  /**
   * Get Supabase storage bucket
   */
  getStorageBucket(bucketName: string) {
    return this.supabase.storage.from(bucketName);
  }

  /**
   * Upload file to storage
   */
  async uploadFile(
    bucketName: string, 
    filePath: string, 
    fileBody: File | Blob | Buffer, 
    options: { contentType?: string; cacheControl?: string; upsert?: boolean } = {}
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .storage
        .from(bucketName)
        .upload(filePath, fileBody, options);

      if (error) {
        logger.error(`Error uploading file to ${bucketName}:`, error);
        throw error;
      }

      // Generate public URL
      const { data: urlData } = this.supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      logger.error(`Error in uploadFile operation for ${bucketName}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();