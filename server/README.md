
# Lokaler Datenbankserver für Timer-Anwendung

Dieser Server stellt eine lokale Alternative zur Supabase Edge Function bereit und verbindet sich mit einer PostgreSQL-Datenbank in Docker.

## Einrichtung

1. Erstelle eine `.env` Datei im `server`-Verzeichnis basierend auf der `.env.example`:

```
# Verbindungsstring für lokale Docker PostgreSQL-Datenbank anpassen
DATABASE_URL=postgres://username:password@localhost:5432/database_name

# Port für den Server
PORT=3001
```

2. Installiere die Server-Abhängigkeiten:

```bash
cd server
npm install
```

3. Starte den Server:

```bash
npm start
```

4. Konfiguriere das Frontend für die lokale Entwicklung:

Setze die Umgebungsvariable `VITE_ENV` auf `development` in deiner `.env` Datei im Hauptverzeichnis des Projekts:

```
VITE_ENV=development
```

## Docker PostgreSQL-Konfiguration

Stelle sicher, dass deine Docker PostgreSQL-Instanz richtig konfiguriert ist:

1. PostgreSQL-Port: Standardmäßig 5432, sollte von außen zugänglich sein
2. Korrekte Benutzeranmeldedaten in der `.env` Datei
3. Die erforderlichen Tabellen (`mitarbeiter`, `timer`) existieren in der Datenbank

## Datenbankschema

Hier ist das minimal erforderliche Schema für die Timer-Anwendung:

```sql
CREATE TABLE mitarbeiter (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  name TEXT
);

CREATE TABLE timer (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  dauer_min INTEGER,
  mitarbeiter TEXT,
  status TEXT,
  special_case TEXT
);
```
