import { Router } from "express";
import pdaotaoCached from "./cache-redis";

const router: Router = Router();

router.use("/pdaotao/scraping/cache", pdaotaoCached);

export default router;

