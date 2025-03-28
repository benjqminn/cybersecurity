const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Stock Price Checker', function() {
  describe('GET /api/stock-prices', function() {
    it('Viewing one stock', function(done) {
      chai.request(app)
        .get('/api/stock-prices?stock=GOOG')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('stockData');
          expect(res.body.stockData).to.have.property('stock', 'GOOG');
          expect(res.body.stockData).to.have.property('price').that.is.a('number');
          expect(res.body.stockData).to.have.property('likes').that.is.a('number');
          done();
        });
    });

    it('Viewing one stock and liking it', function(done) {
      chai.request(app)
        .get('/api/stock-prices?stock=MSFT&like=true')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.stockData).to.have.property('stock', 'MSFT');
          expect(res.body.stockData.likes).to.be.at.least(1);
          done();
        });
    });

    it('Viewing the same stock and liking it again', function(done) {
      chai.request(app)
        .get('/api/stock-prices?stock=MSFT&like=true')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.stockData.likes).to.be.at.least(1);
          done();
        });
    });

    it('Viewing two stocks', function(done) {
      chai.request(app)
        .get('/api/stock-prices?stock=GOOG&stock=MSFT')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.stockData).to.be.an('array').with.lengthOf(2);
          expect(res.body.stockData[0]).to.have.property('rel_likes').that.is.a('number');
          expect(res.body.stockData[1]).to.have.property('rel_likes').that.is.a('number');
          done();
        });
    });

    it('Viewing two stocks and liking them', function(done) {
      chai.request(app)
        .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes).to.equal(0);
          done();
        });
    });
  });
});