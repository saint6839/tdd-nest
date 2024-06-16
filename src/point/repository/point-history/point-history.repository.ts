import { IPointHistoryRepository as IPointHistoryRepository } from './point-history.repository.interface';
import { Injectable } from '@nestjs/common';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import { PointHistory, TransactionType } from 'src/point/model/point.model';

export const POINT_HISTORY_REPOSITORY_TOKEN = Symbol('IPointHistoryRepository');

@Injectable()
export class PointHistoryRepository implements IPointHistoryRepository {
  constructor(private readonly pointHistoryModel: PointHistoryTable) {}
  insert(
    userId: number,
    amount: number,
    transactionType: string,
    timestamp: number,
  ): Promise<PointHistory> {
    throw new Error('Method not implemented.');
  }
  selectAllByUserId(userId: number): Promise<PointHistory[]> {
    throw new Error('Method not implemented.');
  }
}
