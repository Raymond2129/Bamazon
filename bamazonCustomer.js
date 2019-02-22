// Required Dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');
var Table = require('cli-table');


// Connection script
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Username
    user: "root",

    // Credentials
    password: "Kodiak2129!",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(colors.yellow.bold("Welcome to the Bamazon Store database! You are logged in as id " + connection.threadId));
    //connection.end();

    run();      //Call main function

});                 // End Connection Script

var checkOut = function () {
    inquirer.prompt([{
        name: "checkout",
        type: "list",
        message: "Would you like to contiune to shop?".yellow,
        choices: ["Yes", "No"]
    }]).then(function (answer) {
        //console.log(answer.choices);
        if (answer.checkout === "Yes") {
            run();
        } else {
            connection.end();
        }
    });
}

// BEGIN Display Inventory
function run() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;

        // Cli-Table display code with Color
        var table = new Table(
            {
                head: ["Product ID".blue.bold, "Product Name".blue.bold, "Department Name".blue.bold, "Price".blue.bold, "Quantity".blue.bold],
                colWidths: [12, 50, 20, 12, 12],
            });

        // Set/Style table headings and Loop through entire inventory
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].id, res[i].product_name, res[i].department_name, parseFloat(res[i].price).toFixed(2), res[i].stock_quantity]
            );
        }

        console.log(table.toString());
        // End Display Inventory

        // Prompt Customers Input
        inquirer.prompt([
            {
                type: "number",
                message: "Please enter the Product ID of the item that you would like to buy?".yellow,
                name: "id"
            },
            {
                type: "number",
                message: "How many would you like to buy?".yellow,
                name: "quantity"
            },
        ])

            // Ordering function
            .then(function (cart) {

                var quantity = cart.quantity;
                var itemID = cart.id;

                connection.query('SELECT * FROM products WHERE id=' + itemID, function (err, selectedItem) {
                    if (err) throw err;

                    // Varify item quantity desired is in inventory
                    if (selectedItem[0].stock_quantity - quantity >= 0) {

                        console.log("INVENTORY UPDATE: Total Stock: ".green + selectedItem[0].stock_quantity + " Order Quantity: ".green + quantity);

                        console.log("Congratulations! We have that in stock: ".green + selectedItem[0].product_name.underline.yellow + " to fill your order!".green);

                
                        // Calculate total sale, and fix 2 decimal places
                        console.log("Thank You for your purchase. Your order total will be ".green + (cart.quantity * selectedItem[0].price).toFixed(2).underline.yellow + " dollars.".green, "\nThank you for shopping with us!".underline.blue);

                        // Query to remove the purchased item from inventory.                       
                        connection.query('UPDATE products SET stock_quantity=? WHERE id=?', [selectedItem[0].stock_quantity - quantity, itemID],

                            function (err, inventory) {
                                if (err) throw err;

                                checkOut();
                                //run();  // Runs the prompt again, so the customer can continue shopping.
                            });  // Ends the code to remove item from inventory.

                    }
                    // Low inventory warning
                    else {
                        console.log("INSUFFICIENT INVENTORY ALERT: \nBamazon only has ".red + selectedItem[0].stock_quantity + " " + selectedItem[0].product_name.underline.yellow + " in stock at this moment. \nPlease make another selection or reduce your quantity.".red, "\nThank you for shopping at Bamazon!".blue);
                        
                        checkOut();
                        // run();  // Runs the prompt again, so the customer can continue shopping.
                    }
                });
            });
    });
}   // Closes bamazon function