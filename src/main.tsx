
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize PostgreSQL client
import './integrations/postgres/client';

createRoot(document.getElementById("root")!).render(<App />);
