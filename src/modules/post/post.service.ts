import type { Request, Response } from "express";

import { createPostDto, updatePostDto } from "./post.dto";
import { UserRepository } from "../../DB/repository/user.repository";
import { PostRepository } from "../../DB/repository/post.repository";
import UserModel from "../../DB/models/user.model";
import {
  BadRequestException,
  NotFoundRequestException,
} from "../../utils/response/error.response";
import { AvailabilityEnum, IPost, PostModel } from "../../DB/models/post.model";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";

export const postAvailability = (req: Request) => {
  return [
    { availability: AvailabilityEnum.public },
    { availability: AvailabilityEnum.onlyMe, createdBy: req.user!._id },
    {
      availability: { $ne: AvailabilityEnum.onlyMe },
      tags: { $in: req.user!._id },
    },
    {
      availability: AvailabilityEnum.friends,
      createdBy: { $in: [...(req.user!.friends || []), req.user!._id] },
    },
  ];
};

class PostService {
  private userRepo = new UserRepository(UserModel);
  private postRepo = new PostRepository(PostModel);

  createPost = async (req: Request, res: Response) => {
    const data: createPostDto = req.body;
    if (
      data.tags?.length &&
      (
        await this.userRepo.find({
          filter: { _id: { $in: data.tags } },
          options: { lean: true },
        })
      ).length !== data.tags.length
    ) {
      throw new NotFoundRequestException(
        "some of the mentioned user not found"
      );
    }
    let arrOfDestinationPath = [];

    const post = await this.postRepo.create({
      data: [
        {
          content: data.content,
          tags: data.tags as unknown as Types.ObjectId[],
          allowComments: data.allowComments,
          availability: data.availability,
          createdBy: req.user!._id,
        },
      ],
    });
    if (!post) {
      throw new BadRequestException("Fail To Create Post");
    }
    if (req.files?.length) {
      for (const file of req.files as Express.Multer.File[]) {
        arrOfDestinationPath.push(file.path);
      }
      await this.postRepo.updateOne({
        filter: { _id: post![0]._id },
        update: {
          attachments: arrOfDestinationPath,
        },
      });
    }

    return res.status(200).json({ message: "success" });
  };
  updatePost = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: Types.ObjectId };
    const data: updatePostDto = req.body;
    const post = await this.postRepo.findOne({
      filter: {
        _id: postId,
        createdBy: req.user!._id,
      },
    });
    if (!post) {
      throw new NotFoundRequestException("post not found");
    }

    let arrOfAttachments = post.attachments || [];
    if (req.files?.length) {
      for (const file of req.files as Express.Multer.File[]) {
        arrOfAttachments.push(file.path);
      }
    }

    if (data.removedAttachments?.length) {
      arrOfAttachments = arrOfAttachments.filter(
        (attachment) => !data.removedAttachments!.includes(attachment)
      );
    }

    if (
      data.tags?.length &&
      (
        await this.userRepo.find({
          filter: { _id: { $in: data.tags } },
          options: { lean: true },
        })
      ).length !== data.tags.length
    ) {
      throw new NotFoundRequestException(
        "some of the mentioned user not found"
      );
    }
    
    let tagsArr: Types.ObjectId[]=data.tags as unknown as Types.ObjectId[]
    if(data.removedTags?.length){
      tagsArr=post.tags.filter((tag)=>!data.removedTags!.includes(tag.toHexString()))
      console.log(post.tags);
    }

    await this.postRepo.updateOne({
      filter: { _id: postId },
      update: {
        attachments: arrOfAttachments,
        content: data.content,
        allowComments: data.allowComments,
        availability: data.availability,
        tags: tagsArr,
      },
    });
    return res.status(200).json({ message: "success" });
  };

  likePost = async (req: Request, res: Response) => {
    const { postId } = req.params! as { postId: string };
    const action =
      req.query.action === "dislike" || req.query.action === "like"
        ? req.query.action
        : "like";
    let updateData: UpdateQuery<HydratedDocument<IPost>> = {
      $addToSet: { likes: req.user!._id },
    };

    if (action === "dislike") {
      updateData = {
        $pull: { likes: req.user!._id },
      };
    }

    const post = await this.postRepo.findOneAndUpdate({
      filter: {
        _id: postId,
        $or: postAvailability(req),
      },
      update: updateData,
    });
    if (!post) {
      throw new NotFoundRequestException("Post not Exists");
    }

    return res.status(200).json({ message: "success" });
  };

  postList= async (req: Request, res: Response) => {
    let {page,size}=req.query as unknown as {page:number,size:number};

   
    const posts = await this.postRepo.paginate({
      page,
      size,
      filter: { 
        $or: postAvailability(req),
      },
      
    })

    return res.status(200).json({ message: "success", posts });
  }

}

export default new PostService();
