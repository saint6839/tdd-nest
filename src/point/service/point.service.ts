import { POINT_HISTORY_REPOSITORY_TOKEN } from '../repository/point-history/point-history.repository';
import { Inject, Injectable } from '@nestjs/common';
import { IPointService } from './point.service.interface';
import { IPointHistoryRepository } from '../repository/point-history/point-history.repository.interface';
import { USER_POINT_REPOSITORY_TOKEN } from '../repository/user-point/user-point.repository';
import { IUserPointRepository } from '../repository/user-point/user-point.repository.interface';
import { TransactionType } from '../model/point.model';
import { PointHistoryMapper } from '../mapper/point-history.mapper';
import { UserPointMapper } from '../mapper/user-point.mapper';
import { UserPointResponseDto } from '../dto/user-point/user-point.response.dto';
import { PointBody as PointDto } from '../dto/point.dto';
import { PointHistoryDomain } from '../domain/point-history.domain';
import { PointHistoryResponseDto } from '../dto/point-history/point-history.response.dto';
import { UserPointDomain } from '../domain/user-point.domain';

export const POINT_SERVICE_TOKEN = Symbol('IPointService');

@Injectable()
export class PointService implements IPointService {
  constructor(
    @Inject(POINT_HISTORY_REPOSITORY_TOKEN)
    private readonly pointHistoryRepository: IPointHistoryRepository,
    @Inject(USER_POINT_REPOSITORY_TOKEN)
    private readonly userPointRepository: IUserPointRepository,
    private readonly pointHistoryMapper: PointHistoryMapper,
    private readonly userPointMapper: UserPointMapper,
  ) {}

  async charge(
    userId: number,
    pointDto: PointDto,
  ): Promise<UserPointResponseDto> {
    await this.pointHistoryRepository.insert(
      PointHistoryDomain.create(
        userId,
        pointDto.getAmount(),
        TransactionType.CHARGE,
        Date.now(),
      ),
    );

    const beforeChargeUserPointEntity =
      await this.userPointRepository.selectById(userId);

    if (!beforeChargeUserPointEntity) {
      await this.userPointRepository.insertOrUpdate(
        userId,
        pointDto.getAmount(),
      );
      const userPointEntity = await this.userPointRepository.selectById(userId);
      const userPointDomain = this.userPointMapper.toDomain(userPointEntity);
      return this.userPointMapper.toDto(userPointDomain);
    }

    const userPointDomain: UserPointDomain = this.userPointMapper.toDomain(
      beforeChargeUserPointEntity,
    );

    userPointDomain.charge(pointDto.getAmount());
    await this.userPointRepository.insertOrUpdate(
      userId,
      userPointDomain.getPoint(),
    );
    return this.userPointMapper.toDto(userPointDomain);
  }

  async use(userId: number, amount: PointDto): Promise<UserPointResponseDto> {
    await this.pointHistoryRepository.insert(
      PointHistoryDomain.create(
        userId,
        amount.getAmount(),
        TransactionType.USE,
        Date.now(),
      ),
    );

    const beforeUseUserPointEntity =
      await this.userPointRepository.selectById(userId);
    const userPointDomain: UserPointDomain = this.userPointMapper.toDomain(
      beforeUseUserPointEntity,
    );
    userPointDomain.use(amount.getAmount());

    await this.userPointRepository.insertOrUpdate(
      userId,
      userPointDomain.getPoint(),
    );
    return this.userPointMapper.toDto(userPointDomain);
  }
  async getPoint(userId: number): Promise<UserPointResponseDto> {
    const userPointEntity = await this.userPointRepository.selectById(userId);
    const userPointDomain = this.userPointMapper.toDomain(userPointEntity);
    return this.userPointMapper.toDto(userPointDomain);
  }

  async getHistory(userId: number): Promise<PointHistoryResponseDto[]> {
    throw new Error('Method not implemented.');
  }
}
