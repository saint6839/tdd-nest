import { UserPointDomain } from './user-point.domain';

describe('UserPointDomain', () => {
  it('유효한 UserPointDomain 인스턴스를 생성할 때 올바르게 생성되는지 테스트', () => {
    const point = 100;
    const updateMillis = Date.now();

    const userPoint = UserPointDomain.create(point, updateMillis);

    expect(userPoint.getPoint()).toBe(point);
    expect(userPoint.getUpdateMillis()).toBe(updateMillis);
  });

  it('포인트가 0보다 작을 때 에러를 발생시키는지 테스트', () => {
    expect(() => {
      UserPointDomain.create(-1, Date.now());
    }).toThrow('포인트는 0보다 작을 수 없습니다.');
  });

  it('올바르지 않은 시간 정보일 때 에러를 발생시키는지 테스트', () => {
    expect(() => {
      UserPointDomain.create(100, 0);
    }).toThrow('올바른 시간 정보가 아닙니다.');
  });

  it('포인트 충전 시 올바르게 충전되는지 테스트', () => {
    const userPoint = UserPointDomain.create(100, Date.now());
    const amount = 50;
    const updateMillis = Date.now();

    userPoint.charge(amount, updateMillis);

    expect(userPoint.getPoint()).toBe(150);
    expect(userPoint.getUpdateMillis()).toBe(updateMillis);
  });

  it('충전 금액이 0보다 작거나 같을 때 에러를 발생시키는지 테스트', () => {
    const userPoint = UserPointDomain.create(100, Date.now());

    expect(() => {
      userPoint.charge(0, Date.now());
    }).toThrow('충전 금액은 0보다 커야 합니다.');
  });

  it('포인트 사용 시 올바르게 차감되는지 테스트', () => {
    const userPoint = UserPointDomain.create(100, Date.now());
    const amount = 50;
    const updateMillis = Date.now();

    userPoint.use(amount, updateMillis);

    expect(userPoint.getPoint()).toBe(50);
    expect(userPoint.getUpdateMillis()).toBe(updateMillis);
  });

  it('사용 금액이 0보다 작거나 같을 때 에러를 발생시키는지 테스트', () => {
    const userPoint = UserPointDomain.create(100, Date.now());

    expect(() => {
      userPoint.use(0, Date.now());
    }).toThrow('사용 금액은 0보다 커야 합니다.');
  });

  it('포인트가 부족할 때 에러를 발생시키는지 테스트', () => {
    const userPoint = UserPointDomain.create(100, Date.now());

    expect(() => {
      userPoint.use(200, Date.now());
    }).toThrow('포인트가 부족합니다.');
  });
});
