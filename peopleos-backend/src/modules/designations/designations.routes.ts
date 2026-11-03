import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { list, create, update, remove } from "./designations.controller";
const router=Router();router.use(authenticate);router.get("/",list);router.post("/",authorize("ADMIN"),create);router.patch("/:id",authorize("ADMIN"),update);router.delete("/:id",authorize("ADMIN"),remove);export default router;
