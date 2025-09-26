import * as z from "zod";
import { allowCommentsEnum, AvailabilityEnum } from "../../DB/models/post.model";
import { Types } from "mongoose";

export const createPostValidation = {
    body:z.strictObject({
        content:z.string().min(1).max(50000).optional(),

        attachments:z.array(z.any()).max(3).optional(),
        allowComments:z.enum(allowCommentsEnum).default(allowCommentsEnum.allow),
        availability:z.enum(AvailabilityEnum).default(AvailabilityEnum.public),
        tags:z.array(z.string().refine((id)=>Types.ObjectId.isValid(id),{error:"invalid id"})).optional()
    }).superRefine((data,ctx)=>{
        if(!data.attachments?.length&&!data.content?.length){
            ctx.addIssue({
                code:"custom",
                path:["content"],
                message:"sorry content or attachments is required"
            })
        }
        if(data.tags?.length&& data.tags.length!==[...new Set(data.tags)].length){
             ctx.addIssue({
                code:"custom",
                path:["tags"],
                message:"tags must be unique"
            })
        }
    })
}
export const updatePostValidation = {
    body:z.strictObject({
        content:z.string().min(1).max(50000).optional(),
        allowComments:z.enum(allowCommentsEnum).optional(),
        availability:z.enum(AvailabilityEnum).optional(),
        attachments:z.array(z.any()).max(3).optional(),
        removedAttachments:z.array(z.string()).max(3).optional(),
        tags:z.array(z.string().refine((id)=>Types.ObjectId.isValid(id),{error:"invalid id"})).optional(),
        removedTags:z.array(z.string().refine((id)=>Types.ObjectId.isValid(id),{error:"invalid id"})).optional()
    }).superRefine((data,ctx)=>{
        if(Object.values(data).length===0){
             ctx.addIssue({
                code:"custom",
                message:"you must send any field to update"
            })
        }
        if(data.tags?.length&& data.tags.length!==[...new Set(data.tags)].length){
             ctx.addIssue({
                code:"custom",
                path:["removedTags"],
                message:"some of tagged users are Duplicate"
            })
        }
    })
}

export const likePostValidation={
    params:z.strictObject({
        postId:z.string().refine((id)=>Types.ObjectId.isValid(id),{error:"invalid id"})
    }),
    query:z.strictObject({
        action:z.enum(["like","dislike"]).default("like")
    })
}