import { Router } from "express";
const router = Router();
import jwt, { sign } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { SigninSchema, SignupSchema } from "@repo/zod/zodSchema";
import prisma from "@repo/db/prisma";

router.post("/signup", async (req, res) => {
  try {
    const isValidate = SignupSchema.safeParse(req.body);
    if (!isValidate) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }

    const alreadyExist = await prisma.user.findFirst({
      where: {
        username: req.body.username,
      },
    });

    if (alreadyExist) {
      res.status(403).json({ msg: "user already exist with this Username" });
      return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        username: req.body.username,
        password: hashedPassword,
        role: req.body.type === "admin" ?"admin" :"user",
      },
    });
    const username = req.body.username;
    const userId = user.id;
    const token = jwt.sign({ username , userId}, process.env.JWT_SECRET || "ZEPSECRET");

    res.status(201).json({ msg: "Signup Success", token: token });
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: "Something Went wrong" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const isValidate = SigninSchema.safeParse(req.body);
    if (!isValidate) {
      res.status(401).json({ msg: "unauthorized" });
      return;
    }

    const userExist = await prisma.user.findFirst({
      where: {
        username: req.body.username,
      },
    });
    if (!userExist) {
      res.status(401).json({ msg: "No user Exist With this username" });
      return;
    }
    const hashedPassword = userExist.password;
    const validatePassword = bcrypt.compare(req.body.password, hashedPassword);
    if (!validatePassword) {
      res.status(401).json({ msg: "Wrong password" });
      return;
    }
    const userId = userExist.id;
    const role = userExist.role;
    const token = jwt.sign({ userId , role }, process.env.JWT_SECRET || "ZEPSECRET");
    res.status(200).json({ msg: "Signin Sucess", token: token });
  } catch (error) {
    res.status(500).json({ msg: "Soemthing Went Wrong" });
  }
});

export default router;
