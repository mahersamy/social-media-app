import type { Request, Response } from "express";
import { de } from "zod/v4/locales/index.cjs";
import { UserRepository } from "../../DB/repository/user.repository";
import { PostRepository } from "../../DB/repository/post.repository";
import { CommentRepository } from "../../DB/repository/comment.repository";
import UserModel from "../../DB/models/user.model";
import { allowCommentsEnum, PostModel } from "../../DB/models/post.model";
import { commentModel } from "../../DB/models/commment.mode";
import { postAvailability } from "../post/post.service";
import { BadRequestException, NotFoundRequestException } from "../../utils/response/error.response";
import { createCommentDto } from "./comments.dto";
import { Types } from "mongoose";

class CommentsService {
  private userRepo = new UserRepository(UserModel);
  private postRepo = new PostRepository(PostModel);
  private commentRepo = new CommentRepository(commentModel);
  async createComment(req: Request, res: Response) {
    const { postId } = req.params! as { postId: string };
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
  }
}

export default new CommentsService();
