import { Inject, Injectable } from '@nestjs/common';
import { MongooseModelNamed } from 'src/db/mongodb/const';
import { BadRefreshTokensModel } from 'src/db/mongodb/models.mongoose';

@Injectable()
export class AuthRepository {
  constructor(
    @Inject(MongooseModelNamed.BadRefreshTokensMongooseModel)
    protected badRefreshTokensModel: typeof BadRefreshTokensModel,
  ) {}

  async addToBadRefreshTokens(userId: string, token: string) {
    const result = await this.badRefreshTokensModel.findOneAndUpdate(
      { userId },
      { $push: { tokens: token } },
      { upsert: true, returnDocument: 'after' },
    );

    return result;
  }

  async isBadRefreshToken(token: string) {
    const result = await this.badRefreshTokensModel.find({ tokens: token });

    return !!result.length;
  }

  async clearBlackListRefreshTokens() {
    await this.badRefreshTokensModel.deleteMany({});
  }
}
