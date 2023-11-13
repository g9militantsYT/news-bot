// newsFetcher.js
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const apiKey = process.env.NEWS_API_KEY;
const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

async function fetchNews() {
    try {
        const response = await axios.get(newsApiUrl);
        const articles = response.data.articles;

        console.log('Latest News:');
        articles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.title} - ${article.url}`);
        });

        return articles;
    } catch (error) {
        console.error('Error fetching news:', error.message);
        throw error;
    }
}

module.exports = fetchNews;
