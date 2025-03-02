require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const YAHOO_FINANCE_API = "https://query1.finance.yahoo.com/v7/finance/quote";

// Utility function to fetch stock data from Yahoo Finance
const fetchYahooFinanceData = async (symbols) => {
  try {
    const response = await axios.get(`${YAHOO_FINANCE_API}?symbols=${symbols}`);
    if (response.data && response.data.quoteResponse) {
      return response.data.quoteResponse.result;
    } else {
      console.error("Invalid response from Yahoo Finance");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data from Yahoo Finance:", error.message);
    return null;
  }
};

// Endpoint to fetch sectoral indices
app.get("/api/getNiftySectors", async (req, res) => {
  try {
    const symbols = "NIFTY_BANK,NIFTY_IT,NIFTY_AUTO"; // Modify for actual indices
    const data = await fetchYahooFinanceData(symbols);

    if (!data) {
      return res.status(500).json({ error: "Failed to fetch sector data" });
    }

    const sectors = data.map((sector) => ({
      name: sector.shortName || "Unknown",
      current: sector.regularMarketPrice || 0,
      allTimeHigh: sector.fiftyTwoWeekHigh || 0, // Using 52-week high as approx ATH
    }));

    res.json(sectors);
  } catch (error) {
    console.error("Error fetching sectoral indices:", error);
    res.status(500).json({ error: "Failed to fetch sector data" });
  }
});

// Endpoint to fetch stocks by sector
app.get("/api/getStocksBySector", async (req, res) => {
  const { sector } = req.query;
  try {
    const stockSymbols = {
      "NIFTY_BANK": "HDFCBANK.NS,ICICIBANK.NS,SBIN.NS",
      "NIFTY_IT": "TCS.NS,INFY.NS,WIPRO.NS",
      "NIFTY_AUTO": "TATAMOTORS.NS,BAJAJ-AUTO.NS,HEROMOTOCO.NS",
    };

    if (!stockSymbols[sector]) {
      return res.status(400).json({ error: "Invalid sector name" });
    }

    const data = await fetchYahooFinanceData(stockSymbols[sector]);

    if (!data) {
      return res.status(500).json({ error: "Failed to fetch stock data" });
    }

    const stocks = data.map((stock) => ({
      name: stock.shortName || "Unknown",
      current_price: stock.regularMarketPrice || 0,
      high_52_week: stock.fiftyTwoWeekHigh || 0,
      low_52_week: stock.fiftyTwoWeekLow || 0,
      all_time_high: stock.fiftyTwoWeekHigh || 0, // Using 52-week high as approx ATH
      all_time_low: stock.fiftyTwoWeekLow || 0, // Using 52-week low as approx ATL
    }));

    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
