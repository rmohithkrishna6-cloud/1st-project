import { Request, Response, NextFunction } from "express";
import { verifyJwtToken, JwtPayload } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticateJwt(strict: boolean = true) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      if (strict) {
        res.status(401).json({ error: "Authentication required. Missing Bearer token." });
        return;
      }
      return next();
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      if (strict) {
        res.status(401).json({ error: "Authentication required. Invalid authorization header format." });
        return;
      }
      return next();
    }

    const token = match[1].trim();
    const decoded = verifyJwtToken(token);

    if (!decoded) {
      if (strict) {
        res.status(401).json({ error: "Invalid or expired JWT token." });
        return;
      }
      return next();
    }

    req.user = decoded;
    next();
  };
}
