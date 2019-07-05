const Product = require('../models/product');
const Cart = require('../models/cart');

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

exports.getProduct = (request, response, next) => {
    const productId = request.params.productId;
    Product.findById(productId, product => {
        response.render('shop/product-detail', {
            pageTitle: product.title, 
            path: '/products', 
            product: product
        });
    });
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
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id)
                if(cartProductData){
                    cartProducts.push({
                        productData: product, 
                        quantity: cartProductData.quantity});
                }
            }
            response.render("shop/cart", {
              path: "/cart",
              pageTitle: "Your Cart",
              products: cartProducts
            });
        })

    })
    
};

exports.postCart = (request, response, next) => {
    const productId = request.body.productId;
    Product.findById(productId, (product) => {
    Cart.addProduct(productId, product.price);
    });
    response.redirect('/cart');
};

exports.postCartDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;
    Product.findById(productId, product => {
        Cart.deleteProduct(productId, product.price);
        response.redirect('/cart');
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


