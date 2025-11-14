'use strict';

/**
 * payment-history service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::payment-history.payment-history');
