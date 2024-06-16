import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { PointHistoryRepository } from '../repository/point-history/point-history.repository'; // 실제 리포지토리 가져오기
import { IPointService } from './point.service.interface';
import { POINT_HISTORY_REPOSITORY_TOKEN } from '../repository/point-history/point-history.repository';
import {
  USER_POINT_REPOSITORY_TOKEN,
  UserPointRepository,
} from '../repository/user-point/user-point.repository';
import { DatabaseModule } from 'src/database/database.module';
import { PointHistoryMapper } from '../mapper/point-history.mapper';
import { UserPointMapper } from '../mapper/user-point.mapper';
import { PointBody } from '../dto/point.dto';
import { TransactionType } from '../model/point.model';

describe('PointService', () => {
  let pointService: IPointService;
  let pointHistoryRepository: PointHistoryRepository; // 실제 리포지토리 타입 사용
  let userPointRepository: UserPointRepository;
  let userPointMapper: UserPointMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        PointService,
        PointHistoryRepository,
        {
          provide: POINT_HISTORY_REPOSITORY_TOKEN,
          useClass: PointHistoryRepository,
        },
        UserPointRepository,
        {
          provide: USER_POINT_REPOSITORY_TOKEN,
          useClass: UserPointRepository,
        },
        PointHistoryMapper,
        UserPointMapper,
      ],
    }).compile();

    pointService = module.get<PointService>(PointService);
    pointHistoryRepository = module.get<PointHistoryRepository>(
      POINT_HISTORY_REPOSITORY_TOKEN,
    );
    userPointRepository = module.get<UserPointRepository>(
      USER_POINT_REPOSITORY_TOKEN,
    );
    userPointMapper = module.get<UserPointMapper>(UserPointMapper);
  });

  it('PointService 인스턴스와 이에 연관된 의존성이 잘 정의 되었는지 테스트.', () => {
    expect(pointService).toBeDefined();
  });

  describe('포인트 충전 테스트', () => {
    it('포인트 충전 시, 충전을 요청한 금액만큼 충전이 잘 되는지 테스트', async () => {
      //given
      //when
      const result = await pointService.charge(1, new PointBody(1000));
      //then
      expect(result.getPoint()).toBe(1000);
    });

    it('포인트 충전 시, 충전 이력(PointHistory)가 잘 생성되는지 테스트', async () => {
      //given
      const pointHistoryInsertSpy = jest.spyOn(
        pointHistoryRepository,
        'insert',
      );
      //when
      await pointService.charge(1, new PointBody(1000));
      //then
      expect(pointHistoryInsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          amount: 1000,
          type: TransactionType.CHARGE,
          timeMillis: expect.any(Number),
        }),
      );
      pointHistoryInsertSpy.mockRestore();
    });

    it('포인트를 여러번 충전 했을때 잔액이 올바르게 누적되는지 테스트', async () => {
      //given
      await pointService.charge(1, new PointBody(1000));
      await pointService.charge(1, new PointBody(1000));
      //when
      const result = await pointService.getPoint(1);
      //then
      expect(result.getPoint()).toBe(2000);
    });

    it('포인트를 0원 이하로 충전할 경우 에러가 발생하는지 테스트', async () => {
      //given
      //when
      try {
        await pointService.charge(1, new PointBody(-1000));
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('포인트 금액은 0보다 커야 합니다.');
      }
    });

    it('포인트 충전 시, 동시에 한 사용자의 계정에 대해 여러번의 충전이 발생했을 때 충전이 잘 이루어지는지 테스트', async () => {
      //given
      const chargeSpy = jest.spyOn(pointService, 'charge');
      await Promise.all([
        pointService.charge(1, new PointBody(1000)),
        pointService.charge(1, new PointBody(2000)),
        pointService.charge(1, new PointBody(3000)),
      ]);
      //when
      const result = await pointService.getPoint(1);

      //then
      expect(result.getPoint()).toBe(6000);
      expect(chargeSpy).toHaveBeenCalledTimes(3);
      chargeSpy.mockRestore();
    });

    it('포인트 충전 시, 여러 사용자가 동시에 충전을 요청했을 때 충전이 잘 이루어지는지 테스트', async () => {
      //given
      const chargeSpy = jest.spyOn(pointService, 'charge');
      await Promise.all([
        pointService.charge(1, new PointBody(1000)),
        pointService.charge(2, new PointBody(2000)),
        pointService.charge(3, new PointBody(3000)),
      ]);
      //when
      const result1 = await pointService.getPoint(1);
      const result2 = await pointService.getPoint(2);
      const result3 = await pointService.getPoint(3);

      //then
      expect(result1.getPoint()).toBe(1000);
      expect(result2.getPoint()).toBe(2000);
      expect(result3.getPoint()).toBe(3000);
      expect(chargeSpy).toHaveBeenCalledTimes(3);
      chargeSpy.mockRestore();
    });

    it('userPointMapper.toDomain과 toDto가 올바르게 호출되는지 테스트', async () => {
      //given
      const toDomainSpy = jest.spyOn(userPointMapper, 'toDomain');
      const toDtoSpy = jest.spyOn(userPointMapper, 'toDto');
      //when
      await pointService.charge(1, new PointBody(1000));
      //then
      expect(toDomainSpy).toHaveBeenCalled();
      expect(toDtoSpy).toHaveBeenCalled();
      toDomainSpy.mockRestore();
      toDtoSpy.mockRestore();
    });
  });

  describe('포인트 조회 테스트', () => {
    it('포인트 조회 시, 사용자의 포인트가 올바르게 조회되는지 테스트', async () => {
      //given
      await pointService.charge(1, new PointBody(1000));
      //when
      const result = await pointService.getPoint(1);
      //then
      expect(result.getPoint()).toBe(1000);
    });

    it('포인트 조회 시, 사용자의 포인트가 없을 경우 0을 반환하는지 테스트', async () => {
      //given
      //when
      const result = await pointService.getPoint(1);
      //then
      expect(result.getPoint()).toBe(0);
    });
  });

  describe('포인트 사용 테스트', () => {
    it('포인트 사용 시, 사용한 금액만큼 포인트가 차감되는지 테스트', async () => {
      //given
      await pointService.charge(1, new PointBody(1000));
      //when
      await pointService.use(1, new PointBody(500));
      const result = await pointService.getPoint(1);
      //then
      expect(result.getPoint()).toBe(500);
    });

    it('포인트 사용 시, 사용 이력(PointHistory)가 잘 생성되는지 테스트', async () => {
      //given
      await pointService.charge(1, new PointBody(1000));
      const pointHistoryInsertSpy = jest.spyOn(
        pointHistoryRepository,
        'insert',
      );
      //when
      await pointService.use(1, new PointBody(500));
      //then
      expect(pointHistoryInsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          amount: 500,
          type: TransactionType.USE,
          timeMillis: expect.any(Number),
        }),
      );
      pointHistoryInsertSpy.mockRestore();
    });

    it('포인트를 여러번 사용 했을때 잔액이 올바르게 차감되는지 테스트', async () => {
      //given
      await pointService.charge(1, new PointBody(1000));
      //when
      await pointService.use(1, new PointBody(500));
      await pointService.use(1, new PointBody(300));
      const result = await pointService.getPoint(1);
      //then
      expect(result.getPoint()).toBe(200);
    });

    it('포인트를 보유한 금액보다 사용 금액이 클 경우 에러가 발생하는지 테스트', async () => {
      //given
      await pointService.charge(1, new PointBody(1000));
      //when
      try {
        await pointService.use(1, new PointBody(1500));
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('포인트가 부족합니다.');
      }
    });

    it('포인트를 0원 이하로 사용할 경우 에러가 발생하는지 테스트', async () => {
      //given
      //when
      try {
        await pointService.use(1, new PointBody(-1000));
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('포인트 금액은 0보다 커야 합니다.');
      }
    });

    it('포인트 사용 시, 한 사용자가 동시에 여러번의 사용을 요청했을 때 사용이 잘 이루어지는지 테스트', async () => {
      //given
      await pointService.charge(1, new PointBody(1000));
      const useSpy = jest.spyOn(pointService, 'use');
      await Promise.all([
        pointService.use(1, new PointBody(500)),
        pointService.use(1, new PointBody(300)),
        pointService.use(1, new PointBody(200)),
      ]);
      //when
      const result = await pointService.getPoint(1);
      //then
      expect(result.getPoint()).toBe(0);
      expect(useSpy).toHaveBeenCalledTimes(3);
      useSpy.mockRestore();
    });

    it('포인트 사용 시, 여러 사용자가 동시에 사용을 요청했을 때 사용이 잘 이루어지는지 테스트', async () => {
      //given
      await pointService.charge(1, new PointBody(1000));
      await pointService.charge(2, new PointBody(2000));
      await pointService.charge(3, new PointBody(3000));
      const useSpy = jest.spyOn(pointService, 'use');
      await Promise.all([
        pointService.use(1, new PointBody(500)),
        pointService.use(2, new PointBody(1000)),
        pointService.use(3, new PointBody(2000)),
      ]);
      //when
      const result1 = await pointService.getPoint(1);
      const result2 = await pointService.getPoint(2);
      const result3 = await pointService.getPoint(3);
      //then
      expect(result1.getPoint()).toBe(500);
      expect(result2.getPoint()).toBe(1000);
      expect(result3.getPoint()).toBe(1000);
      expect(useSpy).toHaveBeenCalledTimes(3);
      useSpy.mockRestore();
    });
  });

  describe('포인트 이력 조회 테스트', () => {
    it('포인트 이력 조회 시, 사용자의 모든 포인트 이력이 조회되는지 테스트', async () => {
      //given
      await pointService.charge(1, new PointBody(1000));
      await pointService.use(1, new PointBody(500));
      await pointService.use(1, new PointBody(300));
      //when
      const result = await pointService.getHistory(1);
      //then
      expect(result[0].getType()).toBe(TransactionType.CHARGE);
      expect(result[0].getAmount()).toBe(1000);
      expect(result[1].getType()).toBe(TransactionType.USE);
      expect(result[1].getAmount()).toBe(500);
      expect(result[2].getType()).toBe(TransactionType.USE);
      expect(result[2].getAmount()).toBe(300);
    });
  });

  it('포인트 이력 조회 시, 조회할 이력이 없을 경우 빈 배열을 반환하는지 테스트', async () => {
    //given
    //when
    const result = await pointService.getHistory(1);
    //then
    expect(result).toEqual([]);
  });
});
