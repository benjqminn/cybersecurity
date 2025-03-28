const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

    test('Viewing one stock.', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'AMZN' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('stockData');
                expect(res.body.stockData).to.have.property('stock', 'AMZN');
                expect(res.body.stockData).to.have.property('price');
                expect(res.body.stockData).to.have.property('likes');
                done();
            });
    });

    test('Viewing one stock, then liking it.', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'AAPL', like: 'true' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('stockData');
                expect(res.body.stockData).to.have.property('stock', 'AAPL');
                expect(res.body.stockData).to.have.property('likes').that.is.a('number');
                done();
            });
    });

    test('Viewing the same stock and liking it again.', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'AAPL', like: 'true' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('stockData');
                expect(res.body.stockData).to.have.property('stock', 'AAPL');
                expect(res.body.stockData).to.have.property('likes').that.is.a('number');

                const initialLikes = res.body.stockData.likes;

                chai.request(server)
                    .get('/api/stock-prices')
                    .query({ stock: 'AAPL', like: 'true' })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('stockData');
                        expect(res.body.stockData).to.have.property('stock', 'AAPL');
                        expect(res.body.stockData).to.have.property('likes').that.equals(initialLikes);
                        done();
                    });
            });
    });

    test('Viewing two stocks.', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['AMZN', 'AAPL'] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('stockData').that.is.an('array');
                expect(res.body.stockData).to.have.length(2);

                res.body.stockData.forEach(stock => {
                    expect(stock).to.have.property('stock');
                    expect(stock).to.have.property('price');
                    expect(stock).to.have.property('rel_likes');
                });

                done();
            });
    });

    test('Viewing two stocks and liking them both.', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['AMZN', 'AAPL'], like: 'true' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('stockData').that.is.an('array');
                expect(res.body.stockData).to.have.length(2);

                res.body.stockData.forEach(stock => {
                    expect(stock).to.have.property('stock');
                    expect(stock).to.have.property('price');
                    expect(stock).to.have.property('rel_likes').that.is.a('number');
                });

                done();
            });
    });

});
