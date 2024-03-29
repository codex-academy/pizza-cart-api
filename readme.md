# The pizza cart API

URL		 | HTTP VERB  | Description
---------|------------|------
`/api/pizzas`		| `GET` | Get a list of pizzas
`/api/pizza-cart/create` | `GET` | Create a pizza cart
`/api/pizza-cart/:cart_code/get`| `GET` | Get a specific pizza cart
`/api/pizza-cart/add`		| `POST` | Add a pizza to a pizza cart
`/api/pizza-cart/remove`	| `POST` | Remove a pizza to a pizza cart
`/api/pizza-cart/pay`		| `POST` | Pay for a given pizza cart
`/api/pizza-cart/username/:username`		| `GET` | Get a list of pizza carts for a given user
`/api/pizza-cart/username/:username/active`	| `GET` | Get a users active cart
`/api/pizzas/featured?username=your_name` | `GET` | Get a list of featured pizzas for a given user
`/api/pizzas/featured` | `POST` | Set a given pizza id to be featured - max 3 ids


## Get all the pizzas

To get a list of all the pizzas available use this `GET` http call:

```
https://pizza-api.projectcodex.net/api/pizzas
```

## Create a pizza cart

To buy pizzas you will need to create a pizza cart first using an `GET` HTTP request to the `/api/pizza-cart/create` URL
this will return an `cart_code` that you need to use for any feature request to the API - to add or remove pizza's to the cart.
When you pay you will need to specify which `cart_code` to use.

To link a pizza to a given username add a `username` parameter to the API call.

```
https://pizza-api.projectcodex.net/api/pizza-cart/create?username=Lindani
```

The above call will create a new pizza cart and link it to `Lindani`.

To see all the Pizza carts for a given username use this API call: `/api/pizza-cart/username/:username`

To see all the carts for Lindani use this API call:

```
https://pizza-api.projectcodex.net/api/pizzas/username/Lindani
```

## Add or remove Pizza to a Cart

To add or remove pizzas to a cart using the `/api/pizza-cart/add` or `/api/pizza-cart/remove` API end points.

`https://pizza-api.projectcodex.net/api/pizzas/api/pizza-cart/add`

With parameters like this: 

```json
{
	"cart_code" : "df4rty56",
	"pizza_id" : 23

}
```

The same goes for removing a pizza from the cart: `http://pizza-api.projectcodex.net/api/pizza-cart/remove`

## See a cart's contents

To see a cart and all it's contents use the `/api/pizza-cart/:cart_code/get` call.

## Pay for a cart

To pay for a cart you can use this call: `/api/pizza-cart/pay`

You need to specify the `cart_code` you are paying for and the amount you are paying. The amount you are paying for need to be more than the total amount due in the cart. If the payment is successfull the cart status will be changed to `paid`.

```json
{
	"cart_code" : "df4rty56",
	"amount" : 200

}
```

## Featured Pizzas

3 Featured pizzas can be set for for a username.

Use the POST call - `/api/pizzas/featured` to set featured pizzas for a given username

```json
{
	"username" : "username_here",
	"pizza_id" : 7
}
```

A max of 3 pizzas can be featured. The last featured pizza added will remove the oldest featured pizza.

Use the `/api/pizzas/featured?username=username_here` GET call to get all the featured pizzas for a given user.
