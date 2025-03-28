'use strict';
const fetch = require('node-fetch');

const stocks = {};

function anonymizeIP(ip) {
  if (!ip) return 'anonymous';
  return require('crypto').createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

async function getStockPrice(stock) {
  const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
  const { latestPrice } = await response.json();
  return latestPrice;
}

function updateStockData(stock, ip, like) {
  const stockUpper = stock.toUpperCase();
  if (!stocks[stockUpper]) {
    stocks[stockUpper] = { likes: new Set() };
  }

  const ipHash = anonymizeIP(ip);
  if (like && !stocks[stockUpper].likes.has(ipHash)) {
    stocks[stockUpper].likes.add(ipHash);
  }

  return {
    likes: stocks[stockUpper].likes.size
  };
}

module.exports = function(app) {
  app.get('/api/stock-prices', async (req, res) => {
    try {
      const { stock, like } = req.query;
      const likeBool = like === 'true';
      const ip = req.ip;

      if (!stock) {
        return res.json({ error: 'Stock symbol required' });
      }

      if (Array.isArray(stock)) {
        if (stock.length !== 2) {
          return res.json({ error: 'Compare requires exactly 2 stocks' });
        }

        const stockData = await Promise.all(stock.map(async (symbol) => {
          const price = await getStockPrice(symbol);
          const { likes } = updateStockData(symbol, ip, likeBool);
          return { stock: symbol, price, likes };
        }));

        const rel_likes = stockData[0].likes - stockData[1].likes;
        stockData[0].rel_likes = rel_likes;
        stockData[1].rel_likes = -rel_likes;
        delete stockData[0].likes;
        delete stockData[1].likes;

        return res.json({ stockData });
      }

      const price = await getStockPrice(stock);
      const { likes } = updateStockData(stock, ip, likeBool);
      res.json({ stockData: { stock, price, likes } });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
};