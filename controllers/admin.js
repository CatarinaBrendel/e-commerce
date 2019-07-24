const { validationResult } = require('express-validator');

const Product = require('../models/product');
const fileHelper = require('../util/file');

exports.getAddProduct = (request, response, next) => {
  response.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (request, response, next) => {
  const title = request.body.title;
  // const imageUrl = request.body.imageUrl;
  const image = request.file;
  const price = request.body.price;
  const description = request.body.description;

  if(!image) {
    return response.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        image: image,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not a valid image',
      validationErrors: [errors.array()]
    });
  }

  const errors = validationResult(request);

  if(!errors.isEmpty()) {
    return response.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        image: image,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    }); 
  }

  const imageUrl = image.path;

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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      }); 
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })

};

exports.postEditProduct = (request, response, next) => {
  const productId = request.body.productId;
  const updatedTitle = request.body.title;
  // const updatedImageUrl = request.body.imageUrl;
  const updatedImage = request.file;
  const updatedPrice = request.body.price;
  const updatedDescription = request.body.description;
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: productId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(productId)
  .then(product => {
    if(product.userId.toString() !== request.user.id) {
      return response.redirect('/');
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDescription;
    if(image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    return product.save()
      .then(() => {
        console.log('Successfully updated Product!');
        response.redirect('/admin/products');
      });
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.getProducts = (request, response, next) => {
  Product.find({userId: request.user._id})
  // .select('title price -_id') 
  // .populate('userId', 'name') -> info selected by Mongosse when retrieving the data
    .then(products => {
      response.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postDeleteProduct = (request, response, next) => {
  const productId = request.body.productId;
  Product.findById(productId)
    .then(product => {
      if(!product) {
        return next(new Error('Product not found in Database'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: productId, userId: request.user._id })
    })
    .then(() => {
      console.log('Product removed from database!')
      response.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};