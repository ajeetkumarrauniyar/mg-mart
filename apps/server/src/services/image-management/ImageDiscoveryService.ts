import axios from 'axios';
import {
    ImageDiscoveryService as IImageDiscoveryService,
    DiscoveredImage,
    ProductIdentifier,
    QualityScore,
    ImageFormat,
    ImageDimensions,
    ImageMetadata
} from '../../types/image-management/index.js';

interface GoogleSearchResult {
    items?: Array<{
        title: string;
        link: string;
        image?: {
            contextLink: string;
            height: number;
            width: number;
            byteSize: number;
            thumbnailLink: string;
            thumbnailHeight: number;
            thumbnailWidth: number;
        };
    }>;
}

interface BingSearchResult {
    value?: Array<{
        name: string;
        contentUrl: string;
        hostPageUrl: string;
        width: number;
        height: number;
        contentSize: string;
        thumbnailUrl: string;
    }>;
}

export class ImageDiscoveryService implements IImageDiscoveryService {
    private readonly googleApiKey: string;
    private readonly googleSearchEngineId: string;
    private readonly bingApiKey: string;
    private readonly maxImagesPerSearch: number = 10;
    private readonly requestTimeout: number = 10000; // 10 seconds

    constructor() {
        this.googleApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '';
        this.googleSearchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';
        this.bingApiKey = process.env.BING_SEARCH_API_KEY || '';

        if (!this.googleApiKey && !this.bingApiKey) {
            console.warn('No image search API keys configured. Image discovery will be limited.');
        }
    }

    async searchImages(productIdentifiers: ProductIdentifier[]): Promise<DiscoveredImage[]> {
        const allImages: DiscoveredImage[] = [];

        for (const identifier of productIdentifiers) {
            try {
                const searchQueries = this.generateSearchQueries(identifier);

                for (const query of searchQueries) {
                    // Try Google first, then Bing as fallback
                    let images: DiscoveredImage[] = [];

                    if (this.googleApiKey && this.googleSearchEngineId) {
                        images = await this.searchWithGoogle(query);
                    }

                    // If Google didn't return enough results, try Bing
                    if (images.length < 3 && this.bingApiKey) {
                        const bingImages = await this.searchWithBing(query);
                        images = [...images, ...bingImages];
                    }

                    allImages.push(...images);
                }
            } catch (error) {
                console.error(`Error searching images for ${identifier.productName}:`, error);
            }
        }

        // Remove duplicates and limit results
        const uniqueImages = this.removeDuplicateImages(allImages);
        return uniqueImages.slice(0, this.maxImagesPerSearch);
    }

    private generateSearchQueries(identifier: ProductIdentifier): string[] {
        const queries: string[] = [];

        // Primary query with product name
        queries.push(`${identifier.productName} product image`);

        // Add display name if available
        if (identifier.displayName && identifier.displayName !== identifier.productName) {
            queries.push(`${identifier.displayName} product`);
        }

        // Add brand and category if available
        if (identifier.brand && identifier.category) {
            queries.push(`${identifier.brand} ${identifier.productName} ${identifier.category}`);
        } else if (identifier.brand) {
            queries.push(`${identifier.brand} ${identifier.productName}`);
        } else if (identifier.category) {
            queries.push(`${identifier.productName} ${identifier.category}`);
        }

        return queries.slice(0, 3); // Limit to 3 queries to avoid rate limits
    }

    private async searchWithGoogle(query: string): Promise<DiscoveredImage[]> {
        try {
            const url = 'https://www.googleapis.com/customsearch/v1';
            const params = {
                key: this.googleApiKey,
                cx: this.googleSearchEngineId,
                q: query,
                searchType: 'image',
                num: 5,
                safe: 'active',
                imgSize: 'medium',
                imgType: 'photo'
            };

            const response = await axios.get<GoogleSearchResult>(url, {
                params,
                timeout: this.requestTimeout
            });

            if (!response.data.items) {
                return [];
            }

            return response.data.items
                .filter(item => item.image && this.isValidImageUrl(item.link))
                .map(item => this.createDiscoveredImageFromGoogle(item, query));

        } catch (error) {
            console.error('Google image search error:', error);
            return [];
        }
    }

    private async searchWithBing(query: string): Promise<DiscoveredImage[]> {
        try {
            const url = 'https://api.bing.microsoft.com/v7.0/images/search';
            const headers = {
                'Ocp-Apim-Subscription-Key': this.bingApiKey
            };
            const params = {
                q: query,
                count: 5,
                safeSearch: 'Moderate',
                size: 'Medium'
            };

            const response = await axios.get<BingSearchResult>(url, {
                headers,
                params,
                timeout: this.requestTimeout
            });

            if (!response.data.value) {
                return [];
            }

            return response.data.value
                .filter(item => this.isValidImageUrl(item.contentUrl))
                .map(item => this.createDiscoveredImageFromBing(item, query));

        } catch (error) {
            console.error('Bing image search error:', error);
            return [];
        }
    }

    private createDiscoveredImageFromGoogle(item: any, query: string): DiscoveredImage {
        const id = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            id,
            sourceUrl: item.link,
            thumbnailUrl: item.image.thumbnailLink,
            dimensions: {
                width: item.image.width,
                height: item.image.height
            },
            fileSize: item.image.byteSize || 0,
            format: this.getImageFormatFromUrl(item.link),
            relevanceScore: this.calculateRelevanceScore(item.title, query),
            qualityScore: this.estimateQualityScore(item.image.width, item.image.height),
            metadata: {
                sourceUrl: item.link,
                fileName: this.extractFileNameFromUrl(item.link),
                fileSize: item.image.byteSize || 0,
                format: this.getImageFormatFromUrl(item.link),
                dimensions: {
                    width: item.image.width,
                    height: item.image.height
                },
                contentType: `image/${this.getImageFormatFromUrl(item.link)}`,
                uploadedAt: new Date()
            },
            discoveredAt: new Date()
        };
    }

    private createDiscoveredImageFromBing(item: any, query: string): DiscoveredImage {
        const id = `bing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            id,
            sourceUrl: item.contentUrl,
            thumbnailUrl: item.thumbnailUrl,
            dimensions: {
                width: item.width,
                height: item.height
            },
            fileSize: this.parseBingContentSize(item.contentSize),
            format: this.getImageFormatFromUrl(item.contentUrl),
            relevanceScore: this.calculateRelevanceScore(item.name, query),
            qualityScore: this.estimateQualityScore(item.width, item.height),
            metadata: {
                sourceUrl: item.contentUrl,
                fileName: this.extractFileNameFromUrl(item.contentUrl),
                fileSize: this.parseBingContentSize(item.contentSize),
                format: this.getImageFormatFromUrl(item.contentUrl),
                dimensions: {
                    width: item.width,
                    height: item.height
                },
                contentType: `image/${this.getImageFormatFromUrl(item.contentUrl)}`,
                uploadedAt: new Date()
            },
            discoveredAt: new Date()
        };
    }

    async validateImageQuality(image: DiscoveredImage): Promise<QualityScore> {
        // Basic quality assessment based on available metadata
        const dimensions = image.dimensions;
        const aspectRatio = dimensions.width / dimensions.height;

        // Calculate individual scores
        const sharpness = this.assessSharpness(dimensions);
        const brightness = 0.8; // Default assumption
        const contrast = 0.8; // Default assumption
        const colorfulness = 0.8; // Default assumption
        const hasWatermark = this.detectPotentialWatermark(image.sourceUrl);

        // Calculate overall score
        const sizeScore = Math.min(1, Math.max(0, (dimensions.width * dimensions.height) / (800 * 600)));
        const aspectScore = this.assessAspectRatio(aspectRatio);

        const overall = (sharpness + brightness + contrast + colorfulness + sizeScore + aspectScore) / 6;

        return {
            overall: Math.round(overall * 100) / 100,
            sharpness,
            brightness,
            contrast,
            colorfulness,
            hasWatermark
        };
    }

    rankImagesByRelevance(images: DiscoveredImage[], product: ProductIdentifier): DiscoveredImage[] {
        return images
            .map(image => ({
                ...image,
                relevanceScore: this.calculateEnhancedRelevanceScore(image, product)
            }))
            .sort((a, b) => {
                // Primary sort by relevance score
                if (b.relevanceScore !== a.relevanceScore) {
                    return b.relevanceScore - a.relevanceScore;
                }
                // Secondary sort by quality score
                return b.qualityScore - a.qualityScore;
            });
    }

    private calculateEnhancedRelevanceScore(image: DiscoveredImage, product: ProductIdentifier): number {
        let score = image.relevanceScore;

        // Boost score if image URL contains product name
        const urlLower = image.sourceUrl.toLowerCase();
        const productNameLower = product.productName.toLowerCase();

        if (urlLower.includes(productNameLower.replace(/\s+/g, '-'))) {
            score += 0.2;
        }

        // Boost score for appropriate dimensions (product images are usually landscape or square)
        const aspectRatio = image.dimensions.width / image.dimensions.height;
        if (aspectRatio >= 0.8 && aspectRatio <= 1.5) {
            score += 0.1;
        }

        // Boost score for larger images (better quality)
        const pixelCount = image.dimensions.width * image.dimensions.height;
        if (pixelCount > 300000) { // > 300k pixels
            score += 0.1;
        }

        return Math.min(1, score);
    }

    private isValidImageUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            const extension = urlObj.pathname.toLowerCase().split('.').pop();
            return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '');
        } catch {
            return false;
        }
    }

    private getImageFormatFromUrl(url: string): ImageFormat {
        try {
            const extension = new URL(url).pathname.toLowerCase().split('.').pop();
            switch (extension) {
                case 'jpg':
                case 'jpeg':
                    return ImageFormat.JPEG;
                case 'png':
                    return ImageFormat.PNG;
                case 'webp':
                    return ImageFormat.WEBP;
                case 'gif':
                    return ImageFormat.GIF;
                default:
                    return ImageFormat.JPEG;
            }
        } catch {
            return ImageFormat.JPEG;
        }
    }

    private extractFileNameFromUrl(url: string): string {
        try {
            const pathname = new URL(url).pathname;
            return pathname.split('/').pop() || 'unknown.jpg';
        } catch {
            return 'unknown.jpg';
        }
    }

    private calculateRelevanceScore(title: string, query: string): number {
        const titleLower = title.toLowerCase();
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(' ').filter(word => word.length > 2);

        let matches = 0;
        for (const word of queryWords) {
            if (titleLower.includes(word)) {
                matches++;
            }
        }

        return Math.min(1, matches / queryWords.length);
    }

    private estimateQualityScore(width: number, height: number): number {
        const pixelCount = width * height;
        const aspectRatio = width / height;

        // Score based on resolution
        let score = Math.min(1, pixelCount / 500000); // Normalize to 500k pixels

        // Penalize extreme aspect ratios
        if (aspectRatio < 0.5 || aspectRatio > 2) {
            score *= 0.8;
        }

        return Math.round(score * 100) / 100;
    }

    private assessSharpness(dimensions: ImageDimensions): number {
        // Estimate sharpness based on resolution
        const pixelCount = dimensions.width * dimensions.height;
        return Math.min(1, pixelCount / 400000);
    }

    private assessAspectRatio(aspectRatio: number): number {
        // Prefer square to slightly rectangular images for products
        if (aspectRatio >= 0.8 && aspectRatio <= 1.25) {
            return 1;
        } else if (aspectRatio >= 0.6 && aspectRatio <= 1.67) {
            return 0.8;
        } else {
            return 0.6;
        }
    }

    private detectPotentialWatermark(url: string): boolean {
        const urlLower = url.toLowerCase();
        const watermarkIndicators = ['watermark', 'logo', 'brand', 'copyright', 'shutterstock', 'getty'];
        return watermarkIndicators.some(indicator => urlLower.includes(indicator));
    }

    private parseBingContentSize(contentSize: string): number {
        if (!contentSize) return 0;

        const match = contentSize.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    private removeDuplicateImages(images: DiscoveredImage[]): DiscoveredImage[] {
        const seen = new Set<string>();
        return images.filter(image => {
            if (seen.has(image.sourceUrl)) {
                return false;
            }
            seen.add(image.sourceUrl);
            return true;
        });
    }
}