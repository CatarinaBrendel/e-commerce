const Product = require("../models/product");
exports.getAddProduct = (request, response, next) => {
  // response.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  response.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    productCSS: true,
    activeAddProduct: true
  });
};

exports.postAddProduct = (request, response, next) => {
  const title = request.body.title;
  const imageUrl = request.body.imageUrl;
  const price = request.body.price;
  const description = request.body.description;
  const product = new Product(title, imageUrl, price, description);
  product.save();
  response.redirect("/");
};

exports.getProducts = (request, response, next) => {
    Product.fetchAll(products => {
        response.render('admin/product', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    })
}
