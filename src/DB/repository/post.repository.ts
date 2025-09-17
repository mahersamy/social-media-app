import { Model } from "mongoose";
import { IPost } from "../models/post.model";
import { DatabaseRepository } from "./database.repository";

export class PostRepository extends DatabaseRepository<IPost>{
      constructor(protected readonly model: Model<IPost>) {
        super(model);
      }
}