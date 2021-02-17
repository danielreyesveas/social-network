import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import dotev from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
dotev.config();

import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import subRoutes from "./routes/subs";
import miscRoutes from "./routes/misc";
import userRoutes from "./routes/users";

import { request, gql } from "graphql-request";
import trim from "./middleware/trim";

const app = express();
const PORT = process.env.PORT;
const origins = [
	"http://localhost:3000",
	"https://localhost:3000",
	"https://www.social-network.reciclatusanimales.com",
	"https://social-network.reciclatusanimales.com",
	"https://www.clics.reciclatusanimales.com",
	"https://clics.reciclatusanimales.com",
];

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());

app.use(
	cors({
		credentials: true,
		origin: origins,
		optionsSuccessStatus: 200,
	})
);

app.use(express.static("public"));

app.get("/api", (_, response) => response.send("Hello friend..."));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/subs", subRoutes);
app.use("/api/misc", miscRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, async () => {
	console.log(`SERVER RUNNING at http://localhost:${PORT}`);

	try {
		await createConnection();
		console.log("Database connected");
	} catch (error) {
		console.error(error);
	}
});
