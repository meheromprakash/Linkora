import { Router } from 'express';
import {
  getMyBioProfile,
  updateMyBioProfile,
  getPublicBioByUsername,
} from '../controllers/bioController.js';
import { validateRequest } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { updateBioSchema } from '../schemas/bioSchema.js';

const router = Router();

// Public route for viewing a bio-link page
router.get('/public/:username', getPublicBioByUsername);

// Authenticated builder routes
router.use(authenticate);
router.get('/me', getMyBioProfile);
router.put('/me', validateRequest(updateBioSchema), updateMyBioProfile);

export default router;
