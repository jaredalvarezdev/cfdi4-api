// ================================
// SERVER
// ================================
import 'dotenv/config';
import app from './app';
import { PORT } from './config/environment';

// Inicia el servidor en el puerto configurado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});