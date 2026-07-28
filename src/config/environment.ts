// ================================
// ENVIRONMENT
// ================================

// Puerto en el que corre el servidor
export const PORT = process.env.PORT || 3000;

// Zona horaria para fechas del CFDI
export const TIME_ZONE = 'America/Mexico_City';

// Credenciales del PAC de pruebas (timbrado)
export const TESTER_API_USER = process.env.TESTER_API_USER;
export const TESTER_API_TOKEN = process.env.TESTER_API_TOKEN;

// Clave de API para autenticación
export const API_KEY = process.env.API_KEY;