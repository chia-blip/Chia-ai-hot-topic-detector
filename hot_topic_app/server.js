require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');

// --- Globals ---
const app = express();
const PORT = 8000;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

const RECRUITMENT_KEYWORDS = [
    "recruitment", "hiring", "talent acquisition", "HR trends", "employee engagement",
    "workforce", "job market", "skills gap", "remote work", "future of work",
    "employer branding", "candidate experience", "diversity & inclusion", "compensation",
    "benefits", "HR tech", "AI in HR", "job search", "career development", "onboarding",
    "retention", "upskilling", "reskilling", "human resources", "staffing", "headhunting",
    "employee management", "side gig", "second job", "HR policies", "work-life balance", "gig economy",
    "talent management", "workplace culture", "leadership development", "performance management",
    "recruiter", "employer", "HR professional", "human capital", "talent strategy"
];

// Helper function to introduce a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Middleware ---
// Serve static files from the 'static' directory
app.use('/static', express.static(path.join(process.cwd(), 'hot_topic_app', 'static')));

// --- API Endpoints ---
// Serve the main HTML file from the 'templates' directory
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'hot_topic_app', 'templates', 'index.html'));
});

// API endpoint to get the trends data
app.get('/api/trends', async (req, res) => {
    const { country = 'my', category = 'general' } = req.query;
    let lang = 'en';
    if (country === 'cn' || country === 'tw' || country === 'my') {
        lang = 'zh';
    }
    console.log(`Fetching top headlines from GNews for country: ${country}, category: ${category}, language: ${lang}...`);
    try {
        const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=${country}&max=20&apikey=${GNEWS_API_KEY}`;

        const response = await axios.get(url);
        const articles = response.data.articles;

        // Format the data to match the frontend's expectation, now including more details
        const trendsData = articles.map((article, index) => ({
            rank: index + 1,
            title: article.title,
            url: article.url,
            description: article.description,
            image: article.image,
            source: article.source.name,
            publishedAt: article.publishedAt
        }));

        res.json(trendsData);
    } catch (err) {
        if (err.response) {
            console.error('An error occurred while fetching trends from GNews:', err.response.data);
            res.status(err.response.status).json({ error: err.response.data.errors ? err.response.data.errors.join(', ') : 'Failed to fetch trends from GNews API.' });
        } else {
            console.error('An error occurred while fetching trends:', err.message);
            res.status(500).json({ error: 'Failed to fetch trends.' });
        }
    }
});

let cachedRecommendations = [];
let lastRecommendationFetchTime = 0; // This variable is no longer strictly needed with setInterval, but can be kept for debugging/logging
const RECOMMENDATION_REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // Refresh every 12 hours

// Function to fetch and cache recommendations in the background
async function refreshRecommendationsCache() {
    console.log("Refreshing recommendations cache in background...");
    try {
        // Fetch from a single, most relevant combination to minimize API calls
        const countries = ['my', 'us']; // Reduced countries
        const categories = ['general']; // Reduced categories
        let allArticles = [];

        const getLangForCountry = (countryCode) => {
            if (countryCode === 'cn' || countryCode === 'tw' || countryCode === 'my') {
                return 'zh';
            }
            return 'en';
        };

        for (const country of countries) {
            for (const category of categories) {
                const lang = getLangForCountry(country);
                const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=${country}&max=100&apikey=${GNEWS_API_KEY}`;
                const response = await axios.get(url);
                allArticles = allArticles.concat(response.data.articles);
                await sleep(1000); // Introduce a 1-second delay between API calls
            }
        }

        const relevantArticles = allArticles.filter(article => {
            const title = article.title ? article.title.toLowerCase() : '';
            const description = article.description ? article.description.toLowerCase() : '';
            return RECRUITMENT_KEYWORDS.some(keyword => title.includes(keyword) || description.includes(keyword));
        });

        console.log(`Found ${relevantArticles.length} relevant articles before uniqueness filter.`); // Debug log

        const uniqueRelevantArticles = Array.from(new Map(relevantArticles.map(item => [item['title'], item])).values());
        console.log(`Found ${uniqueRelevantArticles.length} unique relevant articles.`); // Debug log
        const top3Recommendations = uniqueRelevantArticles.slice(0, 3).map((article, index) => ({
            rank: index + 1,
            title: article.title,
            url: article.url,
            description: article.description,
            image: article.image,
            source: article.source.name,
            publishedAt: article.publishedAt
        }));

        console.log("Top 3 Recommendations generated:", top3Recommendations); // Debug log

        cachedRecommendations = top3Recommendations;
        lastRecommendationFetchTime = Date.now(); // Update timestamp
        console.log("Recommendations cache refreshed.");

    } catch (err) {
        console.error("Error refreshing recommendations cache:", err.message);
        if (err.response) {
            console.error("GNews API error response:", err.response.data);
        }
    }
}

// Call refreshRecommendationsCache once on startup, then periodically
refreshRecommendationsCache(); // Initial fetch
setInterval(refreshRecommendationsCache, RECOMMENDATION_REFRESH_INTERVAL);

// New API endpoint for recommendations
app.get('/api/recommendations', (req, res) => { // Make it synchronous as it only returns cached data
    console.log("Returning cached recommendations.");
    res.json(cachedRecommendations);
});

// --- Server Initialization ---
module.exports = app;
