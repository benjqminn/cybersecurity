'use strict';

const express = require('express');
const helmet = require('helmet');

module.exports = function (app) {
  const stockLikes = {};

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      },
    }),
  );

  app.route('/api/stock-prices').get(async (req, res) => {
    try {
      let { stock, like } = req.query;

      if (!stock) {
        return res.status(400).json({ error: 'Stock symbol is required' });
      }

      const stocks = Array.isArray(stock) ? stock : [stock];

      const stockDataArray = await Promise.all(
        stocks.map(async (symbol) => {
          try {
            const response = await fetch(
              `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
            );
            const data = await response.json();

            if (!data || !data.symbol || !data.latestPrice) {
              return { stock: symbol, price: 'N/A', likes: stockLikes[symbol] || 0 };
            }

            const price = data.latestPrice;
            stockLikes[symbol] = stockLikes[symbol] || 0;

            if (like === 'true') {
              stockLikes[symbol] += 1;
            }

            return { stock: symbol, price, likes: stockLikes[symbol] };
          } catch (error) {
            console.error(`Error fetching stock data for ${symbol}:`, error);
            return { stock: symbol, price: 'N/A', likes: stockLikes[symbol] || 0 };
          }
        })
      );

      if (stockDataArray.length === 1) {
        return res.json({ stockData: stockDataArray[0] });
      }

      const [stock1, stock2] = stockDataArray;
      res.json({
        stockData: [
          { stock: stock1.stock, price: stock1.price, rel_likes: stock1.likes - stock2.likes },
          { stock: stock2.stock, price: stock2.price, rel_likes: stock2.likes - stock1.likes },
        ],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};