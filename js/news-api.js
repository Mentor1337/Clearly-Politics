const NewsAPI = require('newsapi');
const axios = require('axios');

class NewsService {
    constructor(apiKey) {
        this.newsapi = new NewsAPI(apiKey);
        this.newsCache = new Map();
        this.cacheDuration = 3600000; // 1 hour in milliseconds
    }

    async getArticles(searchQuery) {
        // Check cache first
        const cacheKey = this.generateCacheKey(searchQuery);
        const cachedResult = this.getFromCache(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        try {
            const response = await this.newsapi.v2.everything({
                q: searchQuery,
                language: 'en',
                sortBy: 'relevancy',
                pageSize: 5
            });

            // Cache the results
            this.addToCache(cacheKey, response.articles);
            return response.articles;
        } catch (error) {
            console.error('Error fetching news articles:', error);
            return [];
        }
    }

    async analyzePoliticalMotivation(articles) {
        if (!articles || articles.length === 0) {
            return { type: 'unknown', confidence: 0 };
        }

        // Combine article texts for analysis
        const combinedText = articles.map(article => 
            `${article.title}\n${article.description}\n${article.content}`
        ).join('\n\n');

        try {
            const analysis = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Analyze the following news articles about a shooting incident and classify any political or extremist motivation."
                    },
                    {
                        role: "user",
                        content: combinedText
                    }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                type: analysis.data.choices[0].message.content,
                confidence: 0.8 // Example confidence score
            };
        } catch (error) {
            console.error('Error analyzing political motivation:', error);
            return { type: 'error', confidence: 0 };
        }
    }

    generateCacheKey(query) {
        return `news_${query.toLowerCase().replace(/\s+/g, '_')}`;
    }

    getFromCache(key) {
        const cached = this.newsCache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > this.cacheDuration) {
            this.newsCache.delete(key);
            return null;
        }

        return cached.data;
    }

    addToCache(key, data) {
        this.newsCache.set(key, {
            timestamp: Date.now(),
            data
        });
    }
}

module.exports = NewsService;
