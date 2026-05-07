import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import contractorsRouter from "./contractors";
import contractsRouter from "./contracts";
import attendanceRouter from "./attendance";
import evaluationsRouter from "./evaluations";
import violationsRouter from "./violations";
import workAreasRouter from "./workAreas";
import equipmentRouter from "./equipment";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";
import auditLogsRouter from "./auditLogs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(contractorsRouter);
router.use(contractsRouter);
router.use(attendanceRouter);
router.use(evaluationsRouter);
router.use(violationsRouter);
router.use(workAreasRouter);
router.use(equipmentRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(reportsRouter);
router.use(auditLogsRouter);

export default router;
