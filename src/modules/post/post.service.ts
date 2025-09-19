import { th } from "zod/v4/locales/index.cjs";
import type { Request, Response } from "express";

import { createPostDto, likePostDto } from "./post.dto";
import { UserRepository } from "../../DB/repository/user.repository";
import { PostRepository } from "../../DB/repository/post.repository";
import UserModel from "../../DB/models/user.model";
import {
  BadRequestException,
  NotFoundRequestException,
} from "../../utils/response/error.response";
import { PostModel } from "../../DB/models/post.model";
import { Types } from "mongoose";

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

  likePost = async (req: Request, res: Response) => {
    const { postId } = req.params! as { postId: string };
    const action = (req.query.action === "dislike" || req.query.action === "like")
      ? req.query.action
      : "like";
    let updateData: any = {
      $addToSet: { likes: req.user!._id },
    };

    if (action === "dislike") {
      updateData = {
        $pull: { likes: req.user!._id },
      };
    }

    const post = await this.postRepo.findOneAndUpdate({
      filter: { _id: postId },
      update: updateData,
    });
    if (!post) {
      throw new NotFoundRequestException("Post not Exists");
    }

    return res.status(200).json({ message: "success" });
  };
}

export default new PostService();
