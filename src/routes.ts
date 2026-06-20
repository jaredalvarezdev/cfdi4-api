// ================================
// ROUTES
// ================================
import { Router } from 'express';
import cfdiBuilderRoutes from './domains/cfdi-builder/cfdi-builder.routes';

const router = Router();

// Dominio principal — construcción de CFDIs
router.use('/cfdi-builder', cfdiBuilderRoutes);

export default router;