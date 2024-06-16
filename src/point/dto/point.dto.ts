import { IsInt } from 'class-validator';

export class PointBody {
  @IsInt()
  public amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }

  getAmount(): number {
    return this.amount;
  }
}
