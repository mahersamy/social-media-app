import type { NextFunction ,Request,Response } from "express";
import type { ZodType } from "zod";
import { BadRequestException } from "../utils/response/error.response";

type KeyReqType=keyof Request
type SchemaType = Partial<Record<KeyReqType,ZodType>>
export const validationMiddelware = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {

    for (const key of Object.keys(schema) as KeyReqType[] ) {
    const zodSchema = schema[key];
    if (!zodSchema) continue; 
    const validationResult = zodSchema.safeParse(req[key]);
    
     if (!validationResult.success) {
      throw new BadRequestException("Validation Error", {
        issues: validationResult.error.issues,
      });
    }

    }
     next() 
  };
};