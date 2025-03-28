'use strict';

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const crypto = require('crypto');

const stockData = {};

module.exports = function (app) {

  const helmet = require('helmet');
  const ninetyDaysInSeconds = 90 * 24 * 60 * 60;

  app.use(helmet({
    hidePoweredBy: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    noSniff: true,
    ieNoOpen: true,
    hsts: { maxAge: ninetyDaysInSeconds, force: true },
    dnsPrefetchControl: true,
    noCache: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "trusted-cdn.com"]
      }
    }
  }));

  const getHashedIP = ip =>
    crypto.createHash('sha256').update(ip).digest('hex');

  async function fetchStock(symbol) {
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
    const res = await fetch(url);
    const data = await res.json();
    return { symbol: data.symbol, price: data.latestPrice };
  }

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      try {
        let { stock, like } = req.query;
        const ipHash = getHashedIP(req.ip);

        if (!stock) return res.status(400).json({ error: 'Stock is required' });

        const isArray = Array.isArray(stock);
        const stocks = isArray ? stock : [stock];
        const results = [];

        for (let symbol of stocks) {
          symbol = symbol.toUpperCase();

          const data = await fetchStock(symbol);
          if (!data.symbol) return res.status(404).json({ error: 'Stock not found' });

          if (!stockData[symbol]) {
            stockData[symbol] = { likes: new Set(), price: data.price };
          }

          if (like && !stockData[symbol].likes.has(ipHash)) {
            stockData[symbol].likes.add(ipHash);
          }

          results.push({
            stock: data.symbol,
            price: data.price,
            likes: stockData[symbol].likes.size
          });
        }

        if (isArray) {
          const [stock1, stock2] = results;
          const rel_likes = stock1.likes - stock2.likes;
          return res.json({
            stockData: [
              { stock: stock1.stock, price: stock1.price, rel_likes },
              { stock: stock2.stock, price: stock2.price, rel_likes: -rel_likes }
            ]
          });
        } else {
          return res.json({ stockData: results[0] });
        }

      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
      }
    });
};
