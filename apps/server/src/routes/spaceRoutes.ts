import { Router } from 'express';
import { userMiddleware } from '../middlewares/userMiddleware';

const router = Router();

router.post('/',userMiddleware,(req,res)=>{
    res.status(201).json({msg :"Space created Sucessfully"});
})

export default router;