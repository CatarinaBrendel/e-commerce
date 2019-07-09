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
  request.user
    .createProduct({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: request.user.id
  })
    .then( result => {
    //console.log(result);
    console.log('Successfuly added Product');
    response.redirect('/products');
  })
    .catch(error => {
      console.error(error);
    });
};

exports.getEditProduct = (request, response, next) => {
  const editMode = request.query.edit;
  if(!editMode === 'true'){
    return response.redirect('/');
  }

  const productId = request.params.productId;
  request.user.
    getProducts({where: {id: productId}})
    //Product.findByPk(productId)
    .then(products => {
      const product = products[0];
      if(!product){
        return response.redirect('/');
      }
      response.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      }); 
    })
    .catch(error => console.log(error));

};

exports.postEditProduct = (request, response, next) => {
  const productId = request.body.productId;
  const updatedTitle = request.body.title;
  const updatedImageUrl = request.body.imageUrl;
  const updatedPrice = request.body.price;
  const updatedDescription = request.body.description;
  Product.findByPk(productId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then(() => {
      console.log('Successfully updated Product!');
      response.redirect('/admin/products');
    })
    .catch(error => console.log(error));
};

exports.getProducts = (request, response, next) => {
  request.user
    .getProducts()
    .then(products => {
      response.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products'
      });
    })
    .catch(error => console.log(error));
};

exports.postDeleteProduct = (request, response, next) => {
  const productId = request.body.productId;
  Product.findByPk(productId)
    .then(product => {
      return product.destroy();
    })
    .then(() => {
      console.log('Successfully deleted the Product!')
      response.redirect('/admin/products');
    })
    .catch(error => console.log(error));
  
};