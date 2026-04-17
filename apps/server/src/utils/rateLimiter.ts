/**
 * Simple in-memory rate limiter for API calls
 * In production, this should be replaced with Redis-based rate limiting
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

export class RateLimiter {
    private limits: Map<string, RateLimitEntry> = new Map();
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests: number = 100, windowMs: number = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;

        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
        const now = Date.now();
        const entry = this.limits.get(key);

        if (!entry || now > entry.resetTime) {
            // First request or window expired
            const newEntry: RateLimitEntry = {
                count: 1,
                resetTime: now + this.windowMs
            };
            this.limits.set(key, newEntry);

            return {
                allowed: true,
                remaining: this.maxRequests - 1,
                resetTime: newEntry.resetTime
            };
        }

        if (entry.count >= this.maxRequests) {
            // Rate limit exceeded
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.resetTime
            };
        }

        // Increment count
        entry.count++;
        this.limits.set(key, entry);

        return {
            allowed: true,
            remaining: this.maxRequests - entry.count,
            resetTime: entry.resetTime
        };
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.limits.entries()) {
            if (now > entry.resetTime) {
                this.limits.delete(key);
            }
        }
    }

    reset(key: string): void {
        this.limits.delete(key);
    }

    getStats(): { totalKeys: number; activeKeys: number } {
        const now = Date.now();
        let activeKeys = 0;

        for (const entry of this.limits.values()) {
            if (now <= entry.resetTime) {
                activeKeys++;
            }
        }

        return {
            totalKeys: this.limits.size,
            activeKeys
        };
    }
}

// Global rate limiters for different services
export const googleSearchLimiter = new RateLimiter(100, 24 * 60 * 60 * 1000); // 100 requests per day
export const bingSearchLimiter = new RateLimiter(1000, 30 * 24 * 60 * 60 * 1000); // 1000 requests per month