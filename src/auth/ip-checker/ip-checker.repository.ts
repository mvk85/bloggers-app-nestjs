import { Inject, Injectable } from '@nestjs/common';
import { addSeconds } from 'date-fns';
import { MongooseModelNamed } from 'src/db/const';
import { RequestsModel } from 'src/db/models.mongoose';
import { newDateInMilliseconds } from 'src/utils';
import { BruteForceItem } from './types';

const REQUEST_CHECKING_DURING = -10;

@Injectable()
export class IpCheckerRepository {
  constructor(
    @Inject(MongooseModelNamed.RequestsMongooseModel)
    private requestsModel: typeof RequestsModel,
  ) {}

  async getRequestsCountWithDuration(ip: string, endpoint: string) {
    const endDate = newDateInMilliseconds();
    const startDate = addSeconds(endDate, REQUEST_CHECKING_DURING).getTime();
    const count = await this.requestsModel.countDocuments({
      ip,
      endpoint,
      date: { $gte: startDate, $lte: endDate },
    });

    return count;
  }

  async getRequestsCountByLogin(login: string, endpoint: string) {
    const count = await this.requestsModel.countDocuments({
      endpoint,
      login,
    });

    return count;
  }

  async writeRequest(request: BruteForceItem) {
    await this.requestsModel.create(request);

    return true;
  }

  async deleteAllRequests() {
    await this.requestsModel.deleteMany({});
  }
}
