import { Router } from 'express';
import { ImageController } from '../controllers/image-management/ImageController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();
const imageController = new ImageController();

// Product-specific image routes
router.post('/products/:id/discover-images',
    authenticateToken,
    (req, res) => imageController.discoverImages(req, res)
);

router.get('/products/:id/processing-status',
    authenticateToken,
    (req, res) => imageController.getProcessingStatus(req, res)
);

router.post('/products/:id/approve-images',
    authenticateToken,
    requireAdmin,
    (req, res) => imageController.approveImages(req, res)
);

router.get('/products/:id/images',
    authenticateToken,
    (req, res) => imageController.getProductImages(req, res)
);

router.delete('/products/:productId/images/:imageId',
    authenticateToken,
    (req, res) => imageController.deleteProductImage(req, res)
);

router.put('/products/:productId/images/:imageId/primary',
    authenticateToken,
    (req, res) => imageController.setPrimaryImage(req, res)
);

router.post('/products/:id/retry-processing',
    authenticateToken,
    requireAdmin,
    (req, res) => imageController.retryProcessing(req, res)
);

// Image management system routes
router.get('/image-management/statistics',
    authenticateToken,
    requireAdmin,
    (req, res) => imageController.getStatistics(req, res)
);

router.get('/image-management/health',
    (req, res) => imageController.healthCheck(req, res) // No auth required for health check
);

router.post('/image-management/cleanup',
    authenticateToken,
    requireAdmin,
    (req, res) => imageController.cleanupTemporaryImages(req, res)
);

export default router;