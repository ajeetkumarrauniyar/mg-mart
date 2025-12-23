/**
 * Admin authorization middleware for MG Mart grocery application
 *
 * Ensures that only users with admin role can access admin routes
 *
 * @author MG Mart Development Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";

/**
 * Middleware to require admin role for route access
 * Must be used after authenticateToken middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Check if user is authenticated (should be set by authenticateToken middleware)
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            });
            return;
        }

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: "Admin access required. You do not have permission to access this resource."
            });
            return;
        }

        // User is authenticated and has admin role, proceed
        next();
    } catch (error) {
        console.error('Admin authorization error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error during authorization"
        });
    }
};