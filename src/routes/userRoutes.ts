import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { User } from "../models/User";
import authorise, { AuthenticatedRequest } from "../middlewares/authorise";
import { Product } from "../models/Product";
import { Company } from "../models/Company";

const router = express.Router();

// Register User
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone, age, address } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      age,
      address,
    });

    await newUser.save();
    res.status(200).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

// Login User
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET || "regal_secret_key",
      { expiresIn: "1h" }
    );

    // Successful login
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});


// Forgot Password
router.post("/forgot-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User with this email does not exist" });
      return;
    }

    // Generate a random reset key (or token)
    const resetKey = crypto.randomBytes(4).toString("hex").toUpperCase();

    // Store the reset key and its expiration (e.g., 10 minutes)
    user.resetKey = resetKey;
    await user.save();

    // Send reset key via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NO_REPLY_MAIL,
        pass: process.env.NO_REPLY_MAIL_PASS,
      },
    });

    const mailOptions = {
      from: "noreply@things-connect.net",
      to: email,
      subject: "RESET PASSWORD",
      text: `Your password reset key is: ${resetKey}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res
          .status(404)
          .json({ status: 0, message: "failure", error });
      } else {
        res
          .status(200)
          .json({ status: 0, message: "password reset success!" });

        let intervalMS = 600000;
        new Promise(function (resolve, reject) {
          setTimeout(() => {
            console.log("reset!");
            user.resetKey = 'We8Z';
            user.save();
          }, intervalMS);
        });

      }
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});


// Delete Account
router.delete("/delete-account", authorise, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const _id = req.userID;
    // Find and delete the user account
    const user = await User.findByIdAndDelete(_id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    console.error("Delete companies related");
    await Company.deleteMany({ ownerID: _id });
    console.error("Delete products related");
    await Product.deleteMany({ ownerID: _id });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

export default router;
