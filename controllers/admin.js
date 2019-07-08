const Product = require("../models/product");

exports.getAddProduct = (request, response, next) => {
  response.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (request, response, next) => {
  const title = request.body.title;
  const imageUrl = request.body.imageUrl;
  const price = request.body.price;
  const description = request.body.description;
  const product = new Product(null, title, imageUrl, price, description);
  product
    .save()
    .then(response.redirect('/'))
    .catch(error => console.error(error));
};

exports.getEditProduct = (request, response, next) => {
  const editMode = request.query.edit;
  if(!editMode === 'true'){
    return response.redirect('/');
  }

  const productId = request.params.productId;
  Product.findById(productId, product => {
    if(!product){
      return response.redirect('/');
    }
    response.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    }); 
  });
};

exports.postEditProduct = (request, response, next) => {
  const productId = request.body.productId;
  const updatedTitle = request.body.title;
  const updatedImageUrl = request.body.imageUrl;
  const updtedPrice = request.body.price;
  const updatedDescription = request.body.description;
  const updatedProduct = new Product(
    productId, 
    updatedTitle, 
    updatedImageUrl, 
    updtedPrice, 
    updatedDescription
    );
    updatedProduct.save();
    response.redirect('/admin/products');
};

exports.getProducts = (request, response, next) => {
  Product.fetchAll(products => {
      response.render('admin/product', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products'
      });
  })
};

exports.postDeleteProduct = (request, response, next) => {
  const productId = request.body.productId;
  Product.deleteById(productId);
  response.redirect('/admin/products');
};