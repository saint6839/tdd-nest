import { TransactionType } from 'src/point/model/point.model';

export class PointHistoryResponseDto {
  constructor(
    private readonly id: number,
    private readonly userId: number,
    private readonly amount: number,
    private readonly type: TransactionType,
    private readonly timeMillis: number,
  ) {
    this.id = id;
    this.userId = userId;
    this.amount = amount;
    this.type = type;
    this.timeMillis = timeMillis;
  }

  getId(): number {
    return this.id;
  }

  getUserId(): number {
    return this.userId;
  }

  getAmount(): number {
    return this.amount;
  }

  getType(): TransactionType {
    return this.type;
  }

  getTimeMillis(): number {
    return this.timeMillis;
  }
}
