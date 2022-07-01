create table pizza_cart_item(
	id integer primary key AUTOINCREMENT,
	pizza_cart_id numeric,
	pizza_id numeric,
	qty numeric
);