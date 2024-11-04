import express from "express";
const router = express.Router();
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import spaceRoutes from "./spaceRoutes";
import adminRouter from "./adminRoutes";
import allElements from "./allElements"

router.use("/", authRoutes);
router.use("/user", userRoutes);
router.use("/space", spaceRoutes);
router.use("/admin", adminRouter);
router.use("/", allElements);

export default router;
