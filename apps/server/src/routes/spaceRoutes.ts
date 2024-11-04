import { Router } from "express";
import { userMiddleware } from "../middlewares/userMiddleware";
import prisma from "@repo/db/prisma";
import {
  createSpaceSchema,
  deleteElementSchema,
  deleteSpaceElementSchema,
  placedElementsSchema,
} from "@repo/zod/zodSchema";

const router = Router();

router.post("/", userMiddleware, async (req, res) => {
  const isValidate = createSpaceSchema.safeParse(req.body);
  if (!isValidate) {
    res.status(401).json({ msg: "Unauthorized" });
    return;
  }
  if (!req.body.mapId) {
    //if no map Id is given than create a new Space.
    const width = req.body.dimension.split("x")[0];
    const height = req.body.dimension.split("x")[1];
    const space = await prisma.space.create({
      data: {
        name: req.body.name,
        height: height,
        width: width,
        creatorId: req.body.userId,
      },
    });
    res
      .status(201)
      .json({ msg: "Space created Sucessfully", spaceId: space.id });
    return;
  }

  const validateMap = await prisma.map.findFirst({
    where: {
      id: req.body.mapId,
    },
    select: {
      mapElements: true,
      width: true,
      height: true,
    },
  });
  if (!validateMap) {
    res.status(201).json({ msg: "No Map exist with this mapId" });
    return;
  }
  let space = await prisma.$transaction(async () => {
    const space = await prisma.space.create({
      data: {
        name: req.body.name,
        width: validateMap.width,
        height: validateMap.height,
        creatorId: req.body.userId,
      },
    });

    await prisma.spaceElements.createMany({
      data: validateMap.mapElements.map((e) => ({
        spaceId: space.id,
        elemenId: e.elementId,
        x: e.x,
        y: e.y,
      })),
    });
  });
  res.status(201).json({ msg: "Space Created Successfully" });
});

router.delete("/element", userMiddleware, async (req, res) => {
  const isValidate = deleteSpaceElementSchema.safeParse(req.body);
  if (!isValidate) {
    res.status(401).json({ msg: "Wrong Inputs" });
  }
  const spaceElement = await prisma.spaceElements.findFirst({
     where :{
      id : req.body.id
     },
     include:{
      space : true
     }
  })
  if(spaceElement?.space.creatorId != req.userId){
    res.status(401).json({msg :"Unauthorized"});
  }

  try {
    await prisma.spaceElements.delete({
      where: {
        id: req.body.id,
      },
    });
    res.status(200).json({ msg: "Element deleted Successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Something Went Wrong" });
  }
});

router.delete("/:spaceId", userMiddleware, async (req, res) => {
  const spaceId = req.params.spaceId;
  const userId = req.userId;
  try {
    const SpaceValidate = await prisma.space.findFirst({
      where: {
        id: spaceId,
      },
      select: {
        spaceElements: true,
        creatorId: true,
      },
    });
    if (!SpaceValidate) {
      res.status(404).json({ msg: "Space with this Id did not exist" });
    }

    if (SpaceValidate?.creatorId !== userId) {
      res.status(401).json({ msg: "Not Authorized to perform this action" });
    }

    await prisma.$transaction(async () => {
      await prisma.space.delete({
        where: {
          id: spaceId,
        },
      });

      if (SpaceValidate) {
        SpaceValidate.spaceElements.map(async (space) => {
          await prisma.spaceElements.deleteMany({
            where: {
              id: space.id,
            },
          });
        });
      }
    });
    res.status(200).json({ msg: "Space Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
});

router.get("/all", userMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const AllSpaces = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        spaces: {
          select: {
            name: true,
            thumbnail: true,
            height: true,
            width: true,
          },
        },
      },
    });
    res.status(200).json({ msg: "Sucess", spaces: AllSpaces });
  } catch (error) {
    res.status(500).json({ msg: "Somemthing went wrong" });
  }
});


router.get('/:spaceId', userMiddleware, async(req,res)=>{
  try {
    const Space = await prisma.space.findFirst({
      where :{
        id : req.params.spaceId
      },
      include:{
        spaceElements :{
           include :{
            element : true
           }
        }
      }
  })
  if(!Space){
    res.status(404).json({msg :"No Space Found"});
  }
    // pending
    console.log(Space);
  } catch (error) {
    res.status(500).json({msg :"Something went wrong"});
  }
})


// Put an element in the space 
router.post('/element',userMiddleware, async(req,res)=>{
   const isValidate = placedElementsSchema.safeParse(req.body);
   if(!isValidate.success){
     res.status(401).json({msg :"Wrong Inputs"});
   }

  // check that the space is valid or not 
 const validSpace = await prisma.space.findFirst({
     where :{
       id : req.body.spaceId
     },
     select:{
      creatorId : true,
      width : true,
      height : true
    }
  })
  if(!validSpace){
    res.status(401).json({msg :"Invalid SpaceId"});
  }
   
  if(validSpace){
    if(req.body.x <0 || req.body.y <0 || req.body.x >validSpace?.width || req.body.y > validSpace?.height){
       res.status(401).json({msg :"Please choose a valid point to place element"})
    }
  }

  const validElement = await prisma.element.findFirst({
     where :{
      id : req.body.elemenId
     }
  })
  if(!validElement){
     res.status(401).json({msg :"Wrong Element Id"});
  }

  const SpaceElement = await prisma.spaceElements.create({
      data:{
        elemenId : req.body.elemenId,
        spaceId : req.body.spaceId,
        x : req.body.x,
        y: req.body.y
      }
  })
   res.status(201).json({msg :"New Element added Sucessfully"});
})

router.delete('/delete', userMiddleware , async(req,res)=>{
   const isValidate = deleteElementSchema.safeParse(req.body);
   if(!isValidate.success){
      res.status(401).json({msg :"Wrong Inputs"});
   }
   const userId = req.userId;
   const ValidSpace = await prisma.spaceElements.findFirst({
        where :{
           id : req.body.id
        },
        include:{
          space : true,
        }
   })
   if(!ValidSpace){
    res.status(401).json({msg :"No Space Exist with  this space Id"});
   }

   if(ValidSpace?.space.creatorId != userId){
      res.status(401).json({msg :"You are not allowed to perform this action"})
   }

   await prisma.spaceElements.delete({
       where :{
          id : req.body.Id
       }
    })
    res.status(200).json({msg :"SpaceElement Deleted sucessfully"});
})

export default router;
