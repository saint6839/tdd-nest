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

describe('PointService', () => {
  let pointService: IPointService;
  let pointHistoryRepository: PointHistoryRepository; // 실제 리포지토리 타입 사용
  let userPointRepository: UserPointRepository;

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
  });

  it('PointService 인스턴스와 이에 연관된 의존성이 잘 정의 되었는지 테스트.', () => {
    expect(pointService).toBeDefined();
  });

  describe('포인트 충전 테스트', () => {
    it('포인트 충전 시 PointHistoryRepository.insert() 메서드가 호출되는지 테스트', async () => {
      const spy = jest.spyOn(pointHistoryRepository, 'insert');
      await pointService.charge(1, 1000);
      expect(spy).toBeCalled();
    });

    it('포인트 충전 시 UserPointRepository.insertOrUpdate() 메서드가 호출되는지 테스트', async () => {
      const spy = jest.spyOn(pointService, 'charge');
      await pointService.charge(1, 1000);
      expect(spy).toBeCalled();
    });
  });
});
