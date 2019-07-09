const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (request, response, next) => {
    Product.findAll()
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
    Product.findByPk(productId)
    .then(product => {
        response.render('shop/product-detail', {
        pageTitle: product.title, 
        path: '/products', 
        product: product
        });
    })
    .catch(error => console.error(error));
};

exports.getIndex = (request, response, next) => {
    Product.findAll()
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
        .then(cart => {
            return cart.getProducts()
                .then(products => {
                    response.render('shop/cart', {
                    path: '/cart',
                    pageTitle: 'Your Cart',
                    products: products
                    });
                })
                .catch(error => console.error(error));
        })
        .catch(error => console.error(error));
};

exports.postCart = (request, response, next) => {
    const productId = request.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    request.user
      .getCart()
      .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({ where: { id: productId } });
      })
      .then(products => {
        let product;
        if (products.length > 0) {
          product = products[0];
        }
        if (product) {
          const oldQuantity = product.cartItem.quantity;
          newQuantity = oldQuantity + 1;
          return fetchedCart.addProduct(product, {
            through: { quantity: newQuantity }
          });
        }
        return Product.findByPk(productId)
      })
      .then(product => {
        return fetchedCart.addProduct(product, {
          through: { quantity: newQuantity }
        });
      })
      .then(() => {
        response.redirect("/cart");
      })
      .catch(error => console.error(error));
};

exports.postCartDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;
    request.user.getCart()
        .then(cart => {
            return cart.getProducts({where: {id: productId}})
        })
        .then(products => {
            const product = products[0];
            product.cartItem.destroy();
        })
        .then(result => {
            response.redirect('/cart');
        })
        .catch(error => console.error(error));
    
};   

exports.postOrder = (request, response, next) => {
    let fetchedCart;
    request.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return request.user.createOrder()
            .then(order => {
                order.addProducts(products.map(product => {
                    product.orderItem = {quantity: product.cartItem.quantity};
                    return product;
                }));
            })
            .catch(error => console.error(error));
        })
        .then(result => {
            return fetchedCart.setProducts(null)})
        .then(result => response.redirect('/orders'))
        .catch(error => console.error(error));

};

exports.getOrders = (request, response, next) => {
    request.user.getOrders({include: ['products']})
        .then(orders => {
            response.render("shop/orders", {
                path: "/orders",
                pageTitle: "Your Orders",
                orders: orders
            })
        .catch(error => console.error(error));
    });
};

exports.getCheckout = (request, response, next) => {
    response.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};


