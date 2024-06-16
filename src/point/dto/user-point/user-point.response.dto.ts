export class UserPointResponseDto {
  constructor(
    private readonly id: number,
    private readonly point: number,
    private readonly updateMillis: number,
  ) {
    this.id = id;
    this.point = point;
    this.updateMillis = updateMillis;
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
}
