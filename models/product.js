const fs = require('fs');
const path = require('path');

const Cart = require('./cart')

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);

const getProductsFromFile = callback => {
    fs.readFile(p, (error, fileContent) => {
      if (error) {
        return callback([]);
      } else {
        callback(JSON.parse(fileContent));  
      }
    });
};

module.exports = class Product {
    constructor(id, title, imageUrl, price, description){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    save(){
      getProductsFromFile(products => {
          if(this.id) {
            const existingProductIndex = products.findIndex(prod => prod.id === this.id);
            const updatedProducts = [...products];
            updatedProducts[existingProductIndex] = this;
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
            console.error(err)
            });
          } else {
            this.id = Math.random().toString();
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
            console.error(err);
          });
        }
      })
    };

    static deleteById(id){
      getProductsFromFile(products => {
        const product = products.find(prod => prod.id === id);
        const updatedProducts = products.filter(prod => prod.id !== id);
        fs.writeFile(p, JSON.stringify(updatedProducts), error => {
          if (!error){
            Cart.deleteProduct(id, product.price);
          }
        });
      });
    };

    static fetchAll(callback){
        getProductsFromFile(callback)
    }

    static findById(id, callback){
      getProductsFromFile(products => {
        const product = products.find(p => p.id === id);
        callback(product);
      });
    }
}