import { Request, Response } from "express";
import {asyncHandler} from "../utils/asyncHandler";
import User from "../models/user.models";

// @desc    Search users by name (case-insensitive)
// @route   GET /api/wallet/search?name=<query>
// @access  Public
export const searchUsersByName = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid 'name' query parameter",
    });
  }

  // Case-insensitive partial match
  const users = await User.find({
    name: { $regex: new RegExp(name, "i") },
  }).select("name address bio avatar"); // Optional: limit returned fields

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});
