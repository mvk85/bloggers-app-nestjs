import { Injectable } from '@nestjs/common';
import { BruteForceItem } from './types';
import { IpCheckerRepository } from './ip-checker.repository';

const CURRENT_REQUEST = 1;
const MAX_REQUESTS_IN_DURATION = 5;

@Injectable()
export class IpCheckerService {
  constructor(protected requestsRepository: IpCheckerRepository) {}

  async saveRequest(item: BruteForceItem) {
    await this.requestsRepository.writeRequest(item);
  }

  async getRequestsCountWithDuration(ip: string, endpoint: string) {
    const requestCount =
      await this.requestsRepository.getRequestsCountWithDuration(ip, endpoint);

    return requestCount <= MAX_REQUESTS_IN_DURATION - CURRENT_REQUEST;
  }
}
