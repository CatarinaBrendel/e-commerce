const fs = require('fs');
const path = require('path');

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
    constructor(title, imageUrl, price, description){
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    save(){
      this.id = Math.random().toString();
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
              console.error(err);
            });
        });
    }

    static fetchAll(callback){
        getProductsFromFile(callback)
    }
}