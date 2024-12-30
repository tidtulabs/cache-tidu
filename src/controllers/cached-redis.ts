import { Request, Response } from "express";
import { getExamList } from "../services/pdaotao";
import { sendSuccessResponse } from "@utils/response";
import { redis } from "@libs/redis";

const Task = async (
	endpoint: string | null,
	data: {
		text: string;
		dateUpload: string;
		href: string;
		isNew: boolean;
		pagination?: string;
		row?: number;
	}[] = [],
	more: number = 0,
	all: boolean = false,
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

	//console.log(scraping.nextPagination);
	if (scraping.nextPagination) {
		if (end.isNew || all) return Task(scraping.nextPagination, data, more, all);
		else {
			if (more > 0) {
				more--;
				return Task(scraping.nextPagination, data, more);
			}
		}
	}

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

	await redis.set("cached:isUpdated", "true", { EX: 120 });

	const task1 = await Task("", [], 7);

	await redis.set("cached:examList:frequency", JSON.stringify(task1));

	const task2 = await Task(task1.nextPagination, [], 0, true);

	await redis.set("cached:examList:total", JSON.stringify(task2));

	await redis.del("cached:isUpdated");

	await redis.disconnect();
  
  //return res.status(200).json({
  //  code: 204,
  //  message: "Cached redis successfully",
  //});

	return sendSuccessResponse(res, "Cached redis successfully", task1);
};
