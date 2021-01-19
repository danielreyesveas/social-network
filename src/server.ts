import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import dotev from "dotenv";
import cookieParser from "cookie-parser";

dotev.config();

import authRoutes from "./routes/auth";
import trim from "./middleware/trim";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());

app.get("/", (_, response) => response.send("Hello friend..."));

app.use("/api/auth", authRoutes);

app.listen(5000, async () => {
	console.log("SERVER RUNNING");

	try {
		await createConnection();
		console.log("Database connected");
	} catch (error) {
		console.error(error);
	}
});
