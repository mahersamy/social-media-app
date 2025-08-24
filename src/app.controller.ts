// Load enviroument
import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve("./config/.env.development") });

// Load express
import { NextFunction, type Express, type Request, type Response } from "express";
import express from "express";

// Load middelwares
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

// Load App Module
import authController from "./modules/auth/auth.controller";
import { globalErrorHandling } from "./utils/response/error.response";
import { connectDB } from "./DB/connectionDB";

// load limiter
const limiter = rateLimit({
  windowMs: 60 * 60000,
  limit: 2000,
  message: { error: "to many req please try later" },
  statusCode: 429,
});

const bootstrap = () => {
  const app: Express = express();
  const port: number | string = process.env.PORT || 5000;


  // DB connection
  connectDB()

  app.use(cors(), express.json(), helmet());
  app.use(limiter);

  // Routing
  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to social app Backend landing page " });
  });

  // Module Routing
  app.use("/auth", authController);

  
  
  
  // In-valid Routing
  app.use("{/*dummy}",(req:Request,res:Response)=>{
    return res.status(404).json({
        message:"In-valid App Routing"
    })
  });


  // Error global handling

  app.use(globalErrorHandling)

 // start server   
  app.listen(port, () => {
    console.log("Server is Running on Port " + port);
  });
};

export default bootstrap;
