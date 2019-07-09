const Cart = require('./cart');
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Product = sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Product;

// module.exports = class Product {
//     constructor(id, title, imageUrl, price, description){
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description = description;
//     }

//     save(){
//       database.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)', [this.title, this.price, this.imageUrl, this.description]);
//     };

//     static deleteById(id){
      
//     };

//     static fetchAll(){
//       return database.execute('SELECT * FROM products');
//     }

//     static findById(id){
//       return database.execute('SELECT * FROM products WHERE products.id = ?', [id]);
//     }
// }