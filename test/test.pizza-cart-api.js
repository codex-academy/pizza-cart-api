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


	// beforeEach(async () => {
	// 	await db.exec(`delete from pizza_cart_item`);
	// 	await db.exec(`delete from pizza_cart`);
	// });

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


	async function createCartApiCall() {
		const createResponse = await supertest(app)
			.get('/api/pizza-cart/create')
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

		assert.equal(0.00, cart.total);
		// assert.equal(0.00, );

		const largePizza = cart.pizzas.find( pizza => pizza.name == 'Garlic & Mushroom' );
		assert.equal('large', largePizza.size)
		// assert.equal('large', largePizza.size)



	});
	
	it('should be able to pay for a cart', () => {

	});


	it('should be able to show all the carts for a user', () => {

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
