import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { newDateInMilliseconds } from 'src/utils';
import { IpCheckerService } from '../ip-checker/ip-checker.service';
import { BruteForceItem } from '../ip-checker/types';

@Injectable()
export class IpCheckerGuard implements CanActivate {
  constructor(protected ipCheckerService: IpCheckerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const ip = req.ip;
    const endpoint = req.baseUrl + req.path;

    const isCorrectRequest =
      await this.ipCheckerService.getRequestsCountWithDuration(ip, endpoint);

    if (!isCorrectRequest) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const newRequestItem: BruteForceItem = new BruteForceItem(
      ip,
      endpoint,
      newDateInMilliseconds(),
    );

    await this.ipCheckerService.saveRequest(newRequestItem);

    return true;
  }
}
