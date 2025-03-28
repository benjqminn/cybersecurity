const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Viewing one stock: GET request to /api/stock-prices/', function() {
    chai
      .request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: 'AAPL' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
      })
  
  });

  test('Viewing one stock and liking it: GET request to /api/stock-prices/', function() {
    chai
      .request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: 'AAPL', like: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.likes, 1);
      })
     
  });

  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function() {
    chai
      .request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: 'AAPL', like: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.likes, 1);
      })

  });

  test('Viewing two stocks: GET request to /api/stock-prices/', function() {
    chai
      .request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: ['AAPL', 'MSGT'] })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
      })
      
  });

  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function() {
    chai
      .request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: ['AAPL', 'MSGT'], like: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.equal(res.body.stockData[0].likes, 1);
        assert.equal(res.body.stockData[1].likes, 1);
      })
     
  });
});
