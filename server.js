require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const YAHOO_FINANCE_API = "https://query1.finance.yahoo.com/v7/finance/quote";

// Utility function to fetch Yahoo Finance data
const fetchYahooFinanceData = async (symbols) => {
  try {
    const response = await axios.get(`${YAHOO_FINANCE_API}?symbols=${symbols}`);
    return response.data.quoteResponse.result;
  } catch (error) {
    console.error("Error fetching data from Yahoo Finance:", error);
    return null;
  }
};

// Fetch sectoral indices data
app.get("/api/getNiftySectors", async (req, res) => {
  try {
    const symbols = "NIFTY_BANK,NIFTY_IT,NIFTY_AUTO"; // Add other sector indices
    const data = await fetchYahooFinanceData(symbols);

    if (!data) {
      return res.status(500).json({ error: "Failed to fetch sector data" });
    }

    const sectors = data.map((sector) => ({
      name: sector.shortName,
      current: sector.regularMarketPrice,
      allTimeHigh: sector.fiftyTwoWeekHigh, // Approximate ATH
    }));

    res.json(sectors);
  } catch (error) {
    console.error("Error fetching sectoral indices:", error);
    res.status(500).json({ error: "Failed to fetch sector data" });
  }
});

// Fetch stocks by sector
app.get("/api/getStocksBySector", async (req, res) => {
  const { sector } = req.query;
  try {
    const stockSymbols = {
      "NIFTY_BANK": "HDFCBANK.NS,ICICIBANK.NS,SBIN.NS",
      "NIFTY_IT": "TCS.NS,INFY.NS,WIPRO.NS",
      "NIFTY_AUTO": "TATAMOTORS.NS,BAJAJ-AUTO.NS,HEROMOTOCO.NS"
    };

    if (!stockSymbols[sector]) {
      return res.status(400).json({ error: "Invalid sector name" });
    }

    const data = await fetchYahooFinanceData(stockSymbols[sector]);

    if (!data) {
      return res.status(500).json({ error: "Failed to fetch stock data" });
    }

    const stocks = data.map((stock) => ({
      name: stock.shortName,
      current_price: stock.regularMarketPrice,
      high_52_week: stock.fiftyTwoWeekHigh,
      low_52_week: stock.fiftyTwoWeekLow,
      all_time_high: stock.fiftyTwoWeekHigh, // Approximate ATH
      all_time_low: stock.fiftyTwoWeekLow, // App
