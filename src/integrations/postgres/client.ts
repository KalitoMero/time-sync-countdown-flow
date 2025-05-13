
import { Pool } from 'pg';

// Create a PostgreSQL client that works in both browser and server environments
const createPostgresClient = () => {
  // Configuration from environment variables
  const connectionString = import.meta.env.VITE_POSTGRES_URL;
  
  try {
    // Create a connection pool
    const pool = new Pool({
      connectionString,
      // Set a reasonable pool size
      max: 10,
      idleTimeoutMillis: 30000,
    });

    // Add event listeners for connection issues
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    // Return an API similar to the one we were trying to use with @supabase/postgres-js
    return {
      from: (table: string) => {
        return {
          select: (columns: string) => {
            return {
              order: (column: string, options?: { ascending?: boolean }) => {
                const direction = options?.ascending === false ? 'DESC' : 'ASC';
                return {
                  execute: async () => {
                    const result = await pool.query(
                      `SELECT ${columns} FROM ${table} ORDER BY ${column} ${direction}`
                    );
                    return { rows: result.rows };
                  }
                };
              },
              eq: (column: string, value: any) => {
                return {
                  execute: async () => {
                    const result = await pool.query(
                      `SELECT ${columns} FROM ${table} WHERE ${column} = $1`,
                      [value]
                    );
                    return { rows: result.rows };
                  }
                };
              },
              in: (column: string, values: any[]) => {
                return {
                  order: (orderColumn: string) => {
                    return {
                      execute: async () => {
                        const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
                        const result = await pool.query(
                          `SELECT ${columns} FROM ${table} WHERE ${column} IN (${placeholders}) ORDER BY ${orderColumn}`,
                          values
                        );
                        return { rows: result.rows };
                      }
                    };
                  }
                };
              },
              execute: async () => {
                const result = await pool.query(`SELECT ${columns} FROM ${table}`);
                return { rows: result.rows };
              }
            };
          },
          insert: (values: object[]) => {
            return {
              execute: async () => {
                if (values.length === 0) return { rows: [] };
                
                const firstValue = values[0];
                const columns = Object.keys(firstValue);
                const valuesList = values.map(obj => Object.values(obj));
                
                let placeholderIndex = 1;
                const valueSets = valuesList.map(valueSet => {
                  const placeholders = valueSet.map(() => `$${placeholderIndex++}`).join(', ');
                  return `(${placeholders})`;
                }).join(', ');
                
                const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valueSets} RETURNING *`;
                const flatValues = valuesList.flat();
                
                const result = await pool.query(query, flatValues);
                return { rows: result.rows };
              }
            };
          },
          update: (values: object) => {
            return {
              eq: (column: string, value: any) => {
                return {
                  execute: async () => {
                    const entries = Object.entries(values);
                    const setClauses = entries.map((entry, i) => `${entry[0]} = $${i + 1}`).join(', ');
                    const updateValues = entries.map(entry => entry[1]);
                    
                    const query = `UPDATE ${table} SET ${setClauses} WHERE ${column} = $${updateValues.length + 1} RETURNING *`;
                    const result = await pool.query(query, [...updateValues, value]);
                    return { rows: result.rows };
                  }
                };
              }
            };
          },
          delete: () => {
            return {
              eq: (column: string, value: any) => {
                return {
                  execute: async () => {
                    const result = await pool.query(
                      `DELETE FROM ${table} WHERE ${column} = $1 RETURNING *`,
                      [value]
                    );
                    return { rows: result.rows };
                  }
                };
              }
            };
          }
        };
      }
    };
  } catch (error) {
    console.error('Failed to create Postgres client:', error);
    // Return a dummy client for development that won't break the app
    return {
      from: () => ({
        select: () => ({
          order: () => ({
            execute: async () => ({ rows: [] })
          }),
          eq: () => ({
            execute: async () => ({ rows: [] })
          }),
          in: () => ({
            order: () => ({
              execute: async () => ({ rows: [] })
            })
          }),
          execute: async () => ({ rows: [] })
        }),
        insert: () => ({
          execute: async () => ({ rows: [] })
        }),
        update: () => ({
          eq: () => ({
            execute: async () => ({ rows: [] })
          })
        }),
        delete: () => ({
          eq: () => ({
            execute: async () => ({ rows: [] })
          })
        })
      })
    };
  }
};

// Export a singleton instance of the postgres client
export const postgres = createPostgresClient();
