import { scrapingData } from "@libs/cheerio";
import { normalizeEndpoint} from "@utils/extract-endpoint";

//type ExamItem = {
//	examTitle: string; // Tiêu đề bài thi
//	uploadDate: string; // Ngày tải lên
//	examLink: string; // Liên kết tới bài thi
//	isNew: boolean; // Cờ đánh dấu bài thi có mới hay không
//	currentPagination: string; //  phân trang hiện tại
//	rowIndex?: number; // Số thứ tự dòng bài thi trong bảng
//};
//

type ExamItem = {
	text: string;
	dateUpload: string;
	href: string;
	isNew: boolean;
	pagination?: string;
	row: number;
};

type GetExamListResult = {
	data: ExamItem[];
	nextPagination?: string | null;
};

function parseTitleAndTime(input: string) {
	const parts = input
		.split("\n")
		.map((part) => part.trim())
		.filter((part) => part);

	if (!parts[0] || !parts[1]) {
		return { title: null, time: null };
	}

	return {
		title: parts[0],
		time: parts[1].replace(/[()]/g, ""),
	};
}

export const getExamList = async (
	endpoint: string,
): Promise<GetExamListResult> => {
	const scraping = await scrapingData(endpoint);

	if (!scraping.success || !scraping.data) {
		throw new Error(scraping.message);
	}
	const listResult: GetExamListResult = {
		data: [],
	};

	const $ = scraping.data;
	const rows = $(".border_main").find("table").find("tr").first(); // Skip 2 border_main and tilte rows

	rows.each((_, element) => {
		const tds = $(element).find("td").slice(2); // Skip 2 first

		tds.each((index, tdElement) => {
			const td = $(tdElement);
			//const examList: ExamItem = {
			//	examTitle: "",
			//	examLink: "",
			//	uploadDate: "",
			//	isNew: false,
			//	currentPagination: endpoint,
			//	rowIndex: index + 1,
			//};

			const examList: ExamItem = {
				row: index + 1,
				text: "",
				dateUpload: "",
				href: "",
				isNew: false,
				pagination: endpoint,
				//pagination: endpoint,
			};

			const links = td.find("a"); // Skip last link

			links.each((_, linkElement) => {
				const t = parseTitleAndTime($(linkElement).text().trim());
				//examList.examTitle = t.title || "";
				//examList.uploadDate = t.time || "";
				//examList.examLink = extractEndpoint($(linkElement).attr("href") || "");
				examList.text = t.title || "";
				examList.dateUpload = t.time || "";
				examList.href = normalizeEndpoint($(linkElement).attr("href") || "");
			});

			const next = td.find("a").last();
			if (next.text().includes(">>")) {
				listResult.nextPagination = normalizeEndpoint(
					td.find("a").last().attr("href") || "",
				);
			} else {
				listResult.nextPagination = null;
			}

			examList.isNew =
				td.find("img").last().attr("src")?.includes("news.gif") || false;

			listResult.data.push(examList);
		});
	});

	return {
		data: listResult.data.slice(0, -1),
		nextPagination: listResult.nextPagination,
	};
};
