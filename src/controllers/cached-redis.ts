import { Request, Response } from "express";
import { getExamList } from "../services/pdaotao";
import { sendSuccessResponse } from "@utils/response";
import { redis } from "@libs/redis";

interface IReponse {
	data: any[];
	isNew: boolean;
	nextPagination: string;
	currentPagination: string;
}

const Task = async (
	endpoint: string,
	data: {
		text: string;
		dateUpload: string;
		href: string;
		isNew: boolean;
		pagination?: string;
		row?: number;
	}[] = [],
) => {
	let nextPagination = "";
	let currentPagination = "";
	let isNew = false;
	const fe = endpoint ? `EXAM_LIST${endpoint}` : "EXAM_LIST";
	//console.log(fe);
	const scraping = await getExamList(fe);

	//console.log(scraping);
	const end = scraping.data[scraping.data.length - 1];
	Array.prototype.push.apply(data, scraping.data);
	//data.push(scraping.data);
	//console.log(data);
	//console.log(scraping.nextPagination);
	if (end.isNew && scraping.nextPagination) {
		return Task(scraping.nextPagination, data);
	}
	//data.push(scraping.data)

	if (scraping) {
		isNew = end.isNew || false;
		nextPagination = scraping.nextPagination || "";
		currentPagination = end.pagination || "";
	}

	return {
		data: data,
		nextPagination: nextPagination,
		isNew: isNew,
		currentPagination: currentPagination,
	};
};

export const cachedRedis = async (req: Request, res: Response) => {

		redis.connect();
		await redis.set("cached:isUpdated", "true", { EX: 60 });
		const task = await Task("");
		await redis.set("cached:scraping", JSON.stringify(task));
		await redis.del("cached:isUpdated");
		redis.disconnect();
		return sendSuccessResponse(res, "Get exam list successfully", task);
	
};
