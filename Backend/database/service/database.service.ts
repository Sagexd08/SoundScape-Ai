import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../config/supabase';
import { logger } from '../../lib/utils/logger';

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
  async create(table: string, data: any, options: any = {}): Promise<any> {
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

      return result;
    } catch (error) {
      logger.error(`Error in create operation for ${table}:`, error);
      throw error;
    }
  }

  /**
   * Get a record by ID
   */
  async getById(table: string, id: string, options: any = {}): Promise<any> {
    try {
      let query = this.supabase
        .from(table)
        .select(options.select || '*')
        .eq('id', id);

      if (options.relationships) {
        for (const relation of options.relationships) {
          query = query.select(relation.fields).from(`${table}.${relation.table}`);
        }
      }

      const { data, error } = await query.single();

      if (error) {
        logger.error(`Error getting record from ${table}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error in getById operation for ${table}:`, error);
      throw error;
    }
  }

  /**
   * Query records with filters
   */
  async query(table: string, filters: any = {}, options: any = {}): Promise<any> {
    try {
      let query = this.supabase
        .from(table)
        .select(options.select || '*');

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && value.operator) {
            // Handle custom operators
            switch (value.operator) {
              case 'in':
                query = query.in(key, value.value);
                break;
              case 'gt':
                query = query.gt(key, value.value);
                break;
              case 'gte':
                query = query.gte(key, value.value);
                break;
              case 'lt':
                query = query.lt(key, value.value);
                break;
              case 'lte':
                query = query.lte(key, value.value);
                break;
              case 'like':
                query = query.like(key, value.value);
                break;
              case 'ilike':
                query = query.ilike(key, value.value);
                break;
              default:
                query = query.eq(key, value.value);
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
        data,
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
  async update(table: string, id: string, data: any, options: any = {}): Promise<any> {
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

      return result;
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
  async rawQuery(query: string, params: any[] = []): Promise<any> {
    try {
      const { data, error } = await this.supabase.rpc('execute_sql', {
        query_text: query,
        query_params: params
      });

      if (error) {
        logger.error('Error executing raw query:', error);
        throw error;
      }

      return data;
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
  async uploadFile(bucketName: string, filePath: string, fileBody: any, options: any = {}): Promise<string> {
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