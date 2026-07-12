// Interfaz base para todas las respuestas de la API
export interface IResponse {
  ok: boolean;
  data?: unknown;
  message?: string;
}