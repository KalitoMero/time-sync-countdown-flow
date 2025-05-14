
import config from '@/config/config';

// Definieren eines clients, der die API für Datenbankoperationen verwendet
const createPostgresClient = () => {
  const BASE_URL = config.apiBaseUrl;

  return {
    from: (table: string) => {
      return {
        select: (columns: string = '*') => {
          return {
            order: (orderColumn: string, options?: { ascending?: boolean }) => {
              return {
                execute: async () => {
                  try {
                    const response = await fetch(BASE_URL, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        action: 'select',
                        table,
                        columns,
                        orderBy: orderColumn,
                        direction: options?.ascending === false ? 'DESC' : 'ASC'
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error: ${response.status}`);
                    }
                    
                    return await response.json();
                  } catch (error) {
                    console.error('Fehler bei select mit order:', error);
                    return { rows: [] };
                  }
                }
              };
            },
            eq: (column: string, value: any) => {
              return {
                order: (orderColumn: string, options?: { ascending?: boolean }) => {
                  return {
                    execute: async () => {
                      try {
                        const response = await fetch(BASE_URL, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            action: 'select',
                            table,
                            columns,
                            conditions: {
                              eq: { column, value }
                            },
                            orderBy: orderColumn,
                            direction: options?.ascending === false ? 'DESC' : 'ASC'
                          }),
                        });
                        
                        if (!response.ok) {
                          throw new Error(`HTTP error: ${response.status}`);
                        }
                        
                        return await response.json();
                      } catch (error) {
                        console.error('Fehler bei select mit eq und order:', error);
                        return { rows: [] };
                      }
                    }
                  };
                },
                execute: async () => {
                  try {
                    const response = await fetch(BASE_URL, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        action: 'select',
                        table,
                        columns,
                        conditions: {
                          eq: { column, value }
                        }
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error: ${response.status}`);
                    }
                    
                    return await response.json();
                  } catch (error) {
                    console.error('Fehler bei select mit eq:', error);
                    return { rows: [] };
                  }
                }
              };
            },
            in: (column: string, values: any[]) => {
              return {
                order: (orderColumn: string) => {
                  return {
                    execute: async () => {
                      try {
                        const response = await fetch(BASE_URL, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            action: 'select',
                            table,
                            columns,
                            conditions: {
                              in: { column, values }
                            },
                            orderBy: orderColumn
                          }),
                        });
                        
                        if (!response.ok) {
                          throw new Error(`HTTP error: ${response.status}`);
                        }
                        
                        return await response.json();
                      } catch (error) {
                        console.error('Fehler bei select mit in und order:', error);
                        return { rows: [] };
                      }
                    }
                  };
                },
                execute: async () => {
                  try {
                    const response = await fetch(BASE_URL, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        action: 'select',
                        table,
                        columns,
                        conditions: {
                          in: { column, values }
                        }
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error: ${response.status}`);
                    }
                    
                    return await response.json();
                  } catch (error) {
                    console.error('Fehler bei select mit in:', error);
                    return { rows: [] };
                  }
                }
              };
            },
            execute: async () => {
              try {
                const response = await fetch(BASE_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    action: 'select',
                    table,
                    columns
                  }),
                });
                
                if (!response.ok) {
                  throw new Error(`HTTP error: ${response.status}`);
                }
                
                return await response.json();
              } catch (error) {
                console.error('Fehler bei select:', error);
                return { rows: [] };
              }
            }
          };
        },
        insert: (values: object[]) => {
          return {
            execute: async () => {
              try {
                const response = await fetch(BASE_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    action: 'insert',
                    table,
                    values
                  }),
                });
                
                if (!response.ok) {
                  throw new Error(`HTTP error: ${response.status}`);
                }
                
                return await response.json();
              } catch (error) {
                console.error('Fehler bei insert:', error);
                return { rows: [] };
              }
            }
          };
        },
        update: (values: object) => {
          return {
            eq: (column: string, value: any) => {
              return {
                execute: async () => {
                  try {
                    const response = await fetch(BASE_URL, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        action: 'update',
                        table,
                        values,
                        conditions: {
                          eq: { column, value }
                        }
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error: ${response.status}`);
                    }
                    
                    return await response.json();
                  } catch (error) {
                    console.error('Fehler bei update:', error);
                    return { rows: [] };
                  }
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
                  try {
                    const response = await fetch(BASE_URL, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        action: 'delete',
                        table,
                        conditions: {
                          eq: { column, value }
                        }
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error: ${response.status}`);
                    }
                    
                    return await response.json();
                  } catch (error) {
                    console.error('Fehler bei delete:', error);
                    return { rows: [] };
                  }
                }
              };
            }
          };
        }
      };
    }
  };
};

// Export einer Singleton-Instanz des postgres-Clients
export const postgres = createPostgresClient();
