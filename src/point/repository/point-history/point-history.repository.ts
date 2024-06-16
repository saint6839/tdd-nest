import { PointHistoryMapper } from '../../mapper/point-history.mapper';
import { IPointHistoryRepository as IPointHistoryRepository } from './point-history.repository.interface';
import { Injectable } from '@nestjs/common';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import { PointHistoryDomain } from 'src/point/domain/point-history.domain';
import { PointHistory } from 'src/point/model/point.model';

export const POINT_HISTORY_REPOSITORY_TOKEN = Symbol('IPointHistoryRepository');

@Injectable()
export class PointHistoryRepository implements IPointHistoryRepository {
  constructor(
    private readonly pointHistoryModel: PointHistoryTable,
    private readonly pointHistoryMapper: PointHistoryMapper,
  ) {}
  async insert(pointHistoryDomain: PointHistoryDomain): Promise<PointHistory> {
    return this.pointHistoryModel.insert(
      pointHistoryDomain.getUserId(),
      pointHistoryDomain.getAmount(),
      pointHistoryDomain.getType(),
      pointHistoryDomain.getTimeMillis(),
    );
  }
  selectAllByUserId(userId: number): Promise<PointHistory[]> {
    return this.pointHistoryModel.selectAllByUserId(userId);
  }
}
