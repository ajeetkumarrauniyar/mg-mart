import { Router, Request, Response } from 'express';
import { ImageController } from '../controllers/image-management/ImageController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();
const imageController = new ImageController();

// Product-specific image routes
router.post('/products/:id/discover-images',
    authenticateToken,
    (req: Request, res: Response) => imageController.discoverImages(req, res)
);

router.get('/products/:id/processing-status',
    authenticateToken,
    (req: Request, res: Response) => imageController.getProcessingStatus(req, res)
);

router.post('/products/:id/approve-images',
    authenticateToken,
    requireAdmin,
    (req: Request, res: Response) => imageController.approveImages(req, res)
);

router.get('/products/:id/images',
    authenticateToken,
    (req: Request, res: Response) => imageController.getProductImages(req, res)
);

router.delete('/products/:productId/images/:imageId',
    authenticateToken,
    (req: Request, res: Response) => imageController.deleteProductImage(req, res)
);

router.put('/products/:productId/images/:imageId/primary',
    authenticateToken,
    (req: Request, res: Response) => imageController.setPrimaryImage(req, res)
);

router.post('/products/:id/retry-processing',
    authenticateToken,
    requireAdmin,
    (req: Request, res: Response) => imageController.retryProcessing(req, res)
);

// Image management system routes
router.get('/image-management/statistics',
    authenticateToken,
    requireAdmin,
    (req: Request, res: Response) => imageController.getStatistics(req, res)
);

router.get('/image-management/health',
    (req: Request, res: Response) => imageController.healthCheck(req, res) // No auth required for health check
);

router.post('/image-management/cleanup',
    authenticateToken,
    requireAdmin,
    (req: Request, res: Response) => imageController.cleanupTemporaryImages(req, res)
);

export default router;