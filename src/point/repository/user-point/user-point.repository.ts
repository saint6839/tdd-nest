import { Injectable } from '@nestjs/common';
import { IUserPointRepository } from './user-point.repository.interface';
import { UserPointTable } from 'src/database/userpoint.table';
import { UserPoint } from 'src/point/model/point.model';
import { UserPointDomain } from 'src/point/domain/user-point.domain';
import { Mutex } from 'src/utils/mutex';

export const USER_POINT_REPOSITORY_TOKEN = Symbol('IUserPointRepository');

@Injectable()
export class UserPointRepository implements IUserPointRepository {
  constructor(private readonly userPointModel: UserPointTable) {}

  async selectById(id: number): Promise<UserPoint> {
    return this.userPointModel.selectById(id);
  }
  async insertOrUpdate(userPointDomain: UserPointDomain): Promise<UserPoint> {
    return this.userPointModel.insertOrUpdate(
      userPointDomain.getId(),
      userPointDomain.getPoint(),
    );
  }
}
