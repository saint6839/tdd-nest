import { UserPointDomain } from 'src/point/domain/user-point.domain';
import { UserPoint } from 'src/point/model/point.model';

export interface IUserPointRepository {
  selectById(id: number): Promise<UserPoint>;
  insertOrUpdate(userPointDomain: UserPointDomain): Promise<UserPoint>;
}
