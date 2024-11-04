import { UpdateMetadataSchema } from "@repo/zod/zodSchema";
import { Router } from "express";
import { userMiddleware } from "../middlewares/userMiddleware";
import prisma from "@repo/db/prisma";
const router = Router();

router.post("/metadata", userMiddleware, async (req, res) => {
  const isValidate = UpdateMetadataSchema.safeParse(req.body);
  if (!isValidate) {
    res.status(401).json({ msg: "Unauthorized" });
    return;
  }
  try {
    const userId = req.userId;
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarId: req.body,
      },
    });
    res.status(200).json({ msg: "Avatar Updated Successfully" });
    return;
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
});

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
      avatars: data,
    });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
});

router.get("/metadata/avatar", userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const data = await prisma.user.findFirst({
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
    res.status(200).json({ msg: "Success" });
  } catch (error) {
    res.status(500).json({ msg: "Something Went Wrong" });
  }
});

export default router;
