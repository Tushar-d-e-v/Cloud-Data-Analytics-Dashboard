import { Router } from 'express';
import multer from 'multer';
import { 
  uploadDataset, 
  getDatasets, 
  getDataset, 
  deleteDataset, 
  reprocessDataset 
} from '../controllers/dataset.controller';
import { validateRequest, datasetUploadSchema } from '../utils/validators';
import authenticateToken from '../middlewares/auth.middleware';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json'];
    const allowedExtensions = ['.csv', '.json'];
    
    const hasValidMimeType = allowedTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );

    if (hasValidMimeType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// Dataset routes
router.post('/upload', 
  upload.single('file'), 
  validateRequest(datasetUploadSchema), 
  uploadDataset
);

router.get('/', getDatasets);
router.get('/:datasetId', getDataset);
router.delete('/:datasetId', deleteDataset);
router.post('/:datasetId/reprocess', reprocessDataset);

export default router;