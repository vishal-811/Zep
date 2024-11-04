import { createElementSchema, createMapSchema, UpdateElementSchema } from "@repo/zod/zodSchema";
import { Router } from "express";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import prisma from "@repo/db/prisma";
const router = Router();

router.post('/element',adminMiddleware, async(req,res)=>{
  const isValidate = createElementSchema.safeParse(req.body);
  if(!isValidate){
    res.status(401).json({msg :"Wrong Inputs"});
  } 
  
  try {
    const Element = await prisma.element.create({
        data:{
          imageUrl : req.body.imageUrl,
          width : req.body.width,
          height : req.body.height,
          static : req.body.static
        }
    })
    res.status(201).json({msg :"Element Created Sucessfully" , id : Element.id});
  } catch (error) {
    res.status(500).json({msg :"Element Created Sucessfully"});
  }
})


router.put('/element/:elementId',adminMiddleware, async(req,res)=>{
   const isValidate = UpdateElementSchema.safeParse(req.body);
   if(isValidate){
    res.status(401).json({msg :"Wrong Inputs, You cannot perform this action"})
   }
   
   try {
    const Element = await prisma.element.findFirst({
        where :{
          id : req.params.id
        }
     })
     if(!Element){
      res.status(401).json({msg :"Please Provide a valid Element Id"})
     }
  
     await prisma.element.update({
        where :{
          id : req.params.elemenId
        },
        data:{
          imageUrl :req.body.imageUrl
        }
     })
     res.status(200).json({msg :"Updated SuccessFully"})
   } catch (error) {
     res.status(500).json({msg :"Something went wrong"});
   }
})


router.post('/avatar', adminMiddleware,async(req,res)=>{
    const isValidate = createElementSchema.safeParse(req.body);
    if(!isValidate.success){
        res.status(401).json({msg :"Wrong Inputs"})
    }
    
    try {
        const Avatar = await prisma.avatar.create({
            data :{
                imageUrl : req.body.imageUrl,
                name : req.body.name
            }
        })
        res.status(201).json({msg :"Avatar Created SucessFully", AvatarId : Avatar.id}); 
    } catch (error) {
        res.status(500).json({msg :"Something Went Wrong"})
    }
})

router.post('/map',adminMiddleware, async(req,res)=>{
    const isValidate = createMapSchema.safeParse(req.body);
    if(!isValidate.success){
        res.status(401).json({msg :"Wrong Inputs"});
    }
    try {
        const Map = await prisma.$transaction(async()=>{
        const newMap =   await prisma.map.create({
            data :{
                thumbnail : req.body.thumbnail,
                width : req.body.dimension.split('x')[0],
                height : req.body.dimension.split('x')[1],
                name : req.body.name,
            }
        })
        await prisma.mapElements.createMany({
            data : req.body.defaultElements.map((e : any)=>({
              mapId : newMap.id,
              elementId : e.elemenId,
              x : e.x,
              y:e.y
            }))
        })
        return newMap;
       })
       res.status(201).json({msg :"Map Created Sucessfully", mapId :Map.id});
    } catch (error) {
        res.status(500).json({msg :"Something went wrong"})
    }
})

export default router;
