import { PointHistory, TransactionType } from 'src/point/model/point.model';

export interface IPointHistoryRepository {
  insert(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    timestamp: number,
  ): Promise<PointHistory>;

  selectAllByUserId(userId: number): Promise<PointHistory[]>;
}
