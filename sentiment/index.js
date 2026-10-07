require('dotenv').config();
const express = require('express');
const axios = require('axios');
const logger = require('./logger');
const expressPino = require('express-pino-logger')({ logger });
const natural = require("natural");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(expressPino);

// Define the sentiment analysis route
app.post('/sentiment', async (req, res) => {
	const { sentence } = req.query;


	if (!sentence) {
		logger.error('No se proporcionó ninguna oración');
		return res.status(400).json({ error: 'No se proporcionó ninguna oración' });
	}

	// Initialize the sentiment analyzer with the Natural's PorterStemmer and "English" language
	const Analyzer = natural.SentimentAnalyzer;
	const stemmer = natural.PorterStemmer;
	const analyzer = new Analyzer("English", stemmer, "afinn");

	// Perform sentiment analysis
	try {
		const analysisResult = analyzer.getSentiment(sentence.split(' '));

		let sentiment = "neutral";

		if (analysisResult < 0) {
			sentiment = "negative";
		} else if (analysisResult > 0.33) {
			sentiment = "positive";
		}

		// Logging the result
		logger.info(`Resultado del análisis de sentimientos: ${analysisResult}`);
		// Responding with the sentiment analysis result
		res.status(200).json({ sentimentScore: analysisResult, sentiment: sentiment });
	} catch (error) {
		logger.error(`Error al realizar el análisis de sentimientos: ${error}`);
		res.status(500).json({ message: 'Error al realizar el análisis de sentimientos' });
	}
});

// Start the server
app.listen(port, () => {
	logger.info(`Servidor en ejecución en el puerto ${port}`);
});