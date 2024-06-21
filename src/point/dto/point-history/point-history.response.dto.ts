import { TransactionType } from 'src/point/model/point.model';

export class PointHistoryResponseDto {
  public id: number;
  public userId: number;
  public amount: number;
  public type: TransactionType;
  public timeMillis: number;

  constructor(
    id: number,
    userId: number,
    amount: number,
    type: TransactionType,
    timeMillis: number,
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
