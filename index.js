const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({
  origin: "*",
}));

app.get("/restaurants", async (req, res) => {
  let result = [];
  try {
    const response = await fetch(
      process.env.RESTAURANT_LIST_API,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch data." });
    }

    const json = await response.json();
    
    if (!json?.data?.cards || json.data.cards.length === 0) {
      return res.status(500).json({ error: "No restaurant data found." });
    }

    result = json.data.cards
      .map(card => card?.card?.card?.gridElements?.infoWithStyle?.restaurants)
      .filter(restaurants => Array.isArray(restaurants) && restaurants.length > 0);

    if (result.length === 0) {
      return res.status(500).json({ error: "No valid restaurant data found." });
    }

    const lengthiestArray = result.reduce((longest, current) => {
      return current.length > longest.length ? current : longest;
    }, []);

    res.json(lengthiestArray);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

app.get("/getMenu/:resId", async (req,res) => {
  try{
    const resId = req.params.resId;
    if (resId) {
      const response = await fetch(process.env.MENU_API + resId + process.env.MENU_API_END, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      if (!response.ok) {
        return res.status(500).json({ error: "Failed to fetch data from Swiggy API" });
      }
      const menu = await response.json();
      res.json(menu);
    } else {
      res.status(400).json({ error: "Restaurant ID is missing." });
    }
  }catch(error){
    res.status(500).json({ error: "Failed to fetch data." });
  }
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
