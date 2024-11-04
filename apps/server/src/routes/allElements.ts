import { Router } from 'express';
import { userMiddleware } from '../middlewares/userMiddleware';
import prisma from '@repo/db/prisma';
const router = Router();


router.get('/elements', userMiddleware, async(req,res)=>{
   try {
    const allElements = await prisma.element.findMany();
    res.status(200).json({msg :"all Elements Fetched Successfuly", elements : allElements})
   } catch (error) {
     res.status(401).json({msg :"Something went wrong in fetching all Elements"});
   }
})



export default router;