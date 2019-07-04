const Product = require('../models/product');
const path = require('path');

exports.getProducts = (request, response, next) => {
    Product.fetchAll(products => {
        response.render("shop/product-list", {
          prods: products,
          pageTitle: "All Products",
          path: "/",
          hasProducts: products.length > 0,
          activeShop: true,
          productCSS: true
        });
    });  
};

exports.getProduct = (request, response, nect) => {
    const productId = request.params.productId;
    console.log(productId);
    response.redirect('/');
};

exports.getIndex = (request, response, next) => {
    Product.fetchAll(products => {
      response.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true
      });
    });  
};

exports.getCart = (request, response, next) => {
    response.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart'
    });
};

exports.getOrders = (request, response, next) => {
    response.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders'
    });
};

exports.getCheckout = (request, response, next) => {
    response.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};

