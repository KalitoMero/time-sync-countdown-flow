
import { Pool, QueryResult } from 'pg';
import { toast } from 'sonner';

// PostgreSQL connection configuration
const config = {
  host: '172.16.5.153',
  port: 5432,
  database: 'appdb',
  user: 'admin',
  password: 'supersecure',
  ssl: false
};

// Create a connection pool for better performance
const pool = new Pool(config);

// Log connection status
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL client', err);
  toast.error('Datenbankverbindung unterbrochen');
});

// Helper class to build PostgreSQL queries similar to Supabase's API
class PostgresQueryBuilder {
  private table: string;
  private selectedColumns: string = '*';
  private whereConditions: string[] = [];
  private whereParams: any[] = [];
  private orderByColumns: string[] = [];
  private paramCounter: number = 1;

  constructor(tableName: string) {
    this.table = tableName;
  }

  // Select specific columns
  select(columns: string | string[] = '*'): PostgresQueryBuilder {
    this.selectedColumns = Array.isArray(columns) ? columns.join(', ') : columns;
    return this;
  }

  // Add equal condition
  eq(column: string, value: any): PostgresQueryBuilder {
    this.whereConditions.push(`${column} = $${this.paramCounter}`);
    this.whereParams.push(value);
    this.paramCounter++;
    return this;
  }

  // Add IN condition
  in(column: string, values: any[]): PostgresQueryBuilder {
    if (values.length > 0) {
      const placeholders = values.map((_, i) => `$${this.paramCounter + i}`).join(', ');
      this.whereConditions.push(`${column} IN (${placeholders})`);
      this.whereParams.push(...values);
      this.paramCounter += values.length;
    }
    return this;
  }

  // Add order by clause
  order(column: string, options?: { ascending?: boolean }): PostgresQueryBuilder {
    const direction = options?.ascending === false ? 'DESC' : 'ASC';
    this.orderByColumns.push(`${column} ${direction}`);
    return this;
  }

  // Execute SELECT query
  async execute(): Promise<QueryResult> {
    let query = `SELECT ${this.selectedColumns} FROM ${this.table}`;
    
    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    if (this.orderByColumns.length > 0) {
      query += ` ORDER BY ${this.orderByColumns.join(', ')}`;
    }
    
    try {
      const result = await pool.query(query, this.whereParams);
      return result;
    } catch (error) {
      console.error('SQL Query Error:', error);
      console.error('Query:', query);
      console.error('Params:', this.whereParams);
      throw error;
    }
  }

  // Insert data and return the inserted rows
  async insert(data: Record<string, any> | Record<string, any>[]): Promise<QueryResult> {
    const rows = Array.isArray(data) ? data : [data];
    if (rows.length === 0) return { rows: [], rowCount: 0 } as any;

    const columns = Object.keys(rows[0]);
    let placeholderCounter = 1;
    const values: any[] = [];
    const valueStrings: string[] = [];

    rows.forEach(row => {
      const rowPlaceholders = [];
      columns.forEach(column => {
        values.push(row[column]);
        rowPlaceholders.push(`$${placeholderCounter}`);
        placeholderCounter++;
      });
      valueStrings.push(`(${rowPlaceholders.join(', ')})`);
    });

    const query = `
      INSERT INTO ${this.table} (${columns.join(', ')})
      VALUES ${valueStrings.join(', ')}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result;
    } catch (error) {
      console.error('SQL Insert Error:', error);
      throw error;
    }
  }

  // Update data and return the updated rows
  async update(data: Record<string, any>): Promise<QueryResult> {
    if (this.whereConditions.length === 0) {
      throw new Error('Update requires where conditions');
    }

    const columns = Object.keys(data);
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCounter = this.paramCounter;

    columns.forEach(column => {
      setClauses.push(`${column} = $${paramCounter}`);
      values.push(data[column]);
      paramCounter++;
    });

    const query = `
      UPDATE ${this.table}
      SET ${setClauses.join(', ')}
      WHERE ${this.whereConditions.join(' AND ')}
      RETURNING *
    `;

    const allParams = [...values, ...this.whereParams];

    try {
      const result = await pool.query(query, allParams);
      return result;
    } catch (error) {
      console.error('SQL Update Error:', error);
      throw error;
    }
  }

  // Delete data and return the deleted rows
  async delete(): Promise<QueryResult> {
    if (this.whereConditions.length === 0) {
      throw new Error('Delete requires where conditions');
    }

    const query = `
      DELETE FROM ${this.table}
      WHERE ${this.whereConditions.join(' AND ')}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, this.whereParams);
      return result;
    } catch (error) {
      console.error('SQL Delete Error:', error);
      throw error;
    }
  }
}

// Main client to mimic Supabase's API
type PostgresClient = {
  from: (table: string) => PostgresQueryBuilder;
};

// Export the postgres client with a similar API to Supabase
export const postgres: PostgresClient = {
  from: (table: string) => new PostgresQueryBuilder(table)
};

// Helper function to execute arbitrary SQL queries
export const executeRawQuery = async (sql: string, params: any[] = []): Promise<QueryResult> => {
  try {
    return await pool.query(sql, params);
  } catch (error) {
    console.error('Raw SQL query error:', error);
    throw error;
  }
};

// Initialize the database schema if it doesn't exist
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create UUID extension if it doesn't exist
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Create mitarbeiter table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mitarbeiter (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        name TEXT
      );
    `);

    // Create timer table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timer (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        confirmed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        dauer_min INTEGER,
        mitarbeiter TEXT,
        status TEXT,
        special_case TEXT
      );
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    toast.error('Fehler bei der Datenbankinitialisierung');
  }
};

// Export types
export type PostgresResponse<T> = {
  data: T[] | null;
  error: Error | null;
};

// Call initializeDatabase when the module is imported
initializeDatabase().catch(console.error);
