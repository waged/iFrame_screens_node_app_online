import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend the Request interface to include custom properties
export interface AuthenticatedRequest extends Request {
  userID?: string;
  email?: string;
  token?: string;
}

// Authorization middleware
const authorise = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the authorization header exists
    if (!authHeader) {
      res.status(401).json({ message: "Authorization header missing" });
      return; // Ensure the function exits here
    }

    // Extract the token from the "Bearer" schema
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Token missing from authorization header" });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

    // Attach user data to the request object
    req.userID = decoded._id as string;
    // console.log(`userID: ${req.userID}`);
    req.email = decoded.email as string;
    // console.log(`email: ${req.email}`);
    req.token = token;
    // console.log(`token: ${req.token}`);

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token", error: error });
    return;
  }
};

export default authorise;
