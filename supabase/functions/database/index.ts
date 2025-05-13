
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Konfiguration aus Umgebungsvariablen
const connectionString = Deno.env.get("SUPABASE_DB_URL");

// CORS Headers für Browseranfragen
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PostgreSQL-Pool erstellen
const pool = new Pool(connectionString, 10);

serve(async (req) => {
  // CORS Preflight-Anfragen behandeln
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, table, columns, conditions, values, orderBy, direction } = await req.json();

    // Je nach Aktion unterschiedliche Operationen ausführen
    let query = '';
    let params = [];
    let result;

    switch (action) {
      case 'select':
        query = `SELECT ${columns || '*'} FROM ${table}`;
        
        // Bedingungen hinzufügen
        if (conditions) {
          let whereClause = '';
          let paramIndex = 1;
          
          Object.entries(conditions).forEach(([key, value]) => {
            if (key === 'in' && Array.isArray(value.values)) {
              const column = value.column;
              const placeholders = value.values.map((_, i) => `$${paramIndex + i}`).join(',');
              whereClause += whereClause ? ` AND ${column} IN (${placeholders})` : ` WHERE ${column} IN (${placeholders})`;
              params.push(...value.values);
              paramIndex += value.values.length;
            } else if (key === 'eq') {
              const column = value.column;
              const val = value.value;
              whereClause += whereClause ? ` AND ${column} = $${paramIndex}` : ` WHERE ${column} = $${paramIndex}`;
              params.push(val);
              paramIndex++;
            }
          });
          
          query += whereClause;
        }
        
        // Sortierung hinzufügen
        if (orderBy) {
          query += ` ORDER BY ${orderBy} ${direction || 'ASC'}`;
        }
        
        result = await pool.query(query, params);
        return new Response(JSON.stringify({ rows: result.rows }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
        
      case 'insert':
        if (!values || !Array.isArray(values) || values.length === 0) {
          throw new Error('Keine Werte zum Einfügen angegeben');
        }
        
        const firstValue = values[0];
        const columns = Object.keys(firstValue);
        const valuesList = values.map(obj => Object.values(obj));
        
        let placeholderIndex = 1;
        const valueSets = valuesList.map(valueSet => {
          const placeholders = valueSet.map(() => `$${placeholderIndex++}`).join(', ');
          return `(${placeholders})`;
        }).join(', ');
        
        query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valueSets} RETURNING *`;
        params = valuesList.flat();
        
        result = await pool.query(query, params);
        return new Response(JSON.stringify({ rows: result.rows }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
        
      case 'update':
        if (!values || !conditions) {
          throw new Error('Werte oder Bedingungen fehlen für das Update');
        }
        
        const entries = Object.entries(values);
        const setClauses = entries.map((entry, i) => `${entry[0]} = $${i + 1}`).join(', ');
        let updateParams = entries.map(entry => entry[1]);
        
        query = `UPDATE ${table} SET ${setClauses}`;
        
        // Bedingung hinzufügen (nur einfache eq-Bedingung unterstützt)
        if (conditions.eq) {
          const column = conditions.eq.column;
          const value = conditions.eq.value;
          query += ` WHERE ${column} = $${updateParams.length + 1} RETURNING *`;
          updateParams.push(value);
        }
        
        result = await pool.query(query, updateParams);
        return new Response(JSON.stringify({ rows: result.rows }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
        
      case 'delete':
        if (!conditions || !conditions.eq) {
          throw new Error('Bedingung für das Löschen fehlt');
        }
        
        const column = conditions.eq.column;
        const value = conditions.eq.value;
        
        query = `DELETE FROM ${table} WHERE ${column} = $1 RETURNING *`;
        params = [value];
        
        result = await pool.query(query, params);
        return new Response(JSON.stringify({ rows: result.rows }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
        
      default:
        throw new Error(`Unbekannte Aktion: ${action}`);
    }
  } catch (error) {
    console.error('Fehler bei Datenbankoperation:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
