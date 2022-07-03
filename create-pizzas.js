
const openSQLite = require('./openSQLite')
const fs = require('fs');
const pizzaText = fs.readFileSync('./pizzas.txt', 'utf-8');

const rows = pizzaText.split("\n");
const rowsWithFields = rows.map(row => row.split("|"));

const pizzas = rowsWithFields.map(row => {
	let i = 0;
	return {
		size : row[i++], 
		type : row[i++], 
		flavour : row[i++], 
		price : row[i++]
	}
});

// console.log(pizzas);

async function loadPizzas(db) {
	try {
		const insertPizzaSQL = `insert into pizza (size, type, flavour, price, featured) values (?, ?, ?, ?, 0)`;

		const pizzasCreated = pizzas.map(pizza => db.run(insertPizzaSQL, 
			pizza.size, pizza.type, pizza.flavour, pizza.price));

		await Promise.all(pizzasCreated)
		console.log(`${pizzasCreated.length} pizzas created.`)

	} catch (err) {
		console.log(err.stack);
	}
}

module.exports = loadPizzas;

// openSQLite('./pizza-cart.db')
// 	.then(async db => 
// 		await db.migrate();
// 		await loadPizzas(db);
// 		// console.log(pizzas.length);
// 	});
