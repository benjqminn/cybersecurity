'use strict';
const https = require('https');
const mongoose = require('mongoose');
const crypto = require('crypto');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stock-checker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const stockSchema = new mongoose.Schema({
  symbol: { 
    type: String, 
    required: true, 
    uppercase: true 
  },
  likes: { 
    type: [String], 
    default: [] 
  }
});
const Stock = mongoose.model('Stock', stockSchema);

const fetchStockPrice = (symbol) => {
  return new Promise((resolve, reject) => {
    https.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid stock symbol'));
        }
      });
    }).on('error', reject);
  });
};

const anonymizeIP = (ip) => {
  if (!ip) return 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').substr(0, 16);
};

module.exports = function(app) {
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      try {
        const { stock, like } = req.query;
        
        if (!stock) {
          return res.json({ error: 'Please provide a stock symbol' });
        }

        const symbols = Array.isArray(stock) ? stock : [stock];
        if (symbols.length > 2) {
          return res.json({ error: 'Maximum 2 stocks can be compared' });
        }

        const likeBool = like === 'true';
        const ipHash = anonymizeIP(req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress);

        const stockData = await Promise.all(symbols.map(async (symbol) => {
          const symbolUpper = symbol.toUpperCase();
          const stockInfo = await fetchStockPrice(symbolUpper);
          
          let stockDoc = await Stock.findOne({ symbol: symbolUpper });
          if (!stockDoc) {
            stockDoc = new Stock({ symbol: symbolUpper, likes: [] });
          }

          if (likeBool && !stockDoc.likes.includes(ipHash)) {
            stockDoc.likes.push(ipHash);
            await stockDoc.save();
          }

          return {
            stock: symbolUpper,
            price: stockInfo.latestPrice,
            likes: stockDoc.likes.length
          };
        }));

        if (stockData.length === 2) {
          const rel_likes = stockData[0].likes - stockData[1].likes;
          stockData.forEach((stock, i) => {
            stock.rel_likes = i === 0 ? rel_likes : -rel_likes;
            delete stock.likes;
          });
        }

        res.json({ 
          stockData: stockData.length === 1 ? stockData[0] : stockData 
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Server error' });
      }
    });
};