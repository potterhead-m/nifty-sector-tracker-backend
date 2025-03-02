require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Fetch sectoral indices data
app.get("/api/getNiftySectors", async (req, res) => {
  try {
    // const response = await axios.get("https://nifty-backend.onrender.com/api/getNiftySectors");
    // const response = await axios.get(`https://nifty-backend.onrender.com/api/getStocksBySector?sector=${sector}`);

    const response = await axios.get("https://www.nseindia.com/api/sectoral-indices");
    const sectors = response.data.data.map((sector) => ({
      name: sector.indexName,
      current: sector.last,
      allTimeHigh: sector.recordHigh, // Replace with actual field
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
    const response = await axios.get(`https://www.nseindia.com/api/sector-stocks?sector=${sector}`);
    const stocks = response.data.data.map((stock) => ({
      name: stock.symbol,
      current_price: stock.lastPrice,
      high_52_week: stock.high52,
      low_52_week: stock.low52,
      all_time_high: stock.allTimeHigh, // Replace with actual field
      all_time_low: stock.allTimeLow,   // Replace with actual field
    }));
    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
