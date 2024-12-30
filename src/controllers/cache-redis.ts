import { Request, Response } from "express";
import { redis } from "@libs/redis";
import { getExamList } from "@services/cache-redis";
import { logger } from "@libs/winston";

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
	remainingPages: number = 0,
	includeAll: boolean = false,
) => {
	let nextPagination = "";
	let currentPagination = "";
	let isNew = false;

	const fe = endpoint ? `EXAM_LIST${endpoint}` : "EXAM_LIST";

	const scraping = await getExamList(fe);

	const end = scraping.data[scraping.data.length - 1];
	Array.prototype.push.apply(data, scraping.data);

	if (scraping.nextPagination) {
		if (end.isNew || includeAll)
			return Task(scraping.nextPagination, data, remainingPages, includeAll);
		else {
			if (remainingPages > 0) {
				remainingPages--;
				return Task(scraping.nextPagination, data, remainingPages);
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
	try {
		redis.connect();

		await redis.set("cached:isUpdated", "true", { EX: 120 });

		const task1 = await Task("", [], 7);

		await redis.set("cached:examList:frequency", JSON.stringify(task1));

		const task2 = await Task(task1.nextPagination, [], 0, true);

		await redis.set("cached:examList:total", JSON.stringify(task2));

		await redis.del("cached:isUpdated");

		await redis.disconnect();

		logger.info("create cache redis successfull");

		return res
			.status(204)
			.json({ success: true, message: "create cache redis successfull" });

	} catch (error: any) {
		logger.error(error);
		return res.status(500).json({ success: false, message: error.message });
	}
};
