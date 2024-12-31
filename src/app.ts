import express, { Express } from "express";
import "dotenv/config";
import cors from "cors";
import routes from "./routes";
import { logger } from "@libs/winston";
import { redis } from "@libs/redis";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(
	cors({
		origin: process.env.CLIENT,
		optionsSuccessStatus: 200,
	}),
);

app.use(express.json());
app.use("/api/v1", routes);

app.listen(port, () => {
	redis.connect().then(() => {
		logger.info("[redis]: is connected");
	}).catch((err) => {
    logger.error(`[redis]: ${err}`);
  })
	logger.info(`[server]: is running at http://localhost:${port}`);
});
