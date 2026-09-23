import { Router } from "express";
import healthRouter from "./health.js";
import indentsRouter from "./indents.js";
import vendorsRouter from "./vendors.js";
import institutionsRouter from "./institutions.js";
import equipmentRouter from "./equipment.js";
import rateContractsRouter from "./rate-contracts.js";
import purchaseOrdersRouter from "./purchase-orders.js";
import tendersRouter from "./tenders.js";
import deliveriesRouter from "./deliveries.js";
import dashboardRouter from "./dashboard.js";

const router = Router();

router.use(healthRouter);
router.use(indentsRouter);
router.use(vendorsRouter);
router.use(institutionsRouter);
router.use(equipmentRouter);
router.use(rateContractsRouter);
router.use(purchaseOrdersRouter);
router.use(tendersRouter);
router.use(deliveriesRouter);
router.use(dashboardRouter);

export default router;
