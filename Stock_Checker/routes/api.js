'use strict';

const express = require('express');
const router = express.Router();
const helmet = require('helmet');

module.exports = function (app) {

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

  app.route('/api/stock-prices')
    .get(function (req, res) {
      res.json({ message: 'API is running', env: process.env.NODE_ENV });
    });

};
