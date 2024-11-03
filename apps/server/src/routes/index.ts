import express from 'express';
const router = express.Router();
import authRoutes from './authRoutes'
import userRoutes from './userRoutes'
import spaceRoutes from './spaceRoutes'

router.use('/',authRoutes)
router.use('/user',userRoutes)
router.use('/space',spaceRoutes)


export default router;