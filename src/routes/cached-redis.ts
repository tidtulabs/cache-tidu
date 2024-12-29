import { Router } from "express";
import * as pdaotao from "@controllers/cached-redis";
const router: Router = Router();

router.put("", pdaotao.cachedRedis);

export default router;
