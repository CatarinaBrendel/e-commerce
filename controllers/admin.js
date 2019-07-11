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
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: request.user //in mongoose we don't need to specify the _id, as mongoose itself deals with it!
  });

  product.save() //save method provided by Mongoose
    .then( result => {
    console.log('Successfuly added Product');
    response.redirect('/admin/products');
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
  Product.findById(productId)
    .then(product => {
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

  Product.findById(productId)
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
  Product.find()
  // .select('title price -_id') 
  // .populate('userId', 'name') -> info selected by Mongosse when retrieving the data
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
  Product.findByIdAndRemove(productId)
    .then(() => {console.log('Product removed from database!')
      response.redirect("/admin/products");
    })
    .catch(error => console.log(error));
};