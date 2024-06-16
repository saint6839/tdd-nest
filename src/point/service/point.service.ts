import { POINT_HISTORY_REPOSITORY_TOKEN } from '../repository/point-history/point-history.repository';
import { Inject, Injectable } from '@nestjs/common';
import { IPointService } from './point.service.interface';
import { IPointHistoryRepository } from '../repository/point-history/point-history.repository.interface';
import { USER_POINT_REPOSITORY_TOKEN } from '../repository/user-point/user-point.repository';
import { IUserPointRepository } from '../repository/user-point/user-point.repository.interface';

export const POINT_SERVICE_TOKEN = Symbol('IPointService');

@Injectable()
export class PointService implements IPointService {
  constructor(
    @Inject(POINT_HISTORY_REPOSITORY_TOKEN)
    private readonly pointHistoryRepository: IPointHistoryRepository,
    @Inject(USER_POINT_REPOSITORY_TOKEN)
    private readonly userPointRepository: IUserPointRepository,
  ) {}

  charge(userId: number, amount: number): Promise<void> {
    return this.pointHistoryRepository.charge(userId, amount);
  }
  use(userId: number, amount: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getPoint(userId: number): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getHistory(userId: number): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
}
