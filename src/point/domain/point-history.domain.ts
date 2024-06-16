import { TransactionType } from '../model/point.model';

export class PointHistoryDomain {
  constructor(
    private readonly id: number,
    private readonly userId: number,
    private readonly amount: number,
    private readonly type: TransactionType,
    private readonly timeMillis: number,
  ) {}

  static create(
    userId: number,
    amount: number,
    type: TransactionType,
    timeMillis: number,
  ): PointHistoryDomain {
    if (amount <= 0) {
      throw new Error('포인트 금액은 0보다 커야 합니다.');
    }
    if (!Object.values(TransactionType).includes(type)) {
      throw new Error('올바른 트랜잭션 타입이 아닙니다.');
    }
    if (timeMillis <= 0) {
      throw new Error('올바른 시간 정보가 아닙니다.');
    }
    // id는 repository 계층에서 자동 생성
    return new PointHistoryDomain(0, userId, amount, type, timeMillis);
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
