import { Request, Response } from "express";
import { getExamList } from "../services/pdaotao";
import { sendSuccessResponse } from "@utils/response";

export const examList = async (req: Request, res: Response) => {
	const { page } = req.query || "";
	//console.log(page);

  const r = page ? `EXAM_LIST?page=${page}` : "EXAM_LIST";
	const data = await getExamList(r);

	const task = {
		data: data.data,
	};
	return sendSuccessResponse(res, "Get exam list successfully", data);
	//res.status(200).json(task);
};
