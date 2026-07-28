// ================================
// APP
// ================================
import express from 'express';
import { corsMiddleware } from './middlewares/cors.middleware';
import { apiKeyMiddleware } from './middlewares/api-key.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import router from './routes';

const app = express();

// Parseo de JSON en el body de las peticiones
app.use(express.json());

// Middlewares globales
app.use(corsMiddleware);

// Rutas principales — protegidas con API key antes de llegar a cualquier controller
app.use('/api', apiKeyMiddleware, router);

// Manejo de errores — siempre al final
app.use(errorMiddleware);

export default app;