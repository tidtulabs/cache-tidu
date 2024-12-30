import { Router } from "express";
import * as pdaotao from "@controllers/cache-redis";
const router: Router = Router();

router.put("", pdaotao.cachedRedis);

export default router;
