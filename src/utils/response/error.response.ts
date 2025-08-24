import { Request, Response, NextFunction } from "express";

export interface IError extends Error {
  statusCode:number
}


export class ApplicationException extends Error {
    
    constructor(message:string,public statusCode:number,cause?:unknown){
        super(message,{cause})
        this.name=this.constructor.name
        Error.captureStackTrace(this,this.constructor)
    }

}



export class BadRequestException extends ApplicationException {
    
    constructor(message:string,cause?:unknown){
        super(message,400,cause)
  }
} 


export const globalErrorHandling=(error:IError,req:Request,res:Response,next:NextFunction)=>{
    return res.status(error.statusCode || 500).json({
      error_message:error.message || "something wrong on server !!",
      stack:process.env.MOOD==="development"?error.stack:undefined,
      errorCause:error.cause,
      // error,
    })
  }