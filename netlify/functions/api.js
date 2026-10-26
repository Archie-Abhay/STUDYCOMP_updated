// Netlify Serverless Function for Gemma 4 Grounded Study Companion
const serverless = require("serverless-http");
const { app } = require("../../server");

module.exports.handler = serverless(app);
