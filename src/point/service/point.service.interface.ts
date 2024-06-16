import { PointHistoryResponseDto } from '../dto/point-history/point-history.response.dto';
import { PointBody as PointDto } from '../dto/point.dto';
import { UserPointResponseDto } from '../dto/user-point/user-point.response.dto';

export interface IPointService {
  charge(userId: number, pointDto: PointDto): Promise<UserPointResponseDto>;
  use(userId: number, pointDto: PointDto): Promise<UserPointResponseDto>;
  getPoint(userId: number): Promise<UserPointResponseDto>;
  getHistory(userId: number): Promise<PointHistoryResponseDto[]>;
}
