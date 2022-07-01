const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

module.exports = async function(fileName){
	return open({
		filename: './pizza-cart.db',
		driver: sqlite3.Database
	})
}