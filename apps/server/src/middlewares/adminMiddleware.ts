import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];

  if (!token) {
    res.status(401).json({ msg: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "ZEPSECRET"
    ) as { userId: string; role: string };
    const role = decoded.role;
    if (role !== "admin") {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Unauthorized" });
    return;
  }
}
