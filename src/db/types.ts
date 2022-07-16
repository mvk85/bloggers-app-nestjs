import { ObjectId } from 'mongodb';

export type IdType = string;

export class Blogger {
  constructor(
    public _id: ObjectId,
    public id: IdType,
    public name: string,
    public youtubeUrl: string,
  ) {}
}

export class Post {
  constructor(
    _id: ObjectId,
    public id: IdType,
    public title: string,
    public shortDescription: string,
    public content: string,
    public bloggerId: string,
    public bloggerName: string,
  ) {}
}

export class User {
  constructor(
    public _id: ObjectId,
    public id: IdType,
    public login: string,
    public passwordHash: string,
    public email: string,
    public isConfirmed: boolean,
    public confirmCode?: string | null,
  ) {}
}

export class Comment {
  constructor(
    public _id: ObjectId,
    public id: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public addedAt: string,
    public postId: string,
  ) {}
}

export class BruteForceItem {
  constructor(
    public ip: string,
    public endpoint: string,
    public date: number,
  ) {}
}

export class BadRefreshTokenEntityType {
  constructor(public userId: string, public tokens: string[]) {}
}
