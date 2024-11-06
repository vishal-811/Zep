import { updatemetadataSchema } from "@repo/zod/zodSchema";
import { Router } from "express";
import { userMiddleware } from "../middlewares/userMiddleware";
import prisma from "@repo/db/prisma";
const router = Router();

router.post("/metadata", userMiddleware, async(req,res)=>{
  const isValidate =updatemetadataSchema.safeParse(req.body);
  if(!isValidate){
    res.status(401).json({msg :"Wrong Inputs"})
    return;
  }
  
  try {
    const ValidAvatar = await prisma.avatar.findUnique({
      where :{
        id : req.body.avatarId
      }
 })

 if(!ValidAvatar){
   res.status(401).json({msg :"Please provide a valid avatar Id"});
   return;
 }

const Avatar = await prisma.user.update({
     where :{
       id  : req.userId
     },
     data :{
       avatarId : req.body.avatarId
     },
 })
 res.status(201).json({msg :"Avatar Update Successfully"});
  } catch (error) {
    res.status(500).json({msg : "Something went wrong in updating Avatar"})
  }
})

router.get("/metadata/bulk", async (req, res) => {
  const userIdString = (req.query.ids ?? "[]") as string;
  const userIds = userIdString.slice(1, userIdString?.length - 1).split(",");
  console.log("The", userIds);
  try {
    const data = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        avatarId: true,
      },
    });
    res.status(200).json({
      avatars: data.map((userAvatar)=>{
        return{
          userId : userAvatar.id,
          avatarId : userAvatar.avatarId
        }
      })
    });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
});

// User get their avatar
router.get("/metadata/avatar", userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const data = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        avatar: {
          select: {
            imageUrl: true,
            name: true,
          },
        },
      },
    });
    res.status(200).json({ msg: "Success" , avatar :data });
  } catch (error) {
    res.status(500).json({ msg: "Something Went Wrong" });
  }
});


router.get("/allavatar", userMiddleware , async(req,res)=>{
    try {
      const Avatar = await prisma.avatar.findMany();
      res.status(200).json({msg :"Avatar fetched sucessfully", avatars : Avatar});
    } catch (error) {
       res.status(500).json({msg :"Something Went Wrong in fetching Avatars"});
    }
})


export default router;
