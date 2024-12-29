import { Router } from "express";
//import pdaotao from "./pdaotao";
import pdaotaoCached from "./cached-redis";

const router: Router = Router();

//router.use("/pdaotao", pdaotao);
router.use("/pdaotao/scraping/cache", pdaotaoCached);

export default router;

