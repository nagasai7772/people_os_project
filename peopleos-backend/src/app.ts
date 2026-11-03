import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { notFound, errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import employeeRoutes from "./modules/employees/employees.routes";
import departmentRoutes from "./modules/departments/departments.routes";
import designationRoutes from "./modules/designations/designations.routes";
import performanceRoutes from "./modules/performance/performance.routes";
import userRoutes from "./modules/users/users.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import reportRoutes from "./modules/reports/reports.routes";
import settingsRoutes from "./modules/settings/settings.routes";

export const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CLIENT_ORIGIN.split(",").map((s) => s.trim()), credentials: true }));
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));
app.get("/api/health", (_req,res) => res.json({ success:true, message:"PeopleOS API is healthy", timestamp:new Date().toISOString() }));
const swaggerDocument = {
  openapi:"3.0.0", info:{ title:"PeopleOS API", version:"1.0.0", description:"Employee & Organization Management API" },
  servers:[{url:"http://localhost:5000/api"}],
  components:{securitySchemes:{bearerAuth:{type:"http",scheme:"bearer",bearerFormat:"JWT"}}},
  security:[{bearerAuth:[]}],
  paths:{
    "/auth/login":{post:{summary:"Login",security:[],responses:{"200":{description:"Tokens and user"}},requestBody:{required:true,content:{"application/json":{schema:{type:"object",properties:{email:{type:"string"},password:{type:"string"}},required:["email","password"]}}}}}},
    "/employees":{get:{summary:"List employees",responses:{"200":{description:"Paginated employees"}}},post:{summary:"Create employee",responses:{"201":{description:"Created"}}}},
    "/departments":{get:{summary:"List departments",responses:{"200":{description:"Departments"}}}},
    "/reports/dashboard":{get:{summary:"Dashboard metrics",responses:{"200":{description:"Dashboard statistics"}}}}
  }
};
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
app.use(notFound);
app.use(errorHandler);
