import { Router } from 'express';
import {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink,
} from '../controllers/linkController.js';
import { validateRequest } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { linkCreateRateLimiter } from '../middlewares/rateLimiters.js';
import {
  createLinkSchema,
  updateLinkSchema,
  queryLinksSchema,
} from '../schemas/linkSchema.js';

const router = Router();

router.use(authenticate);

router.post('/', linkCreateRateLimiter, validateRequest(createLinkSchema), createLink);
router.get('/', validateRequest(queryLinksSchema), getLinks);
router.get('/:id', getLinkById);
router.patch('/:id', validateRequest(updateLinkSchema), updateLink);
router.delete('/:id', deleteLink);

export default router;
