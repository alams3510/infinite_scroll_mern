const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");
require("dotenv").config();
const { rateLimit } = require("express-rate-limit");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const port = process.env.PORT || 8080;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, //in 1 minute
  limit: 12, // 12 req permisible
});
app.use(limiter);

app.get("/get-posts", async (req, res) => {
  const { limit, skip } = req.query;
  let filterData;
  let result;
  try {
    result = await axios.get("https://jsonplaceholder.typicode.com/posts");
    if (parseInt(limit) <= result.data.length) {
      filterData = result.data.slice(skip, limit);
      return res
        .status(200)
        .json({ data: filterData, total: result.data.length });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

app.get("/", (req, res) => {
  res.send("hello from server");
});

app.listen(port, () => {
  console.log("app is running on port : ", port);
});
