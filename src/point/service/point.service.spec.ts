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
  });
});
