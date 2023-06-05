const express = require("express");
const sequelize = require("./utils/orm").sequelize;
const sequelizeSessionStore = require("./utils/orm").sequelizeSesssionStore;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT;
const session = require("express-session");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const protectCsrf = csrf({ cookie: { sameSite: "none", secure: true } });

// route imports
const adminRoutes = require("./routes/admin.routes");
const mahasiswaRoutes = require("./routes/mahasiswa.routes");
const dosenRoutes = require("./routes/dosen.routes");
const dosenPaRoutes = require("./routes/dosenPA.routes");

// middleware
app.use(cors({ origin: "http://127.0.0.1:5173", credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: sequelizeSessionStore,
	})
);
app.use(protectCsrf);
app.use(function (err, req, res, next) {
	if (err.code !== "EBADCSRFTOKEN") return next(err);
	// handle CSRF token errors here
	res.status(403).json({
		message: "invalid CSRF Token, please include it in request header",
		status: 403,
		error: true,
	});
});

// routes
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
