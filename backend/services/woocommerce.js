const fetch = require("node-fetch");
const crypto = require("crypto");
const { WooCommerceError } = require("../utils/errors");

class WooCommerceService {
    constructor() {
        this.apiUrl = process.env.WC_API_URL;
        this.consumerKey = process.env.WC_CONSUMER_KEY;
        this.consumerSecret = process.env.WC_CONSUMER_SECRET;
        
        if (!this.apiUrl || !this.consumerKey || !this.consumerSecret) {
            throw new Error("WooCommerce API credentials not properly configured");
        }
    }

    generateOAuthSignature(method, url, params) {
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = crypto.randomBytes(16).toString('hex');
        
        const oauthParams = {
            oauth_consumer_key: this.consumerKey,
            oauth_nonce: nonce,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: timestamp,
            oauth_version: '1.0',
            ...params
        };

        const sortedParams = Object.keys(oauthParams)
            .sort()
            .map(key => `${key}=${encodeURIComponent(oauthParams[key])}`)
            .join('&');

        const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
        const signingKey = `${encodeURIComponent(this.consumerSecret)}&`;
        
        const signature = crypto
            .createHmac('sha1', signingKey)
            .update(baseString)
            .digest('base64');

        return {
            ...oauthParams,
            oauth_signature: signature
        };
    }

    async makeRequest(method, endpoint, data = null, retries = 3) {
        const url = `${this.apiUrl}${endpoint}`;
        
        try {
            const params = {};
            if (method === 'GET' && data) {
                Object.assign(params, data);
            }

            const oauthParams = this.generateOAuthSignature(method, url, params);
            
            const authHeader = Object.keys(oauthParams)
                .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
                .join(', ');

            const options = {
                method,
                headers: {
                    'Authorization': `OAuth ${authHeader}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Node.js WooCommerce API Client'
                }
            };

            if (method !== 'GET' && data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `WooCommerce API Error: ${response.status} ${response.statusText}`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.log(e, "Error.")
                }
                
                throw new WooCommerceError(errorMessage, response.status);
            }

            return await response.json();
        } catch (error) {
            if (retries > 0 && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
                console.log(`Retrying WooCommerce request... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.makeRequest(method, endpoint, data, retries - 1);
            }
            throw error;
        }
    }

    async createProduct(productData) {
        const wcProduct = {
            name: productData.name,
            description: productData.description || '',
            regular_price: productData.price.toString(),
            status: 'publish',
            catalog_visibility: 'visible'
        };

        if (productData.imageUrl) {
            wcProduct.images = [{ src: productData.imageUrl }];
        }

        return await this.makeRequest('POST', '/products', wcProduct);
    }

    async updateProduct(woocommerceId, productData) {
        const wcProduct = {};
        
        if (productData.name) wcProduct.name = productData.name;
        if (productData.description !== undefined) wcProduct.description = productData.description;
        if (productData.price) wcProduct.regular_price = productData.price.toString();
        if (productData.imageUrl) wcProduct.images = [{ src: productData.imageUrl }];

        return await this.makeRequest('PUT', `/products/${woocommerceId}`, wcProduct);
    }

    async deleteProduct(woocommerceId) {
        return await this.makeRequest('DELETE', `/products/${woocommerceId}`, { force: true });
    }

    async getProduct(woocommerceId) {
        return await this.makeRequest('GET', `/products/${woocommerceId}`);
    }
}

module.exports = new WooCommerceService();
