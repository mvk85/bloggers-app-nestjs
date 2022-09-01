import { LikesStatus } from 'src/db/types';

export class CommentsMapper {
  mapComment(commentRaw: any) {
    return {
      id: commentRaw.id,
      content: commentRaw.content,
      userId: commentRaw.userId,
      userLogin: commentRaw.userLogin,
      addedAt: commentRaw.addedAt,
      likesInfo: {
        likesCount: Number(commentRaw.likesCount),
        dislikesCount: Number(commentRaw.dislikesCount),
        myStatus: commentRaw.myStatus ? commentRaw.myStatus : LikesStatus.None,
      },
    };
  }
}
