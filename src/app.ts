import express, { Express, Request, Response } from "express";
import "module-alias/register";
import "dotenv/config";
import cors from "cors";
import routes from "./routes";
import errorHandler from "@middlewares/error-handler";
//dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(
	cors({
		origin: process.env.CLIENT || "http://localhost:8000",
    optionsSuccessStatus: 200,
	}),
);

app.use(express.json());
app.use("/api/v1", routes);

//app.get("/", (req: Request, res: Response) => {
//	res.send("Express + TypeScript Server");
//});

app.use(errorHandler);



app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
