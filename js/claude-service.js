const axios = require('axios');

class ClaudeService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.anthropic.com/v1';
    }

    async analyzeText(content) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/messages`,
                {
                    model: 'claude-3-opus-20240229',
                    max_tokens: 1024,
                    messages: [{
                        role: 'user',
                        content: `Analyze this news content for political motivation and extremist indicators. Classify as: right-wing-extremism, left-wing-extremism, islamist-extremism, other-extremism, or non-political. Return JSON with type and confidence score:\n\n${content}`
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01'
                    }
                }
            );

            return {
                type: response.data.content[0].text,
                confidence: response.data.content[0].metadata?.confidence || 0.7
            };
        } catch (error) {
            console.error('Error analyzing text with Claude:', error.message);
            return {
                type: 'unknown',
                confidence: 0,
                error: error.message
            };
        }
    }

    async batchAnalyzeArticles(articles) {
        try {
            const combinedText = articles.map(article => 
                `Title: ${article.title}\nDescription: ${article.description}\nContent: ${article.content}`
            ).join('\n\n');

            const analysis = await this.analyzeText(combinedText);
            return analysis;
        } catch (error) {
            console.error('Error batch analyzing articles:', error);
            return {
                type: 'error',
                confidence: 0,
                error: error.message
            };
        }
    }
}
