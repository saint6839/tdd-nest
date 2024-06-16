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
    const amount = pointDto.getAmount();
    const transactionTime = Date.now();

    // 포인트 이력 저장
    await this.pointHistoryRepository.insert(
      PointHistoryDomain.create(
        userId,
        amount,
        TransactionType.CHARGE,
        transactionTime,
      ),
    );

    // 사용자 기존 포인트 조회
    let userPointEntity = await this.userPointRepository.selectById(userId);

    // 기존 포인트가 없는 경우 새로 생성
    if (!userPointEntity) {
      const newUserPointDomain = UserPointDomain.create(userId, amount);
      newUserPointDomain.charge(amount, transactionTime);
      await this.userPointRepository.insertOrUpdate(newUserPointDomain);
      userPointEntity = await this.userPointRepository.selectById(userId);
    } else {
      // 기존 사용자 포인트에 충전
      const userPointDomain = this.userPointMapper.toDomain(userPointEntity);
      userPointDomain.charge(amount, transactionTime);
      await this.userPointRepository.insertOrUpdate(userPointDomain);
      userPointEntity = await this.userPointRepository.selectById(userId);
    }

    // DTO 변환 후 반환
    const userPointDomain = this.userPointMapper.toDomain(userPointEntity);
    return this.userPointMapper.toDto(userPointDomain);
  }

  async use(userId: number, pointDto: PointDto): Promise<UserPointResponseDto> {
    const amount = pointDto.getAmount();
    const transactionTime = Date.now();

    // 포인트 이력 저장
    await this.pointHistoryRepository.insert(
      PointHistoryDomain.create(
        userId,
        amount,
        TransactionType.USE,
        transactionTime,
      ),
    );

    // 사용자 기존 포인트 조회
    const userPointEntity = await this.userPointRepository.selectById(userId);
    if (!userPointEntity) {
      throw new Error('사용자의 포인트가 존재하지 않습니다.');
    }

    // 포인트 사용 처리
    const userPointDomain = this.userPointMapper.toDomain(userPointEntity);
    userPointDomain.use(amount, transactionTime);
    await this.userPointRepository.insertOrUpdate(userPointDomain);

    // DTO 변환 후 반환
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
