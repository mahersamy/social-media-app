import { FileTypes } from "../enums/filetype.enum";


export const AllowedFileExtensions: Record<FileTypes, string[]> = {
  [FileTypes.image]: ["png", "jpg", "jpeg", "gif", "webp"],
  [FileTypes.video]: ["mp4", "mov", "avi", "mkv", "webm"],
  [FileTypes.audio]: ["mp3", "wav", "aac", "ogg", "flac"],
  [FileTypes.application]: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
};
