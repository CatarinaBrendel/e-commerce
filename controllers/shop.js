const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (request, response, next) => {
    Product.find()
        .then(products => {
            response.render('shop/product-list', {
              prods: products,
              pageTitle: 'All Products',
              path: '/products'
            });
        })
        .catch(error => next(error)); 
};

exports.getProduct = (request, response, next) => {
    const productId = request.params.productId;
    Product.findById(productId)
        .then(product => {
            response.render('shop/product-detail', {
              pageTitle: product.title,
              path: '/products',
              product: product
            });
        })
        .catch(error => next(error));
};

exports.getIndex = (request, response, next) => {
    Product.find()
        .then(products => {
            response.render('shop/index', {
              prods: products,
              pageTitle: 'Shop',
              path: '/'
            });
        })
        .catch(error => next(error)); 
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
              products: products
            });
        })
        .catch(error => next(error));
    };

exports.postCart = (request, response, next) => {
    const productId = request.body.productId;
    Product.findById(productId)
        .then(product => {
            return request.user.addToCart(product);
        })
        .then(result => response.redirect('/cart'))
        .catch(error => next(error));
};

exports.postCartDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;
    request.user
      .removeFromCart(productId)
      .then(result => {
        response.redirect('/cart');
      })
      .catch(error => next(error));
    
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
                email: request.user.email,
                userId: request.user
              },
              products: products
            });
            return order.save();
        })
        .then(result => request.user.clearCart())
        .then(result => response.redirect('/orders'))
        .catch(error => next(error));
};

exports.getOrders = (request, response, next) => {
  Order.find({ 'user.userId': request.user._id })
    .then(orders => {
      response.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })

    .catch(error => next(error));
};

exports.getInvoice = (request, response, next) => {
  const orderId = request.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if(!order) {
        return next(new Error('no order found.'))
      }
      if(order.user._id === request.user._id) {
        return next(new Error('Unauthorized action'))
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName)
      
      const pdfDoc = new PDFDocument();

      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(response);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });

      pdfDoc.fontSize(16).text('-------------------------')
      let totalPrice = 0;
      order.products.forEach(product => {
        totalPrice += product.quantity * product.product.price;
          pdfDoc
          .fontSize(14)
            .text(product.product.title + ' - ' + product.quantity + 'x ' + '€' + product.product.price)
      });
      pdfDoc.text('-----------------------------')
      pdfDoc.fontSize(16).text('Total Price: €' + totalPrice);
      pdfDoc.end();

      // fs.readFile(invoicePath, (error, data) => {
      //   if(error) {
      //     return next(error);
      //   }

        //recommended method for big files
        // const file = fs.createReadStream(invoicePath);
        // response.setHeader('Content-Type', 'application/pdf');
        // response.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        // file.pipe(response);
      // });
    })
    .catch(error => next(error));
};