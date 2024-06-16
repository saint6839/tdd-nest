export class UserPointDomain {
  constructor(
    private readonly id: number,
    private point: number,
    private updateMillis: number,
  ) {
    this.id = id;
    this.point = point;
    this.updateMillis = updateMillis;
  }

  static create(point: number, updateMillis: number): UserPointDomain {
    if (point < 0) {
      throw new Error('포인트는 0보다 작을 수 없습니다.');
    }
    if (updateMillis <= 0) {
      throw new Error('올바른 시간 정보가 아닙니다.');
    }
    // id는 repository 계층에서 자동 생성
    return new UserPointDomain(0, point, updateMillis);
  }

  getId(): number {
    return this.id;
  }

  getPoint(): number {
    return this.point;
  }

  getUpdateMillis(): number {
    return this.updateMillis;
  }

  public use(amount: number): void {
    if (this.point < amount) {
      throw new Error('포인트가 부족합니다.');
    }

    this.point -= amount;
  }
}
