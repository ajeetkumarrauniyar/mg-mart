/**
 * Simple endpoint to test environment variables
 */

import { Request, Response } from 'express';

export const testEnvEndpoint = (req: Request, res: Response) => {
    const envVars = {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'Not set',
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set',
        GOOGLE_CUSTOM_SEARCH_API_KEY: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY ? 'Set' : 'Not set',
        GOOGLE_CUSTOM_SEARCH_ENGINE_ID: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID ? 'Set' : 'Not set',
        JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
    };

    res.json({
        success: true,
        message: 'Environment variables status',
        data: envVars
    });
};