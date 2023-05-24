const ClassRoom = require("./model/classroom.model");
const express = require("express");
const sequelize = require("./utils/orm");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT;

// route imports
const adminRoutes = require("./routes/admin.routes");
const mahasiswaRoutes = require("./routes/mahasiswa.routes");

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/admin", adminRoutes);
app.use("/mahasiswa", mahasiswaRoutes);

sequelize
	.authenticate()
	.then(() => {
		app.listen(port, () => {
			console.log("server is running at port : " + port);
		});
	})
	.catch((err) => {
		console.log(err);
		console.log("failed to connect to database");
	});
