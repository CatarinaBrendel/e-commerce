const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (request, response, next) => {
    Product.find()
        .then(products => {
            response.render('shop/product-list', {
              prods: products,
              pageTitle: 'All Products',
              path: '/products',
              isAuthenticated: request.session.isLoggedIn
            });
        })
        .catch(error => console.error(error)); 
};

exports.getProduct = (request, response, next) => {
    const productId = request.params.productId;
    Product.findById(productId)
        .then(product => {
            response.render('shop/product-detail', {
              pageTitle: product.title,
              path: '/products',
              product: product,
              isAuthenticated: request.session.isLoggedIn
            });
        })
        .catch(error => console.error(error));
};

exports.getIndex = (request, response, next) => {
    Product.find()
        .then(products => {
            response.render('shop/index', {
              prods: products,
              pageTitle: 'Shop',
              path: '/',
              isAuthenticated: request.session.isLoggedIn
            });
        })
        .catch(error => console.error(error)); 
};

exports.getCart = (request, response, next) => {
    request.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            response.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: products,
              isAuthenticated: request.session.isLoggedIn
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
      .removeFromCart(productId)
      .then(result => {
        response.redirect('/cart');
      })
      .catch(error => console.error(error));
    
};   

exports.postOrder = (request, response, next) => {
    request.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return {
                    quantity: i.quantity, 
                    product: {
                        ...i.productId._doc}}
            });
            const order = new Order({
              user: {
                name: request.user.name,
                userId: request.user
              },
              products: products
            });
            return order.save();
        })
        .then(result => request.user.clearCart())
        .then(result => response.redirect('/orders'))
        .catch(error => console.error(error));
};

exports.getOrders = (request, response, next) => {
  Order.find({ 'user.userId': request.user._id })
    .then(orders => {
      response.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: request.session.isLoggedIn
      });
    })

    .catch(error => console.error(error));
};