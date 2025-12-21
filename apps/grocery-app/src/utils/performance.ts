/**
 * Performance monitoring utilities
 * Helps track app performance and identify bottlenecks
 */

import React from 'react';

interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
}

class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetric> = new Map();
    private isEnabled: boolean = __DEV__;

    /**
     * Start measuring performance for a specific operation
     */
    start(name: string): void {
        if (!this.isEnabled) return;

        this.metrics.set(name, {
            name,
            startTime: Date.now(),
        });
    }

    /**
     * End measuring performance and log the result
     */
    end(name: string): number | null {
        if (!this.isEnabled) return null;

        const metric = this.metrics.get(name);
        if (!metric) {
            console.warn(`Performance metric "${name}" was not started`);
            return null;
        }

        const endTime = Date.now();
        const duration = endTime - metric.startTime;

        metric.endTime = endTime;
        metric.duration = duration;

        // Log performance metric
        console.log(`⚡ Performance: ${name} took ${duration}ms`);

        // Warn about slow operations
        if (duration > 1000) {
            console.warn(`🐌 Slow operation detected: ${name} took ${duration}ms`);
        }

        return duration;
    }

    /**
     * Measure the execution time of an async function
     */
    async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
        if (!this.isEnabled) return fn();

        this.start(name);
        try {
            const result = await fn();
            this.end(name);
            return result;
        } catch (error) {
            this.end(name);
            throw error;
        }
    }

    /**
     * Get all recorded metrics
     */
    getMetrics(): PerformanceMetric[] {
        return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.metrics.clear();
    }

    /**
     * Enable or disable performance monitoring
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order component to measure component render time
 */
export function withPerformanceMonitoring<P extends object>(
    Component: React.ComponentType<P>,
    componentName?: string
): React.ComponentType<P> {
    const name = componentName || Component.displayName || Component.name || 'Component';

    return function PerformanceWrappedComponent(props: P) {
        React.useEffect(() => {
            performanceMonitor.start(`${name} render`);
            return () => {
                performanceMonitor.end(`${name} render`);
            };
        });

        return React.createElement(Component, props);
    };
}

/**
 * Hook to measure component mount time
 */
export function usePerformanceMonitoring(componentName: string): void {
    React.useEffect(() => {
        performanceMonitor.start(`${componentName} mount`);
        return () => {
            performanceMonitor.end(`${componentName} mount`);
        };
    }, [componentName]);
}

/**
 * Utility to measure API call performance
 */
export async function measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>
): Promise<T> {
    return performanceMonitor.measure(`API: ${name}`, apiCall);
}

export default performanceMonitor;