import {
  createAvatarSchema,
  createElementSchema,
  createMapSchema,
  UpdateElementSchema,
} from "@repo/zod/zodSchema";
import { Router } from "express";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import prisma from "@repo/db/prisma";
const router = Router();

router.post("/element", adminMiddleware, async (req, res) => {
  const isValidate = createElementSchema.safeParse(req.body);
  console.log(req.body)
  if (!isValidate.success) {
    res.status(401).json({ msg: "Wrong Inputs" });
    return;
  }

  try {
    const Element = await prisma.element.create({
      data: {
        imageUrl: req.body.imageUrl,
        width: req.body.width,
        height: req.body.height,
        static: req.body.static,
      },
    });
    res
      .status(201)
      .json({ msg: "Element Created Sucessfully", id: Element.id });
      return;
  } catch (error) {
    res.status(500).json({ msg: "Element Created Sucessfully" });
    return;
  }
});

router.put("/element/:elementId", adminMiddleware, async (req, res) => {
  const isValidate = UpdateElementSchema.safeParse(req.body);
  if (!isValidate.success) {
    res
      .status(401)
      .json({ msg: "Wrong Inputs, You cannot perform this action" });
      return;
  }

  try {
    const Element = await prisma.element.findUnique({
      where: {
        id: req.params.elementId,
      },
    });
    if (!Element) {
      res.status(401).json({ msg: "Please Provide a valid Element Id" });
    }

    await prisma.element.update({
      where: {
        id: req.params.elementId,
      },
      data: {
        imageUrl: req.body.imageUrl,
      },
    });
    res.status(200).json({ msg: "Updated SuccessFully" });
    return;
  } catch (error) {
    console.log("The Error is", error);
    res.status(500).json({ msg: "Something went wrong" });
    return;
  }
});

router.post("/avatar", adminMiddleware, async (req, res) => {
  const isValidate = createAvatarSchema.safeParse(req.body);
  if (!isValidate.success) {
    res.status(401).json({ msg: "Wrong Inputs" });
    return;
  }

  try {
    const Avatar = await prisma.avatar.create({
      data: {
        imageUrl: req.body.imageUrl,
        name: req.body.name,
      },
    });
    res
      .status(201)
      .json({ msg: "Avatar Created SucessFully", AvatarId: Avatar.id });
      return;
  } catch (error) {
    res.status(500).json({ msg: "Something Went Wrong" });
    return;
  }
});

router.post("/map", adminMiddleware, async (req, res) => {
  const isValidate = createMapSchema.safeParse(req.body);
  // console.log(req.body);
  if (!isValidate.success) {
    res.status(401).json({ msg: "Wrong Inputs" });
    return;
  }
    console.log("Dimensions are" , req.body.dimension);
    console.log("Error", req.body.dimension.split("x")[1])
  try {
    const Map = await prisma.$transaction(async () => {
      const newMap = await prisma.map.create({
        data: {
          thumbnail: req.body.thumbnail,
          width: Number(req.body.dimension.split("x")[0]),
          height: Number(req.body.dimension.split("x")[1]),
          name: req.body.name,
        },
      });
      await prisma.mapElements.createMany({
        data: req.body.defaultElements.map((e: any) => ({
          mapId: newMap.id,
          elementId: e.elementId,
          x: Number(e.x),
          y: Number( e.y),
        })),
      });
      return newMap;
    });
    res.status(201).json({ msg: "Map Created Sucessfully", mapId: Map.id });
    return;
  } catch (error) {
     console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
    return;
  }
});

export default router;
