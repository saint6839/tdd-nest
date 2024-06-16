export interface IPointService {
  charge(userId: number, amount: number): Promise<void>;
  use(userId: number, amount: number): Promise<void>;
  getPoint(userId: number): Promise<number>;
  getHistory(userId: number): Promise<any[]>;
}
