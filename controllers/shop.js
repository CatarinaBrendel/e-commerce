const Product = require('../models/product');
//const Cart = require('../models/cart');

exports.getProducts = (request, response, next) => {
    Product.fetchAll()
        .then(products => {
            response.render("shop/product-list", {
                prods: products,
                pageTitle: "All Products",
                path: "/products"
            });
        })
        .catch(error => console.error(error)); 
};

exports.getProduct = (request, response, next) => {
    const productId = request.params.productId;
    Product.findById(productId)
        .then(product => {
            response.render("shop/product-detail", {
                pageTitle: product.title,
                path: "/products",
                product: product
            });
        })
        .catch(error => console.error(error));
};

exports.getIndex = (request, response, next) => {
    Product.fetchAll()
        .then(products => {
            response.render("shop/index", {
                prods: products,
                pageTitle: "Shop",
                path: "/"
            });
        })
        .catch(error => console.error(error)); 
};

exports.getCart = (request, response, next) => {
    request.user
        .getCart()
        .then(products => {
                response.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
                });
            })
        .catch(error => console.error(error));
    };

exports.postCart = (request, response, next) => {
    const productId = request.body.productId;
    Product.findById(productId)
        .then(product => {
            return request.user.addToCart(product);
        })
        .then(result => response.redirect('/cart'))
        .catch(error => console.error(error));
};

exports.postCartDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;
    request.user
      .deleteItemFromCart(productId)
      .then(result => {
        response.redirect('/cart');
      })
      .catch(error => console.error(error));
    
};   

exports.postOrder = (request, response, next) => {
    request.user.addOrder()
        .then(result => response.redirect('/orders'))
        .catch(error => console.error(error));

};

exports.getOrders = (request, response, next) => {
    request.user.getOrders()
        .then(orders => {
            response.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            })
        .catch(error => console.error(error));
    });
};

// exports.getCheckout = (request, response, next) => {
//     response.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout'
//     });
// };


