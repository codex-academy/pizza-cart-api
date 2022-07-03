# Explo so ring APIs

The widgets you create so far used local data...

Data lives in the browser so far. Only you can see it.

Next we will look into sharing data with others...


Front end using AlpineJS calling an API with HTTP.

The API gives you access to shared data...

What is an API?

	Application Programming Interface...?

How do you access APIs?

	Using HTTP - the same protocol you use to browse the web...
	But you use it to get JSON data to show in your application... and to send data to the server.

How do you access APIs?

	Use an HTTP client like a browser...
	Thunder Client - a VS code plugin that makes it easy to make HTTP calls of various different types.
	Installing VS Code plugin

Using the API from code:

	We can use `fetch` built into the browser
	Or we can use `axios` - easier to use...
	Both use promises...
	Calls to a server takes time... so call are nor blocking
	Asyncronous

	Our app make the call to the server... 
		* supply a function that should be called when the data is ready
		* and another function that states what should be done if things goes wrong


	`axios.get('/url')`

```js
		axios
			.get('/url')
			.then(function(result) {

			})
			.catch(function(err){

			})
```

```js
		axios
			.post('/url', { /* input data here */ } )
			.then(function(result) {
				
			})
			.catch(function(err){

			})
```

To use axios we need to reference it using a script tag.







	



















