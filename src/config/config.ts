
// Konfigurationen für verschiedene Umgebungen

interface Config {
  apiBaseUrl: string;
}

// Lokale Entwicklungsumgebung
const developmentConfig: Config = {
  apiBaseUrl: 'http://localhost:3001/database'
};

// Produktionsumgebung mit Supabase
const productionConfig: Config = {
  apiBaseUrl: `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'udvwklfhrkuvratzcnqj'}.supabase.co/functions/v1/database`
};

// Umgebung basierend auf der VITE_ENV Variable bestimmen
const isDevelopment = import.meta.env.VITE_ENV === 'development';
const config: Config = isDevelopment ? developmentConfig : productionConfig;

export default config;
