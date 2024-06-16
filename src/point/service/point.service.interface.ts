import { UserPointResponseDto } from '../dto/user-point/user-point.response.dto';

export interface IPointService {
  charge(userId: number, amount: number): Promise<UserPointResponseDto>;
  use(userId: number, amount: number): Promise<void>;
  getPoint(userId: number): Promise<number>;
  getHistory(userId: number): Promise<any[]>;
}
