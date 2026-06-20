// ================================
// APP
// ================================
import express from 'express';
import { corsMiddleware } from './middlewares/cors.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import router from './routes';

const app = express();

// Parseo de JSON en el body de las peticiones
app.use(express.json());

// Middlewares globales
app.use(corsMiddleware);

// Rutas principales
app.use('/api', router);

// Manejo de errores — siempre al final
app.use(errorMiddleware);

export default app;