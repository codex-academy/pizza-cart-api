const express = require('express');
const axios = require('axios');
// import sqlite modules
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const fs = require('fs');
const cors = require('cors');

const  openSQLite = require('./openSQLite');
const loadPizzas = require('./create-pizzas');

const PORT = process.env.PORT || 4009;
const app = express();

const routes = require('./routes');

// enable the req.body object - to allow us to use HTML forms
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// const pizzas = JSON.parse(fs.readFileSync('./pizzas.json', 'utf-8'));

// database setup starts here
openSQLite('./pizza-cart.db')
	.then(async (db) => {

		// only setup the routes once the database connection has been established
		await db.migrate();
		const result = await db.get(`select count(*) from pizza`);
		if (result.count == 1) {
			await loadPizzas(db);
		}

		// setup the HTTP routes
		routes(app, db);

		// START the server
		app.listen(PORT, function () {
			console.log(`listening on port ${PORT}`)
		});

	});