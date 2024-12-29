import { Router } from "express";
import * as pdaotao from "@controllers/pdaotao";
const router: Router = Router();

router.get("/scraping/examlist", pdaotao.examList);

export default router;
