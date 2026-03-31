import { Router } from "express";
import { sendContactEmail } from "../controllers/contactController";

const router = Router();

// /api/contact
router.post("/", sendContactEmail);

export default router;
