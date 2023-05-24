const express = require("express");
const Route = express.Router();
Route.get("/", (req, res) => {
	res.send("hello dosen");
});
module.exports = Route ;
