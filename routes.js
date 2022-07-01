const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 10 });

module.exports = function (app, db) {

	app.get('/api/pizza-cart/create', async (req, res) => {

		const cart_code = uid();
		await db.run(`insert into pizza_cart (cart_code, status) values (?, 'open')`, cart_code);

		res.json({
			cart_code
		});
	});

	app.get('/api/pizzas/', async (req, res) => {
		const pizzas = await db.all(`select * from pizza`);
		res.json({
			pizzas
		});
	});

	app.get('/api/pizzas/featured/', (req, res) => {
		res.json({
			cartId: uid()
		})
	});


	async function getCart(cart_code) {
		const cart = await db.get(`select * from pizza_cart where cart_code = ?`, cart_code);
		return cart;
	}

	async function getCartItem(cart_id, pizza_id) {
		const cartItem = await db.get(`select * from pizza_cart_item where pizza_cart_id = ? and pizza_id = ?`, cart_id, pizza_id);
		return cartItem;
	}

	async function getCartPizzas(cart_id) {
		const cartPizzas = await db.all(`select * from pizza_cart_item join pizza 
			on pizza_cart_item.pizza_id = pizza.id 
			where pizza_cart_id = ?`, cart_id);
		
		return cartPizzas;
	}

	async function addPizza(cart_id, pizza_id) {
		await db.run(`insert into pizza_cart_item (pizza_id, pizza_cart_id, qty) values (?, ?, 1)`, pizza_id, cart_id)
	}

	async function updatePizzaQty(cart_id, pizza_id, qty) {
		await db.run(`update pizza_cart_item set qty = qty + ? where pizza_cart_id = ? and pizza_id = ?`, qty, cart_id, pizza_id)
	
	}





	app.get('/api/pizza-cart/:cart_code/get', async (req, res) => {

		try {
			const { cart_code } = req.params;
			const cart = await getCart(cart_code);
			const pizzas = await getCartPizzas(cart.id);

			pizzas.forEach(pizza => pizza.total = pizza.qty * pizza.price )

			
			cart.pizzas = pizzas ? pizzas : [];
			cart.total = cart.pizzas.reduce( (total, pizza) => pizza.qty * pizza.price + total, 0  )
			
			res.json({
				...cart
			});
		} catch (err) {
			// console.log(err);
			res.json({
				status: 'error',
				error : err
			})
		}
	});

	app.post('/api/pizza-cart/pay', (req, res) => {
		res.json({
			cartId: uid()
		})
	});

	app.post('/api/pizza-cart/add', async (req, res) => {
		
		try {
			const { cart_code, pizza_id } = req.body;

			const cart = await getCart(cart_code);
			if (cart){
				const cartItem = await getCartItem(cart.id, pizza_id);
				if (!cartItem) {
					await addPizza(cart.id, pizza_id)
				} else {
					await updatePizzaQty(cart.id, pizza_id, 1);
				}
	
				res.json({
					status: 'success'
				})
 			} else {
				throw new Error('No cart found')
			}
		} catch (err) {
			console.log(err.stack);
			res.json({
				// cartId: uid()
				status: 'error',
				error : err
			})
		}
	});

	app.post('/api/pizza-cart/remove', async (req, res) => {
		try {
			const { cart_code, pizza_id } = req.body;

			const cart = await getCart(cart_code);
			if (cart){
				const cartItem = await getCartItem(cart.id, pizza_id);
				if (cartItem) {
					await updatePizzaQty(cart.id, pizza_id, -1);
					const cartItem = await getCartItem(cart.id, pizza_id);
					if (cartItem.qty == 0) {
						console.log({
							pizza_id,
						})
						const result = await db.run(`delete from pizza_cart_item where pizza_cart_id = ? and pizza_id = ?`, 
							cart.id, pizza_id);

						console.log(result);
					}
				}
	
				res.json({
					status: 'success'
				})
 			} else {
				throw new Error('No cart found')
			}
		} catch (err) {
			console.log(err.stack);
			res.json({
				// cartId: uid()
				status: 'error',
				error : err
			})
		}
	});
}