'use strict';

const fetch = require('node-fetch');
const crypto = require('crypto');
const helmet = require('helmet');

const stockLikes = {};

module.exports = function (app) {
  // Helmet CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": ["'self'"],
          "style-src": ["'self'"]
        }
      }
    })
  );

  const getHashedIP = ip => crypto.createHash('sha256').update(ip).digest('hex');

  async function fetchStockData(symbol) {
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json || !json.symbol || typeof json.latestPrice !== 'number') {
      throw new Error(`Invalid response for stock: ${symbol}`);
    }
    return {
      stock: json.symbol,
      price: json.latestPrice
    };
  }

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      try {
        let { stock, like } = req.query;
        const isArray = Array.isArray(stock);
        const symbols = isArray ? stock.map(s => s.toUpperCase()) : [stock.toUpperCase()];
        const ipHash = getHashedIP(req.ip);

        const results = await Promise.all(symbols.map(async (sym) => {
          const { stock, price } = await fetchStockData(sym);
          if (!stockLikes[stock]) stockLikes[stock] = new Set();
          if (like && !stockLikes[stock].has(ipHash)) {
            stockLikes[stock].add(ipHash);
          }
          return {
            stock,
            price,
            likes: stockLikes[stock].size
          };
        }));

        if (isArray && results.length === 2) {
          const [a, b] = results;
          return res.json({
            stockData: [
              {
                stock: a.stock,
                price: a.price,
                rel_likes: a.likes - b.likes
              },
              {
                stock: b.stock,
                price: b.price,
                rel_likes: b.likes - a.likes
              }
            ]
          });
        } else {
          return res.json({ stockData: results[0] });
        }
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
};
