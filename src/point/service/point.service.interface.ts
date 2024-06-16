import { PointBody as PointDto } from '../dto/point.dto';
import { UserPointResponseDto } from '../dto/user-point/user-point.response.dto';

export interface IPointService {
  charge(userId: number, pointDto: PointDto): Promise<UserPointResponseDto>;
  use(userId: number, pointDto: PointDto): Promise<void>;
  getPoint(userId: number): Promise<number>;
  getHistory(userId: number): Promise<any[]>;
}
