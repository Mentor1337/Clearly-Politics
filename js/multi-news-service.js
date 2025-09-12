const axios = require('axios');

class MultiNewsService {
    constructor(apiKeys) {
        this.apiKeys = apiKeys;
        this.requestCounts = {
            mediastack: 0,
            gnews: 0,
            newsdata: 0,
            nyt: 0
        };
    }

    async getArticles(searchQuery) {
        // Try each API in order until we get results
        const apis = [
            this.tryMediastack.bind(this),
            this.tryGNews.bind(this),
            this.tryNewsdata.bind(this),
            this.tryNYT.bind(this)
        ];

        for (const api of apis) {
            try {
                const articles = await api(searchQuery);
                if (articles && articles.length > 0) {
                    return articles;
                }
            } catch (error) {
                console.warn(`API attempt failed: ${error.message}`);
                continue; // Try next API
            }
        }

        return []; // Return empty array if all APIs fail
    }

    async tryMediastack(searchQuery) {
        if (!this.apiKeys.MEDIASTACK_API_KEY || this.requestCounts.mediastack >= 100) {
            return null;
        }
        
        this.requestCounts.mediastack++;
        const response = await axios.get('http://api.mediastack.com/v1/news', {
            params: {
                access_key: this.apiKeys.MEDIASTACK_API_KEY,
                keywords: searchQuery,
                languages: 'en',
                sort: 'published_desc',
                limit: 5
            }
        });

        return response.data.data.map(article => ({
            title: article.title,
            description: article.description,
            content: article.description,
            url: article.url,
            publishedAt: article.published_at,
            source: {
                name: article.source
            }
        }));
    }

    async tryGNews(searchQuery) {
        if (!this.apiKeys.GNEWS_API_KEY) {
            return null;
        }

        const response = await axios.get('https://gnews.io/api/v4/search', {
            params: {
                q: searchQuery,
                lang: 'en',
                country: 'us',
                max: 5,
                apikey: this.apiKeys.GNEWS_API_KEY
            }
        });

        return response.data.articles.map(article => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            publishedAt: article.publishedDate,
            source: {
                name: article.source.name
            }
        }));
    }

    async tryNewsdata(searchQuery) {
        if (!this.apiKeys.NEWSDATA_API_KEY) {
            return null;
        }

        const response = await axios.get('https://newsdata.io/api/1/news', {
            params: {
                apikey: this.apiKeys.NEWSDATA_API_KEY,
                q: searchQuery,
                language: 'en',
                country: 'us'
            }
        });

        return response.data.results.map(article => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.link,
            publishedAt: article.pubDate,
            source: {
                name: article.source_id
            }
        }));
    }

    async tryNYT(searchQuery) {
        if (!this.apiKeys.NYT_API_KEY) {
            return null;
        }

        // Try Top Stories first
        try {
            const response = await axios.get('https://api.nytimes.com/svc/search/v2/articlesearch.json', {
                params: {
                    'api-key': this.apiKeys.NYT_API_KEY,
                    'q': searchQuery,
                    'sort': 'newest'
                }
            });

            return response.data.response.docs.slice(0, 5).map(article => ({
                title: article.headline.main,
                description: article.abstract,
                content: article.lead_paragraph,
                url: article.web_url,
                publishedAt: article.pub_date,
                source: {
                    name: 'The New York Times'
                }
            }));
        } catch (error) {
            // If article search fails, try Most Popular API
            const response = await axios.get('https://api.nytimes.com/svc/mostpopular/v2/viewed/1.json', {
                params: {
                    'api-key': this.apiKeys.NYT_API_KEY
                }
            });

            return response.data.results
                .filter(article => article.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5)
                .map(article => ({
                    title: article.title,
                    description: article.abstract,
                    content: article.abstract,
                    url: article.url,
                    publishedAt: article.published_date,
                    source: {
                        name: 'The New York Times'
                    }
                }));
        }
    }
}

module.exports = MultiNewsService;
