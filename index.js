const express = require("express");
const sequelize = require("./utils/orm");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT;

// route imports
const adminRoutes = require("./routes/admin.routes");
const mahasiswaRoutes = require("./routes/mahasiswa.routes");
const dosenRoutes = require("./routes/dosen.routes");
const dosenPaRoutes = require("./routes/dosenPA.routes");
// middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/admin", adminRoutes);
app.use("/mahasiswa", mahasiswaRoutes);
app.use("/dosen", dosenRoutes);
app.use("/dosenpa", dosenPaRoutes);

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
