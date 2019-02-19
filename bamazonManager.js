var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    user: "root",

    password: "Kodiak2129!",
    database: "Bamazon"
});

connection.connect();
askQuestions();

var checkOut = function () {
    inquirer.prompt([{
        name: "checkout",
        type: "list",
        message: "Would you like to contiune?".yellow,
        choices: ["Yes", "No"]
    }]).then(function (answer) {
        //console.log(answer.choices);
        if (answer.checkout === "Yes") {
            askQuestions();
        } else {
            connection.end();
        }
    });
}

function askQuestions() {
  inquirer.prompt([
    {
      message: "What would you like to do?".yellow,
      type: "list",
      name: "managerAction",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }
  ]).then(function (ans) {
    switch (ans.managerAction) {
      case "View Products for Sale":
        viewProducts()
        break;
      case "View Low Inventory":
        viewLowInventory()
        break;
      case "Add to Inventory":
        selectInventory()
        break;
      case "Add New Product":
        addProduct()
        break;
    }
  });
}

function viewProducts () {
  connection.query('SELECT * FROM products', function (error, res) {
    if (error) throw error;
    // console.log(res);
    res.forEach(row => {
      console.log(`Id: ${row.id} Name: ${row.product_name} Price: ${row.price} Quantity: ${row.stock_quantity}\n`)
    });
    checkOut();
  })
}

function viewLowInventory() {
  connection.query('SELECT * FROM products WHERE stock_quantity < 5', function (error, res) {
    if (error) throw error;
    console.log(res);
    res.forEach(row => {
        console.log(`Id: ${row.id} Name: ${row.product_name} Price: ${row.price} Quantity: ${row.stock_quantity}\n`)
      });
      checkOut();
  })
}

function selectInventory(prodId, prodQty) {
  connection.query('SELECT * FROM products', function (error, res) {
    if (error) throw error;
    // console.log(res);
    res.forEach(row => {
      console.log(`Id: ${row.id} Name: ${row.product_name} Price: ${row.price} Quantity: ${row.stock_quantity}\n`)
    });
    
    inquirer.prompt([
      {
        message: "Please type in the id of the product you would like to add inventory to: ".green,
        type: "input",
        name: "prodId"
      },
      {
        message: "Quantity you are adding to this item's stock?".green,
        type: "input",
        name: "prodQty"
      }
    ]).then(function (ans) {
      
      connection.query('SELECT * FROM products', function (error, resp) {
        if (error) throw error;
        var prod;
        for (var i = 0; i < resp.length; i++) {
          if (resp[i].id == ans.prodId) {
            prod = resp[i]
          }
        }
        //console.log(prod);
        console.log("You've have added: " + ans.prodQty + " to the inventory for: " + prod.product_name + "!");
        if (prod !== undefined) {
          addToInventory(prod, ans.prodId, parseInt(ans.prodQty))
          checkOut();
        } else {
          console.log("Sorry that item doesn't exist".red)
          checkOut();
        }
      })
    })
  })
};

function addToInventory(prodObj, prodId, prodQty) {
  var newQuantity = prodObj.stock_quantity + prodQty
  var query = "update products Set stock_quantity = ? where ?";
  connection.query(query, [newQuantity, { id: prodId }], function (error, res) {
  })
}
function addProduct(params) {
  inquirer.prompt([
    {
      message: "What is the name of this product?",
      type: "input",
      name: "prodName"
    },
    {
      message: "What department does this product belong to?",
      type: "input",
      name: "prodDept"
    },
    {
      message: "What is the price of this product?",
      type: "input",
      name: "prodPrice"
    },
    {
      message: "how much of this item do you have to add to stock?",
      type: "input",
      name: "prodQty"
    }
  ]).then(function (ans) {
    var query = "Insert Into products (product_name, department_name, price, stock_quantity) VAlUES (?, ?, ?, ?)";
    console.log(ans)
    if (ans.prodName !== '' && ans.prodDept !== '' && ans.prodPrice !== '' && ans.prodQty !== ''){
      connection.query(query, [ans.prodName, ans.prodDept, ans.prodPrice, ans.prodQty], function (error, res) {
      })
      checkOut();
    }else{
      console.log("ERROR: Product info is incomplete. Please fill all prompts with complete product info!")
      checkOut();
    }
  })
}