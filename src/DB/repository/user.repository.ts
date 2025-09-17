
import { 
  CreateOptions, 
  FlattenMaps, 
  HydratedDocument, 
  Model, 
  ProjectionType, 
  QueryOptions, 
  RootFilterQuery, 
  UpdateQuery, 
  UpdateWriteOpResult, 
  MongooseUpdateQueryOptions 
} from "mongoose";
import { IUser } from "../models/user.interface";
import { DatabaseRepository } from "./database.repository";
import { BadRequestException } from "../../utils/response/error.response";

export class UserRepository extends DatabaseRepository<IUser> {
  constructor(protected readonly model: Model<IUser>) {
    super(model);
  }

  async createUser({
    data,
    options,
  }: {
    data: Partial<IUser>;
    options?: CreateOptions;
  }): Promise<HydratedDocument<IUser>> {
    const [user] = await this.model.create([data], options);
    if (!user) {
      throw new BadRequestException("Fail To Create This User");
    }
    return user;
  }

  async findUser({
    filter,
    select,
    options,
  }: {
    filter: RootFilterQuery<IUser>;
    select: ProjectionType<IUser>;
    options?: QueryOptions<IUser>;
  }): Promise<HydratedDocument<IUser> | FlattenMaps<IUser> | null> {
    return await this.findOne({ filter, select, options });
  }

  async find({
    filter,
    options,
  }: {
    filter: RootFilterQuery<IUser>;
    options?: QueryOptions;
  }) {
 
    if(options){
      options.paranoid = true

    }
    return this.model.find(filter, null, options);
  }

  async updateOneUser({
    filter,
    update,
    options,
  }: {
    filter: RootFilterQuery<IUser>;
    update: UpdateQuery<IUser>;
    options?: MongooseUpdateQueryOptions<IUser> | null;
  }): Promise<UpdateWriteOpResult> {
    const result = await this.updateOne({ filter, update, options });
    if (result.modifiedCount === 0) {
      throw new BadRequestException("Fail To Update This User");
    }
    return result;
  }

  async findOneAndUpdateUser({
    filter,
    update,
    options,
  }: {
    filter: RootFilterQuery<IUser>;
    update: UpdateQuery<IUser>;
    options?: MongooseUpdateQueryOptions<IUser>;
  }): Promise<HydratedDocument<IUser> | FlattenMaps<IUser> | null> {
    return await this.findOneAndUpdate({ filter, update, options });
  }
}
