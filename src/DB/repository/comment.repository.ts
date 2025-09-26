import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { IComment } from "../models/commment.mode";


export class CommentRepository extends DatabaseRepository<IComment>{
      constructor(protected readonly model: Model<IComment>) {
        super(model);
      }
}