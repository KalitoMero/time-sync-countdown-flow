
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS headers für Browseranfragen
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: 'authorization, x-client-info, apikey, content-type'
};

app.use(cors(corsOptions));
app.use(express.json());

// PostgreSQL-Pool erstellen
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Database API server running' });
});

// Hauptendpunkt für Datenbankoperationen
app.post('/database', async (req, res) => {
  const { action, table, columns, conditions, values, orderBy, direction } = req.body;

  try {
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
          
          if (conditions.in && Array.isArray(conditions.in.values)) {
            const column = conditions.in.column;
            const placeholders = conditions.in.values.map((_, i) => `$${paramIndex + i}`).join(',');
            whereClause += whereClause ? ` AND ${column} IN (${placeholders})` : ` WHERE ${column} IN (${placeholders})`;
            params.push(...conditions.in.values);
            paramIndex += conditions.in.values.length;
          } else if (conditions.eq) {
            const column = conditions.eq.column;
            const val = conditions.eq.value;
            whereClause += whereClause ? ` AND ${column} = $${paramIndex}` : ` WHERE ${column} = $${paramIndex}`;
            params.push(val);
            paramIndex++;
          }
          
          query += whereClause;
        }
        
        // Sortierung hinzufügen
        if (orderBy) {
          query += ` ORDER BY ${orderBy} ${direction || 'ASC'}`;
        }
        
        console.log('Execute query:', query, params);
        result = await pool.query(query, params);
        return res.json({ rows: result.rows });
        
      case 'insert':
        if (!values || !Array.isArray(values) || values.length === 0) {
          throw new Error('Keine Werte zum Einfügen angegeben');
        }
        
        const firstValue = values[0];
        const columnsArr = Object.keys(firstValue);
        const valuesList = values.map(obj => Object.values(obj));
        
        let placeholderIndex = 1;
        const valueSets = valuesList.map(valueSet => {
          const placeholders = valueSet.map(() => `$${placeholderIndex++}`).join(', ');
          return `(${placeholders})`;
        }).join(', ');
        
        query = `INSERT INTO ${table} (${columnsArr.join(', ')}) VALUES ${valueSets} RETURNING *`;
        params = valuesList.flat();
        
        console.log('Execute query:', query, params);
        result = await pool.query(query, params);
        return res.json({ rows: result.rows });
        
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
        
        console.log('Execute query:', query, updateParams);
        result = await pool.query(query, updateParams);
        return res.json({ rows: result.rows });
        
      case 'delete':
        if (!conditions || !conditions.eq) {
          throw new Error('Bedingung für das Löschen fehlt');
        }
        
        const column = conditions.eq.column;
        const value = conditions.eq.value;
        
        query = `DELETE FROM ${table} WHERE ${column} = $1 RETURNING *`;
        params = [value];
        
        console.log('Execute query:', query, params);
        result = await pool.query(query, params);
        return res.json({ rows: result.rows });
        
      default:
        throw new Error(`Unbekannte Aktion: ${action}`);
    }
  } catch (error) {
    console.error('Fehler bei Datenbankoperation:', error);
    
    return res.status(400).json({
      error: error.message
    });
  }
});

// Server starten
app.listen(port, () => {
  console.log(`Database API Server läuft auf Port ${port}`);
});
