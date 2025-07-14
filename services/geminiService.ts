
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { Product, Review, CartItem, TrackingEvent, Promotion, BundleOffer, Deal, Badge, Coupon } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat;

/**
 * A wrapper for API calls to implement exponential backoff on rate limit errors (429).
 * @param apiCall The async function to call.
 * @param maxRetries Maximum number of retries.
 * @param initialDelay The initial delay in ms.
 * @returns The result of the API call.
 */
const apiCallWithRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
    let retries = 0;
    let delay = initialDelay;

    while (retries < maxRetries) {
        try {
            return await apiCall();
        } catch (error: any) {
            let isRateLimitError = false;
            // The error from the SDK often contains a JSON string in the message property.
            if (error.message) {
                 try {
                    const errorBody = JSON.parse(error.message);
                    if (errorBody?.error?.status === "RESOURCE_EXHAUSTED" || errorBody?.error?.code === 429) {
                        isRateLimitError = true;
                    }
                } catch (e) {
                    // If parsing fails, we can still check the raw string for key indicators.
                    if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429")) {
                        isRateLimitError = true;
                    }
                }
            }

            retries++;
            if (isRateLimitError && retries < maxRetries) {
                console.warn(`Rate limit exceeded. Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                if (isRateLimitError) {
                    console.error("API call failed after multiple retries due to rate limiting.", error);
                    throw new Error("The service is currently busy due to high traffic. Please try again in a few moments.");
                }
                // Re-throw the original error if it wasn't a rate limit issue or we've exhausted retries.
                throw error;
            }
        }
    }
    // This part should be unreachable if the logic is correct, but for type safety:
    throw new Error("API call failed after exhausting all retries.");
};


const productSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A unique kebab-case id for the product, e.g., 'product-name-123'."},
    name: { type: Type.STRING, description: "The full name of the product." },
    price: { type: Type.STRING, description: "The price of the product, formatted as a string like '$XX.XX'. If a discount is applied, this is the discounted price." },
    originalPrice: { type: Type.STRING, description: "Optional. The original price before discount, formatted as '$XX.XX'. Only include if there's a discount." },
    discountPercentage: { type: Type.NUMBER, description: "Optional. The discount percentage as a whole number (e.g., 20 for 20% off). Only include if there's a discount." },
    description: { type: Type.STRING, description: "A short, compelling description of the product for a customer, up to 200 characters." },
    imageSearchTerm: { type: Type.STRING, description: "A comma-separated list of 2-3 simple, specific keywords for an image service. Example for 'Modern Leather Sofa': 'sofa,furniture,leather,modern'." },
    category: { type: Type.STRING, description: "A single, broad category for the product from the following options: 'Furniture', 'Footwear', 'Electronics', 'Apparel', 'Home Goods', 'Toys', 'Kitchenware', 'Books', 'Sports'." }
  },
  required: ["id", "name", "price", "description", "imageSearchTerm", "category"],
};

const productsListSchema = {
    type: Type.OBJECT,
    properties: {
        products: {
            type: Type.ARRAY,
            description: "A list of relevant products.",
            items: productSchema
        }
    },
    required: ["products"],
};

const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        textResponse: { type: Type.STRING, description: "A conversational text response to the user's prompt." },
        products: {
            type: Type.ARRAY,
            description: "A list of relevant products, if the user asked for them.",
            items: productSchema
        }
    },
    required: ["textResponse"],
};

const promotionSchema = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING },
        description: { type: Type.STRING },
        cta: { type: Type.STRING },
    },
    required: ["headline", "description", "cta"]
};

const bundleOfferSchema = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING },
        description: { type: Type.STRING },
        products: { type: Type.ARRAY, items: { type: Type.STRING } },
        offer: { type: Type.STRING },
    },
    required: ["headline", "description", "products", "offer"]
};

const homePageContentSchema = {
    type: Type.OBJECT,
    properties: {
        products: {
            type: Type.ARRAY,
            description: "A list of 20 products for the homepage.",
            items: productSchema
        },
        promotion: {
            type: Type.OBJECT,
            description: "A promotional offer for the homepage banner.",
            properties: promotionSchema.properties,
        },
        bundle: {
            type: Type.OBJECT,
            description: "A special bundle offer.",
            properties: bundleOfferSchema.properties,
        }
    },
    required: ["products", "promotion", "bundle"]
};

const trackingEventSchema = {
    type: Type.OBJECT,
    properties: {
        status: { type: Type.STRING, description: "The current status of the event (e.g., 'Order Placed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered')."},
        location: { type: Type.STRING, description: "The city and state/country of the event."},
        timestamp: { type: Type.STRING, description: "A realistic timestamp for this event, relative to the current time. Should be a localized string e.g., using new Date().toLocaleString()"},
        description: { type: Type.STRING, description: "A short, descriptive sentence about what happened."}
    },
    required: ["status", "location", "timestamp", "description"]
};

const trackingEventListSchema = {
    type: Type.OBJECT,
    properties: {
        events: {
            type: Type.ARRAY,
            description: "A list of 5-6 realistic, sequential tracking events for an order, starting from 'Order Placed' and ending in 'Delivered'. The final event should be 'Delivered' with a current timestamp.",
            items: trackingEventSchema,
        }
    },
    required: ["events"]
};

const couponSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique ID for the coupon, e.g., 'coupon-168...'" },
        code: { type: Type.STRING, description: "A catchy, short, all-caps coupon code like 'SAVEBIG15'."},
        description: { type: Type.STRING, description: "A short, compelling description of the coupon offer."},
        discountPercentage: { type: Type.NUMBER, description: "The discount percentage as a whole number (e.g., 15 for 15%). Must be 10, 15, or 20."},
        expiryDate: { type: Type.STRING, description: "The expiry date as an ISO string, set to 30 days from now."}
    },
    required: ["id", "code", "description", "discountPercentage", "expiryDate"]
};

const dealSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, catchy title for the discount offer. E.g., 'Tech Special!' or 'Kitchenware Discount'." },
    description: { type: Type.STRING, description: "A brief sentence explaining the deal. E.g., 'Looks like you're buying electronics. Here's a discount on us!'" },
    discountPercentage: { type: Type.NUMBER, description: "The discount percentage as a whole number (e.g., 10 for 10% off). Must be between 5 and 25." },
  },
  required: ["title", "description", "discountPercentage"],
};

const badgeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique kebab-case id for the badge, e.g., 'tech-enthusiast'."},
        name: { type: Type.STRING, description: "The creative name of the badge, e.g., 'Tech Enthusiast'." },
        description: { type: Type.STRING, description: "A short, fun description of why the user earned this badge." },
        icon: { type: Type.STRING, enum: ['Trophy', 'Star', 'Heart', 'Sparkles'], description: "The icon to represent this badge." },
    },
    required: ["id", "name", "description", "icon"],
};

const badgeListSchema = {
    type: Type.OBJECT,
    properties: {
        badges: {
            type: Type.ARRAY,
            description: "A list of 3 to 5 creative badges.",
            items: badgeSchema
        }
    },
    required: ["badges"]
}

const addressSchema = {
  type: Type.OBJECT,
  properties: {
    street: { type: Type.STRING, description: "The street name and number." },
    city: { type: Type.STRING, description: "The city name." },
    state: { type: Type.STRING, description: "The state or province, preferably abbreviated (e.g., CA)." },
    zip: { type: Type.STRING, description: "The postal or zip code." },
  },
  required: ["street", "city", "state", "zip"],
};

const initializeChat = () => {
    const systemInstruction = `You are a friendly, expert shopping assistant for "FutureMart". Your name is 'Jem'.
- Your goal is to help users find products and have a pleasant conversation.
- When a user asks for products, recommendations, or to search for something, you MUST use the provided JSON schema to respond with a list of products.
- The JSON response should include a conversational text part and a list of products.
- If you are just chatting, respond with a JSON object containing only the 'textResponse' field.`;
    
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: chatResponseSchema,
        },
    });
}
initializeChat();

const parseJsonResponse = (responseText: string): any => {
    try {
        const cleanedText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(cleanedText);

        const formatProductImageUrls = (products: Product[] | undefined): Product[] => {
            if (!products) return [];
            return products.map((p: Product) => ({
                ...p,
                imageUrl: `https://loremflickr.com/400/400/${encodeURIComponent(p.category || 'product')},${encodeURIComponent((p.imageSearchTerm || p.name).split(',')[0])}/all`
            }));
        };
        
        if (parsed.products) {
            parsed.products = formatProductImageUrls(parsed.products);
        }
        
        return parsed;
    } catch (error) {
        console.warn("Could not parse JSON. Returning raw text.", "Raw text:", responseText);
        return { textResponse: responseText };
    }
}

const CACHE_KEY_HOME = 'futuremart-home-content';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

export const getHomePageContent = async (): Promise<{ products: Product[], promotion: Promotion, bundle: BundleOffer }> => {
    try {
        const cachedData = localStorage.getItem(CACHE_KEY_HOME);
        if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
                console.log("Serving homepage content from cache.");
                return data;
            }
        }
    } catch (error) {
        console.warn("Could not retrieve homepage content from cache.", error);
    }
    
    try {
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate content for an e-commerce homepage. I need a list of 20 diverse and appealing products for 'Today's Deals', a main promotion for a hero banner, and a special bundle offer. The store is called 'FutureMart' and has a modern, tech-savvy feel.",
            config: {
                responseMimeType: "application/json",
                responseSchema: homePageContentSchema,
            },
        }));
        
        const dataToCache = parseJsonResponse(response.text);

        try {
            const cachePayload = {
                timestamp: Date.now(),
                data: dataToCache
            };
            localStorage.setItem(CACHE_KEY_HOME, JSON.stringify(cachePayload));
        } catch (error) {
            console.warn("Could not save homepage content to cache.", error);
        }

        return dataToCache;
    } catch (error) {
        console.error("Error generating homepage content:", error);
        throw error;
    }
};

export const getChatResponse = async (message: string): Promise<{ textResponse?: string; products?: Product[] }> => {
    if (!chat) {
        console.error("Chat not initialized, re-initializing...");
        initializeChat();
    }

    try {
        const response = await apiCallWithRetry(() => chat.sendMessage({ message }));
        const responseText = response.text;
        if (!responseText) {
             return { textResponse: "I'm sorry, I didn't get a response. Could you try again?" };
        }
        return parseJsonResponse(responseText);
    } catch (error) {
        console.error("Error getting chat response:", error);
        // Attempt to re-establish chat and retry once.
        try {
            console.log("Re-initializing chat and retrying...");
            initializeChat();
            const response = await apiCallWithRetry(() => chat.sendMessage({ message }));
            const responseText = response.text;
            if (!responseText) {
                return { textResponse: "I'm sorry, I'm having trouble connecting right now." };
            }
            return parseJsonResponse(responseText);
        } catch (retryError) {
             console.error("Error getting chat response on retry:", retryError);
             throw new Error("I'm having some connection issues. Please try again in a moment.");
        }
    }
};

export const getCartRecommendations = async (cartItems: CartItem[]): Promise<Product[]> => {
    const itemNames = cartItems.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ');
    try {
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `A user has the following items in their shopping cart: ${itemNames}. Based on these items, suggest 8 other products they might be interested in. These should be complementary or similar items.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: productsListSchema
            },
        }));
        return parseJsonResponse(response.text).products || [];
    } catch (error) {
        console.error("Error getting cart recommendations:", error);
        throw error;
    }
};

export const findProductsFromImage = async (base64Image: string, mimeType: string, prompt: string): Promise<Product[]> => {
    try {
        const imagePart = { inlineData: { data: base64Image, mimeType }};
        const textPart = { text: `You are a visual product search engine. Identify the main product in this image. Then, suggest 12 similar items based on this user prompt: "${prompt}".`};
        
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: productsListSchema,
            },
        }));
        
        return parseJsonResponse(response.text).products || [];
    } catch (error) {
        console.error("Error finding products from image:", error);
        throw error;
    }
};

export const findSwaps = async (product: Product): Promise<Product[]> => {
    try {
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `A user has a '${product.name}' which is in the '${product.category}' category. Find 5 alternative products they might want to swap it for. The suggestions should be in a similar category and price range but different enough to be an interesting trade. Do not suggest the exact same product.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: productsListSchema
            },
        }));
        return parseJsonResponse(response.text).products || [];
    } catch (error) {
        console.error("Error finding swaps:", error);
        throw error;
    }
};

export const getGiftIdeas = async (recipientInfo: string, occasion: string, budget: string): Promise<Product[]> => {
    try {
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please suggest 8 suitable gift products for the following person: "${recipientInfo}". The occasion is "${occasion}" and the budget is "${budget}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: productsListSchema
            },
        }));
        return parseJsonResponse(response.text).products || [];
    } catch (error) {
        console.error("Error getting gift ideas:", error);
        throw error;
    }
};

export const getOrderTrackingUpdates = async (products: Product[]): Promise<TrackingEvent[]> => {
    const productNames = products.map(p => p.name).join(', ');
    try {
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a realistic, simulated package tracking history for an e-commerce order containing these products: ${productNames}. The package is being shipped from Bentonville, AR to Sacramento, CA. Create a sequence of 5-6 events, starting with 'Order Placed' a few days ago and ending with 'Delivered' at the current time. Timestamps should be realistic and sequential.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: trackingEventListSchema
            },
        }));
        const parsed = parseJsonResponse(response.text);
        return parsed.events || [];
    } catch (error) {
        console.error("Error getting order tracking updates:", error);
        return [{
            status: 'Error',
            location: 'System',
            timestamp: new Date().toLocaleString(),
            description: 'We could not retrieve tracking information at this time. Please try again later.'
        }];
    }
};

export const getCheckoutDeal = async (cartItems: CartItem[]): Promise<Deal> => {
    const itemDetails = cartItems.map(item => `${item.name} (Category: ${item.category})`).join(', ');
    try {
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `A user has these items in their cart: ${itemDetails}. Create a single, relevant, and compelling promotional deal for them based on the most prominent category or item type in their cart. The deal must be a percentage discount.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: dealSchema
            },
        }));
        return parseJsonResponse(response.text);
    } catch (error) {
        console.error("Error getting checkout deal:", error);
        throw error;
    }
}

export const getEarnedBadges = async (purchaseHistory: Product[], currentPoints: number): Promise<Badge[]> => {
    const historySummary = purchaseHistory.map(p => p.category).join(', ');
    try {
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `A user has ${currentPoints} loyalty points and a purchase history with these categories: ${historySummary}. Based on this, generate a list of 3-5 fun, creative 'achievement badges' they have earned. Make the badge names and descriptions engaging.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: badgeListSchema,
            },
        }));
        const parsed = parseJsonResponse(response.text);
        return parsed.badges || [];
    } catch (error) {
        console.error("Error getting earned badges:", error);
        throw error;
    }
};

export const generateCouponForPurchase = async (cartItems: CartItem[]): Promise<Coupon> => {
    const itemDetails = cartItems.map(item => `${item.name} in category ${item.category}`).join(', ');
    try {
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `A user just purchased these items: ${itemDetails}. Generate a 'thank you' coupon for their next purchase. The coupon should be for 10%, 15%, or 20% off, and should be relevant to their purchase (e.g., for the same category). The coupon should expire in 30 days. The current date is ${new Date().toISOString()}. Generate a unique ID and a catchy code.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: couponSchema
            },
        }));
        return parseJsonResponse(response.text);
    } catch (error) {
        console.error("Error generating coupon:", error);
        // Fallback to a simple static coupon to not break the user flow
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        return {
            id: `fallback-coupon-${Date.now()}`,
            code: 'THANKS10',
            description: '10% off your next order!',
            discountPercentage: 10,
            expiryDate: expiryDate.toISOString(),
        };
    }
};

export const getAddressFromCoordinates = async (lat: number, lon: number): Promise<{ street: string; city: string; state: string; zip: string; }> => {
    try {
        const response: GenerateContentResponse = await apiCallWithRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Act as a reverse geocoding service. Based on the latitude ${lat} and longitude ${lon}, provide the corresponding address components.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: addressSchema
            },
        }));
        return parseJsonResponse(response.text);
    } catch (error) {
        console.error("Error getting address from coordinates:", error);
        throw error;
    }
};
