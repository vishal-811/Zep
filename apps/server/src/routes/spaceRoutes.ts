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

// Used TO create A space
router.post("/", userMiddleware, async (req, res) => {
  const isValidate = createSpaceSchema.safeParse(req.body);
  if (!isValidate.success) {
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
        width:Number( width),
        height:Number(height),
        thumbnail : req.body.thumbnail,
        creatorId: req.userId,
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
      thumbnail : true
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
        thumbnail : validateMap.thumbnail
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
  res.status(201).json({ msg: "Space Created Successfully from default map" });
});

// used to delete a space.
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

// This is used to get all the spaces of a user.
router.get("/all", userMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const UserAllSpaces = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select:{
        username:true,
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
    res.status(200).json({ msg: "Sucess", spaces: UserAllSpaces });
  } catch (error) {
    res.status(500).json({ msg: "Somemthing went wrong" });
  }
});

// Get the user arena all details (Like In a space where the space Element is present along with its cordinates, its height, width etc.)
router.get('/:spaceId', userMiddleware, async(req,res)=>{
  try {
    const Space = await prisma.space.findFirst({
      where :{
        id : req.params.spaceId
      },
       include:{
        spaceElements :{
           select :{
            element : true
           }
        }
      }
  })
  if(!Space){
    res.status(404).json({msg :"No Space Found"});
  }
  //  Give all the details of the space Elements that are present in the space.
   res.status(200).json({
      data : {
        dimension :`${Space?.width}x${Space?.height}`,
        "elements" : Space?.spaceElements.map(e=>({
           element :{
             id : e.element.id,
             imageUrl : e.element.imageUrl,
             static :e.element.static,
             width : e.element.width,
             height : e.element.height
           }
        }))
      }
   })
  } catch (error) {
    res.status(500).json({msg :"Something went wrong"});
  }
})


// add an element in the space 
router.post('/element',userMiddleware, async(req,res)=>{
   const isValidate = placedElementsSchema.safeParse(req.body);
   if(!isValidate.success){
     res.status(401).json({msg :"Wrong Inputs"});
     return;
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
    return;
  }
   
  if(validSpace){
    if(req.body.x <0 || req.body.y <0 || req.body.x >validSpace?.width || req.body.y > validSpace?.height){
       res.status(401).json({msg :"Please choose a valid point to place element"})
       return;
    }
  }

  const validElement = await prisma.element.findFirst({
     where :{
      id : req.body.elementId
     }
  })
  if(!validElement){
     res.status(401).json({msg :"Wrong Element Id"});
     return;
  }

  const SpaceElement = await prisma.spaceElements.create({
      data:{
        elemenId : req.body.elementId,
        spaceId : req.body.spaceId,
        x : req.body.x,
        y: req.body.y
      }
  })
   res.status(201).json({msg :"New Element added Sucessfully"});
   return;
})

// Delete a SpaceElement from the spaceElement.
router.delete('/element', userMiddleware , async(req,res)=>{
   const isValidate = deleteElementSchema.safeParse(req.body);
   if(!isValidate.success){
      res.status(401).json({msg :"Wrong Inputs"});
      return;
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
    return;
   }

   if(ValidSpace?.space.creatorId != userId){
      res.status(401).json({msg :"You are not allowed to perform this action"})
      return;
   }

   await prisma.spaceElements.delete({
       where :{
          id : req.body.Id
       }
    })
    res.status(200).json({msg :"SpaceElement Deleted sucessfully"});
    return;
})



export default router;
