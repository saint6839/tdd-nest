import { PointHistoryDomain } from 'src/point/domain/point-history.domain';
import { PointHistory } from 'src/point/model/point.model';

export interface IPointHistoryRepository {
  insert(pointHistoryDomain: PointHistoryDomain): Promise<PointHistory>;

  selectAllByUserId(userId: number): Promise<PointHistory[]>;
}
