import { Router, type IRouter } from "express";
import healthRouter from "./health";
import indentsRouter from "./indents";
import vendorsRouter from "./vendors";
import institutionsRouter from "./institutions";
import equipmentRouter from "./equipment";
import rateContractsRouter from "./rate-contracts";
import purchaseOrdersRouter from "./purchase-orders";
import tendersRouter from "./tenders";
import deliveriesRouter from "./deliveries";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

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
