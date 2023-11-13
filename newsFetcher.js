// newsFetcher.js
const axios = require('axios');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env

const apiKey = process.env.NEWS_API_KEY;
const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

async function fetchNews() {
    try {
        const response = await axios.get(newsApiUrl);
        const articles = response.data.articles;

        // Log the articles to the console
        console.log('Latest News:');
        articles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.title} - ${article.url}`);
        });

        // Save the articles to a file
        const data = JSON.stringify(articles, null, 2);
        fs.writeFileSync('./latestNews.json', data, 'utf8');

        console.log('News saved to latestNews.json');
    } catch (error) {
        console.error('Error fetching news:', error.message);
    }
}

fetchNews();
