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

describe('PointService', () => {
  let pointService: IPointService;
  let pointHistoryRepository: PointHistoryRepository; // 실제 리포지토리 타입 사용

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
      ],
    }).compile();

    pointService = module.get<PointService>(PointService);
    pointHistoryRepository = module.get<PointHistoryRepository>(
      PointHistoryRepository,
    );
  });

  it('PointService 인스턴스와 이에 연관된 의존성이 잘 정의 되었는지 테스트.', () => {
    expect(pointService).toBeDefined();
  });
});
