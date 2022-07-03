const supertest = require('supertest');
const express = require('express');
const assert = require('assert');
const routes = require('../routes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const openSQLite = require('../openSQLite');


describe('The Pizza Cart API', async () => {

	const db = await openSQLite('../pizza-cart.db')
	routes(app, db);


	beforeEach(async () => {
		await db.exec(`delete from pizza_cart_item`);
		await db.exec(`delete from pizza_cart`);
	});

	it('should be able to return a list of pizzas', async () => {

		const response = await supertest(app)
			.get('/api/pizzas')
			.expect(200);

		assert.equal(27, response.body.pizzas.length);

	});

	it('should be able to create a new cart', async () => {

		const createResponse = await supertest(app)
			.get('/api/pizza-cart/create')
			.expect(200);

		const { cart_code } = createResponse.body;

		const getResponse = await supertest(app)
			.get(`/api/pizza-cart/${cart_code}/get`)
			.expect(200);

		assert.equal(cart_code, getResponse.body.cart_code);
		assert.equal('open', getResponse.body.status);

	});


	async function createCartApiCall(username = '') {
		const createResponse = await supertest(app)
			.get(`/api/pizza-cart/create?username=${username}`)
			.expect(200);

		const { cart_code } = createResponse.body;
		return cart_code;

	}

	it('should be able to add pizzas to a cart', async () => {

		const { smallReginaPizza, largeGarlicMushroomPizza, mediumTikkaChickenPizza } = await createThreePizzas(db);
		const cart_code = await createCartApiCall();
		const pizzaList = [smallReginaPizza, smallReginaPizza, mediumTikkaChickenPizza, largeGarlicMushroomPizza];
		for (const pizza of pizzaList) {
			await addPizzaApiCall({ 
				cart_code,
				pizza_id : pizza.id
			});
		}

		const cart = await getCartApiCall(cart_code);

		assert.equal(3, cart.pizzas.length);

		const pizzaCount = cart.pizzas.reduce((totalQty, pizza) => pizza.qty + totalQty, 0);
		assert.equal(4, pizzaCount);

	});

	it('should be able to remove a pizza from a cart', async () => {

		const { smallReginaPizza, largeGarlicMushroomPizza, mediumTikkaChickenPizza } = await createThreePizzas(db);
		const cart_code = await createCartApiCall();
		const pizzaList = [smallReginaPizza, smallReginaPizza, mediumTikkaChickenPizza, largeGarlicMushroomPizza];
		for (const pizza of pizzaList) {
			await addPizzaApiCall({ 
				cart_code,
				pizza_id : pizza.id
			});
		}

		const cart = await getCartApiCall(cart_code);
		assert.equal(3, cart.pizzas.length);

		const pizzaCount = cart.pizzas.reduce((totalQty, pizza) => pizza.qty + totalQty, 0);
		assert.equal(4, pizzaCount);

		await supertest(app)
			.post('/api/pizza-cart/remove')
			.send({
				cart_code,
				pizza_id: smallReginaPizza.id
			})
		 	.expect(200);
		
		await supertest(app)
			.post('/api/pizza-cart/remove')
			.send({
				 cart_code,
				 pizza_id: smallReginaPizza.id
			})
			.expect(200);


		const _cart = await getCartApiCall(cart_code);
		assert.equal(2, _cart.pizzas.length);

		const _pizzaCount = _cart.pizzas.reduce((totalQty, pizza) => pizza.qty + totalQty, 0);
		assert.equal(2, _pizzaCount);

	});

	it('should be able to return a cart with all it\'s pizzas', async () => {

		const { smallReginaPizza, largeGarlicMushroomPizza, mediumTikkaChickenPizza } = await createThreePizzas(db);
		const cart_code = await createCartApiCall();
		const pizzaList = [smallReginaPizza, smallReginaPizza, mediumTikkaChickenPizza, largeGarlicMushroomPizza];
		for (const pizza of pizzaList) {
			await addPizzaApiCall({ 
				cart_code,
				pizza_id : pizza.id
			});
		}

		const cart = await getCartApiCall(cart_code);
		assert.equal(3, cart.pizzas.length);
		assert.equal(289.96, cart.total);

		const largePizza = cart.pizzas.find( pizza => pizza.flavour == 'Garlic & Mushroom' );
		assert.equal('large', largePizza.size)
		assert.equal(87.99, largePizza.total)

		const smallPizza = cart.pizzas.find( pizza => pizza.flavour == 'Regina' );
		assert.equal('small', smallPizza.size)
		assert.equal(113.98, smallPizza.total)

	});
	
	it('should be able to pay for a cart if the right amount is offered', async () => {

		const { smallReginaPizza, largeGarlicMushroomPizza, mediumTikkaChickenPizza } = await createThreePizzas(db);
		const cart_code = await createCartApiCall();
		const pizzaList = [smallReginaPizza, smallReginaPizza, mediumTikkaChickenPizza, largeGarlicMushroomPizza];
		for (const pizza of pizzaList) {
			await addPizzaApiCall({ 
				cart_code,
				pizza_id : pizza.id
			});
		}

		const result = await supertest(app)
			.post('/api/pizza-cart/pay')
			.send({
				cart_code,
				amount: 300 
			})
			.expect(200);

		const response = result.body;

		assert.equal('Cart payment successfull!', response.message);
		assert.equal('success', response.status);

		const getResponse = await supertest(app)
			.get(`/api/pizza-cart/${cart_code}/get`)
			.expect(200);

		assert.equal(cart_code, getResponse.body.cart_code);
		assert.equal('paid', getResponse.body.status);
		
	});

	it('should not be able to pay for a cart if the wrong amount is offered', async () => {

		const { smallReginaPizza, largeGarlicMushroomPizza, mediumTikkaChickenPizza } = await createThreePizzas(db);
		const cart_code = await createCartApiCall();
		const pizzaList = [smallReginaPizza, smallReginaPizza, mediumTikkaChickenPizza, largeGarlicMushroomPizza];
		for (const pizza of pizzaList) {
			await addPizzaApiCall({ 
				cart_code,
				pizza_id : pizza.id
			});
		}

		const result = await supertest(app)
			.post('/api/pizza-cart/pay')
			.send({
				cart_code,
				amount: 280 
			})
			.expect(200);

		const response = result.body;

		assert.equal('failure', response.status);
		assert.equal('Cart payment failed!', response.message);

	});

	it('should be able to show all the carts for a user', async () => {

		const { smallReginaPizza, largeGarlicMushroomPizza, mediumTikkaChickenPizza } = await createThreePizzas(db);
		
		const pizzaList = [smallReginaPizza, smallReginaPizza, mediumTikkaChickenPizza, largeGarlicMushroomPizza];

		const cart_code1 = await createCartApiCall('lindani');
		for (const pizza of pizzaList) {
			await addPizzaApiCall({ 
				cart_code: cart_code1,
				pizza_id : pizza.id
			});
		}

		const cart_code2 = await createCartApiCall('lindani');
		for (const pizza of pizzaList) {
			await addPizzaApiCall({ 
				cart_code: cart_code2,
				pizza_id : pizza.id
			});
		}

		const result = await supertest(app)
			.get('/api/pizza-cart/username/lindani')
			.expect(200);

		assert.equal(2, result.body.length);
		
	});


	// it('should be able to show all the active special vouchers', () => {

	// });

	// it('should be able to apply an active special voucher to cart', () => {

	// });


});

async function addPizzaApiCall(data){
	return await supertest(app)
		.post('/api/pizza-cart/add')
		.send(data)
		 .expect(200);
}

async function getCartApiCall(cart_code) {
	const cartResponse = await supertest(app)
		.get(`/api/pizza-cart/${cart_code}/get`)
		.expect(200);

	const cart = cartResponse.body;
	return cart;
}

async function createThreePizzas(db) {
	const findPizzaBySQL = `select * from pizza where size = ? and flavour = ?`;
	const smallReginaPizza = await db.get(findPizzaBySQL, 'small', 'Regina');
	const mediumTikkaChickenPizza = await db.get(findPizzaBySQL, 'medium', 'Tikka Chicken');
	const largeGarlicMushroomPizza = await db.get(findPizzaBySQL, 'large', 'Garlic & Mushroom');
	return { smallReginaPizza, largeGarlicMushroomPizza, mediumTikkaChickenPizza };
}
