import type { Request, Response } from "express";

import { PostRepository } from "../../DB/repository/post.repository";
import { CommentRepository } from "../../DB/repository/comment.repository";
import { allowCommentsEnum, PostModel } from "../../DB/models/post.model";
import { commentModel } from "../../DB/models/commment.mode";
import { postAvailability } from "../post/post.service";
import {
  BadRequestException,
  NotFoundRequestException,
} from "../../utils/response/error.response";
import { createCommentDto } from "./comments.dto";
import { Types } from "mongoose";

class CommentsService {
  private postRepo = new PostRepository(PostModel);
  private commentRepo = new CommentRepository(commentModel);
  createComment = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: Types.ObjectId };
    const data: createCommentDto = req.body;
    const post = await this.postRepo.findOne({
      filter: {
        _id: postId,
        $or: postAvailability(req),
        allowComments: allowCommentsEnum.allow,
      },
      options: { lean: true },
    });

    if (!post) {
      throw new NotFoundRequestException("post not found");
    }
    const comment = await this.commentRepo.create({
      data: [
        {
          content: data.content,
          tags: data.tags as unknown as Types.ObjectId[],
          allowComments: data.allowComments,
          availability: data.availability,
          createdBy: req.user!._id,
          postId
        },
      ],
    });
    if (!comment) {
      throw new BadRequestException("Fail To Create Post");
    }

    let arrOfDestinationPath = [];
    if (req.files?.length) {
      for (const file of req.files as Express.Multer.File[]) {
        arrOfDestinationPath.push(file.path);
      }
      await this.commentRepo.updateOne({
        filter: { _id: comment[0]._id },
        update: {
          attachments: arrOfDestinationPath,
        },
      });
    }

    return res.status(201).json({ message: "success" });
  };
  replayOnComment = async (req: Request, res: Response) => {
    const { postId, commentId } = req.params! as unknown as {
      postId: Types.ObjectId;
      commentId: Types.ObjectId;
    };
    const data: createCommentDto = req.body;
    const comment = await this.commentRepo.findOne({
      filter: {
        _id: commentId,
        postId: postId,
      },
      options: {
        lean: true,
        populate: [
          {
            path: "postId",
            match: {
              allowComments: allowCommentsEnum.allow,
              availability: postAvailability(req),
            },
          },
        ],
      },
    });

    if (!comment?.postId) {
      throw new BadRequestException("Fail To find Post");
    }

    const commentReplay = await this.commentRepo.create({
      data: [
        {
          content: data.content,
          tags: data.tags as unknown as Types.ObjectId[],
          postId,
          commentId,
          createdBy: req.user!._id,
        },
      ],
    });

    let arrOfDestinationPath = [];
    if (req.files?.length) {
      for (const file of req.files as Express.Multer.File[]) {
        arrOfDestinationPath.push(file.path);
      }
      await this.commentRepo.updateOne({
        filter: { _id: commentReplay![0]._id },
        update: {
          attachments: arrOfDestinationPath,
        },
      });
    }

    return res.status(201).json({ message: "success" });
  }
}

export default new CommentsService();
