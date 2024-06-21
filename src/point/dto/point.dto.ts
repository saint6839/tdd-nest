import { IsInt, Min } from 'class-validator';

export class PointBody {
  @IsInt()
  @Min(1)
  public amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }
}
