import { POINT_HISTORY_REPOSITORY_TOKEN } from './../repository/point-history/point-history.repository';
import { USER_POINT_REPOSITORY_TOKEN } from './../repository/user-point/user-point.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { IPointHistoryRepository } from '../repository/point-history/point-history.repository.interface';
import { IUserPointRepository } from '../repository/user-point/user-point.repository.interface';
import { PointHistoryMapper } from '../mapper/point-history.mapper';
import { UserPointMapper } from '../mapper/user-point.mapper';
import { PointBody as PointDto } from '../dto/point.dto';
import { PointHistory, TransactionType, UserPoint } from '../model/point.model';
import { PointHistoryDomain } from '../domain/point-history/point-history.domain';
import { PointService } from './point.service';
import { UserPointResponseDto } from '../dto/user-point/user-point.response.dto';
import { UserPointDomain } from '../domain/user-point/user-point.domain';

describe('PointService', () => {
  let pointService: PointService;
  let pointHistoryRepository: jest.Mocked<IPointHistoryRepository>;
  let userPointRepository: jest.Mocked<IUserPointRepository>;
  let pointHistoryMapper: jest.Mocked<PointHistoryMapper>;
  let userPointMapper: jest.Mocked<UserPointMapper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointService,
        {
          provide: POINT_HISTORY_REPOSITORY_TOKEN,
          useValue: {
            insert: jest.fn(),
            selectAllByUserId: jest.fn(),
          },
        },
        {
          provide: USER_POINT_REPOSITORY_TOKEN,
          useValue: {
            selectById: jest.fn(),
            insertOrUpdate: jest.fn(),
          },
        },
        {
          provide: PointHistoryMapper,
          useValue: {
            toDomain: jest.fn(),
            toDto: jest.fn(),
          },
        },
        {
          provide: UserPointMapper,
          useValue: {
            toDomain: jest.fn(),
            toDto: jest.fn(),
          },
        },
      ],
    }).compile();

    pointService = module.get<PointService>(PointService);
    pointHistoryRepository = module.get(POINT_HISTORY_REPOSITORY_TOKEN);
    userPointRepository = module.get(USER_POINT_REPOSITORY_TOKEN);
    pointHistoryMapper = module.get(PointHistoryMapper);
    userPointMapper = module.get(UserPointMapper);
  });

  describe('동시성 및 요청 순서 테스트', () => {
    it('여러 충전 요청이 동시에 들어왔을 때 순서대로 처리되는지 테스트', async () => {
      // given
      const userId = 1;
      const amounts = [100, 200, 300];
      const transactionTime = Date.now();
      const userPointDomain = UserPointDomain.create(0, transactionTime);

      let currentPoint = 0;
      userPointRepository.selectById.mockImplementation(() => {
        return Promise.resolve({
          id: userId,
          point: currentPoint,
          updateMillis: transactionTime,
        });
      });
      userPointRepository.insertOrUpdate.mockImplementation(domain => {
        currentPoint = domain.getPoint();
        return Promise.resolve({
          id: userId,
          point: currentPoint,
          updateMillis: domain.getUpdateMillis(),
        });
      });
      userPointMapper.toDomain.mockReturnValue(userPointDomain);
      userPointMapper.toDto.mockImplementation(
        () => new UserPointResponseDto(userId, currentPoint, transactionTime),
      );

      // when
      const results = await Promise.all(
        amounts.map(amount =>
          pointService.charge(userId, new PointDto(amount)),
        ),
      );

      // then
      expect(results[0].getPoint()).toBe(100);
      expect(results[1].getPoint()).toBe(300);
      expect(results[2].getPoint()).toBe(600);
      expect(userPointRepository.insertOrUpdate).toHaveBeenCalledTimes(3);
    });

    it('충전과 사용 요청이 동시에 들어왔을 때 순서대로 처리되는지 테스트', async () => {
      // given
      const userId = 1;
      const initialPoint = 500;
      const chargeAmount = 300;
      const useAmount = 200;
      const transactionTime = Date.now();
      const userPointDomain = UserPointDomain.create(
        initialPoint,
        transactionTime,
      );

      let currentPoint = initialPoint;
      userPointRepository.selectById.mockImplementation(() => {
        return Promise.resolve({
          id: userId,
          point: currentPoint,
          updateMillis: transactionTime,
        });
      });
      userPointRepository.insertOrUpdate.mockImplementation(domain => {
        currentPoint = domain.getPoint();
        return Promise.resolve({
          id: userId,
          point: currentPoint,
          updateMillis: domain.getUpdateMillis(),
        });
      });
      userPointMapper.toDomain.mockReturnValue(userPointDomain);
      userPointMapper.toDto.mockImplementation(
        () => new UserPointResponseDto(userId, currentPoint, transactionTime),
      );

      // when
      const [chargeResult, useResult] = await Promise.all([
        pointService.charge(userId, new PointDto(chargeAmount)),
        pointService.use(userId, new PointDto(useAmount)),
      ]);

      // then
      expect(chargeResult.getPoint()).toBe(800); // 500 + 300
      expect(useResult.getPoint()).toBe(600); // 800 - 200
      expect(userPointRepository.insertOrUpdate).toHaveBeenCalledTimes(2);
    });
  });
  describe('포인트 충전 테스트', () => {
    it('미리 충전되어 있는 포인트가 없을 때, 새로 포인트가 잘 생성되는지 테스트', async () => {
      // given
      const userId = 1;
      const pointDto = new PointDto(100);
      const transactionTime = Date.now();
      const pointHistory: PointHistory = {
        id: 1,
        userId: userId,
        amount: pointDto.amount,
        type: TransactionType.CHARGE,
        timeMillis: transactionTime,
      };

      const userPoint: UserPoint = {
        id: 1,
        point: 100,
        updateMillis: transactionTime,
      };
      const userPointDomain = UserPointDomain.create(userId, pointDto.amount);

      pointHistoryRepository.insert.mockResolvedValueOnce(pointHistory);
      userPointRepository.selectById.mockResolvedValueOnce(null);
      userPointRepository.insertOrUpdate.mockResolvedValueOnce(userPoint);

      // when
      const result = await pointService.charge(userId, pointDto);

      // then
      expect(result).toEqual(userPointMapper.toDto(userPointDomain));
    });

    it('미리 충전되어 있는 포인트가 있을 때, 기존 사용자 포인트 충전 로직이 잘 호출 되는지 테스트', async () => {
      // given
      const userId = 1;
      const pointDto = new PointDto(100);
      const transactionTime = Date.now();
      const userPointDomain = UserPointDomain.create(
        pointDto.amount,
        transactionTime,
      );
      const pointHistory: PointHistory = {
        id: 1,
        userId: userId,
        amount: pointDto.amount,
        type: TransactionType.CHARGE,
        timeMillis: transactionTime,
      };

      const userPoint: UserPoint = {
        id: 1,
        point: 100,
        updateMillis: transactionTime,
      };

      pointHistoryRepository.insert.mockResolvedValueOnce(pointHistory);
      userPointRepository.selectById.mockResolvedValueOnce(userPoint);
      userPointMapper.toDomain.mockReturnValueOnce(userPointDomain);
      userPointRepository.insertOrUpdate.mockResolvedValueOnce(userPoint);

      // when
      const result = await pointService.charge(userId, pointDto);

      // then
      expect(result).toEqual(userPointMapper.toDto(userPointDomain));
    });

    it('동시에 충전 요청이 들어왔을 때, Mutex가 잘 동작하는지 테스트', async () => {
      // given
      const userId = 1;
      const pointDto = new PointDto(100);
      const transactionTime = Date.now();
      const userPointDomain = UserPointDomain.create(
        pointDto.amount,
        transactionTime,
      );
      const pointHistory: PointHistory = {
        id: 1,
        userId: userId,
        amount: pointDto.amount,
        type: TransactionType.CHARGE,
        timeMillis: transactionTime,
      };

      const userPoint: UserPoint = {
        id: 1,
        point: 100,
        updateMillis: transactionTime,
      };

      pointHistoryRepository.insert.mockResolvedValueOnce(pointHistory);
      userPointRepository.selectById.mockResolvedValueOnce(userPoint);
      userPointMapper.toDomain.mockReturnValueOnce(userPointDomain);
      userPointRepository.insertOrUpdate.mockResolvedValueOnce(userPoint);

      // when
      await Promise.all([
        pointService.charge(userId, pointDto),
        pointService.charge(userId, pointDto),
      ]);

      // then
      expect(userPointRepository.insertOrUpdate).toHaveBeenCalledTimes(2);
    });

    it('포인트 충전 시, 포인트 이력이 잘 저장되는지 테스트', async () => {
      // given
      const userId = 1;
      const pointDto = new PointDto(100);
      const transactionTime = Date.now();
      const userPointDomain = UserPointDomain.create(
        pointDto.amount,
        transactionTime,
      );
      const pointHistory: PointHistory = {
        id: 1,
        userId: userId,
        amount: pointDto.amount,
        type: TransactionType.CHARGE,
        timeMillis: transactionTime,
      };

      const userPoint: UserPoint = {
        id: 1,
        point: 100,
        updateMillis: transactionTime,
      };

      pointHistoryRepository.insert.mockResolvedValueOnce(pointHistory);
      userPointRepository.selectById.mockResolvedValueOnce(userPoint);
      userPointMapper.toDomain.mockReturnValueOnce(userPointDomain);
      userPointRepository.insertOrUpdate.mockResolvedValueOnce(userPoint);

      // when
      await pointService.charge(userId, pointDto);

      // then
      expect(pointHistoryRepository.insert).toHaveBeenCalledWith(
        PointHistoryDomain.create(
          userId,
          pointDto.amount,
          TransactionType.CHARGE,
          transactionTime,
        ),
      );
    });
  });

  describe('포인트 사용 테스트', () => {
    it('포인트 사용 시, 사용자 포인트 차감 로직이 잘 호출 되는지 테스트', async () => {
      // given
      const userId = 1;
      const pointDto = new PointDto(100);
      const transactionTime = Date.now();
      const userPointDomain = UserPointDomain.create(
        pointDto.amount,
        transactionTime,
      );
      const pointHistory: PointHistory = {
        id: 1,
        userId: userId,
        amount: pointDto.amount,
        type: TransactionType.USE,
        timeMillis: transactionTime,
      };

      const userPoint: UserPoint = {
        id: 1,
        point: 100,
        updateMillis: transactionTime,
      };

      pointHistoryRepository.insert.mockResolvedValueOnce(pointHistory);
      userPointRepository.selectById.mockResolvedValueOnce(userPoint);
      userPointMapper.toDomain.mockReturnValueOnce(userPointDomain);
      userPointRepository.insertOrUpdate.mockResolvedValueOnce(userPoint);

      // when
      const result = await pointService.use(userId, pointDto);

      // then
      expect(result).toEqual(userPointMapper.toDto(userPointDomain));
    });

    it('포인트 사용 시, 사용자의 포인트가 존재 하지 않을 경우 에러를 반환하는지 테스트', async () => {
      // given
      const userId = 1;
      const pointDto = new PointDto(100);

      userPointRepository.selectById.mockResolvedValueOnce(null);

      // when
      try {
        await pointService.use(userId, pointDto);
      } catch (e) {
        // then
        expect(e.message).toBe('사용자의 포인트가 존재하지 않습니다.');
      }
    });

    it('포인트 사용 시, 포인트 이력이 잘 저장되는지 테스트', async () => {
      // given
      const userId = 1;
      const pointDto = new PointDto(100);
      const transactionTime = Date.now();
      const userPointDomain = UserPointDomain.create(
        pointDto.amount,
        transactionTime,
      );
      const pointHistory: PointHistory = {
        id: 1,
        userId: userId,
        amount: pointDto.amount,
        type: TransactionType.USE,
        timeMillis: transactionTime,
      };

      const userPoint: UserPoint = {
        id: 1,
        point: 100,
        updateMillis: transactionTime,
      };

      pointHistoryRepository.insert.mockResolvedValueOnce(pointHistory);
      userPointRepository.selectById.mockResolvedValueOnce(userPoint);
      userPointMapper.toDomain.mockReturnValueOnce(userPointDomain);
      userPointRepository.insertOrUpdate.mockResolvedValueOnce(userPoint);

      // when
      await pointService.use(userId, pointDto);

      // then
      expect(pointHistoryRepository.insert).toHaveBeenCalledWith(
        PointHistoryDomain.create(
          userId,
          pointDto.amount,
          TransactionType.USE,
          transactionTime,
        ),
      );
    });
  });

  describe('포인트 조회 테스트', () => {
    it('사용자의 포인트 조회 시, 사용자의 포인트가 잘 조회 되는지 테스트', async () => {
      // given
      const userId = 1;
      const userPoint: UserPoint = {
        id: 1,
        point: 100,
        updateMillis: Date.now(),
      };
      const userPointDomain = UserPointDomain.create(
        userPoint.point,
        userPoint.updateMillis,
      );
      userPointRepository.selectById.mockResolvedValueOnce(userPoint);

      // when
      const result = await pointService.getPoint(userId);

      // then
      expect(result).toEqual(userPointMapper.toDto(userPointDomain));
    });
  });

  describe('포인트 이력 조회 테스트', () => {
    it('사용자의 포인트 이력 조회 시, 사용자의 포인트 이력이 잘 조회 되는지 테스트', async () => {
      // given
      const userId = 1;
      const pointHistories: PointHistory[] = [
        {
          id: 1,
          userId: userId,
          amount: 100,
          type: TransactionType.CHARGE,
          timeMillis: Date.now(),
        },
      ];
      const pointHistoryDomains = pointHistories.map(pointHistory =>
        PointHistoryDomain.create(
          pointHistory.userId,
          pointHistory.amount,
          pointHistory.type,
          pointHistory.timeMillis,
        ),
      );
      pointHistoryRepository.selectAllByUserId.mockResolvedValueOnce(
        pointHistories,
      );

      // when
      const result = await pointService.getHistory(userId);

      // then
      expect(result).toEqual(
        pointHistoryDomains.map(pointHistoryDomain =>
          pointHistoryMapper.toDto(pointHistoryDomain),
        ),
      );
    });
  });
});
