import { TransactionType } from '../model/point.model';
import { PointHistoryDomain } from './point-history.domain';

describe('PointHistoryDomain', () => {
  it('유효한 PointHistoryDomain 인스턴스가 생성 되는지 테스트.', () => {
    const userId = 1;
    const amount = 100;
    const type = TransactionType.CHARGE;
    const timeMillis = Date.now();

    const pointHistory = PointHistoryDomain.create(
      userId,
      amount,
      type,
      timeMillis,
    );

    expect(pointHistory.getUserId()).toBe(userId);
    expect(pointHistory.getAmount()).toBe(amount);
    expect(pointHistory.getType()).toBe(type);
    expect(pointHistory.getTimeMillis()).toBe(timeMillis);
  });

  it('amount가 0 이하일 경우 에러를 발생시키는지 테스트', () => {
    expect(() => {
      PointHistoryDomain.create(1, 0, TransactionType.CHARGE, Date.now());
    }).toThrow('포인트 금액은 0보다 커야 합니다.');
  });

  it('유효하지 않은 type일 경우 에러를 발생시켜야 합니다.', () => {
    expect(() => {
      PointHistoryDomain.create(
        1,
        100,
        'INVALID_TYPE' as unknown as TransactionType,
        Date.now(),
      );
    }).toThrow('올바른 트랜잭션 타입이 아닙니다.');
  });

  it('timeMillis가 0 이하일 경우 에러를 발생시키는지 테스트', () => {
    expect(() => {
      PointHistoryDomain.create(1, 100, TransactionType.CHARGE, 0);
    }).toThrow('올바른 시간 정보가 아닙니다.');
  });
});
