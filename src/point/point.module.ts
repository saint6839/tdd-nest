import { Module } from '@nestjs/common';
import { PointController } from './controller/point.controller';
import { DatabaseModule } from 'src/database/database.module';
import { pointHistoryRepositoryProviders } from './repository/point-history/point-history.repository.provider';
import { pointServiceProviders } from './service/point.service.provider';
import { userPointRepositoryProviders } from './repository/user-point/user-point.repository.provider';
import { PointHistoryMapper } from './mapper/point-history.mapper';
import { UserPointMapper } from './mapper/user-point.mapper';

@Module({
  imports: [DatabaseModule],

  controllers: [PointController],

  providers: [
    ...pointServiceProviders,
    ...pointHistoryRepositoryProviders,
    ...userPointRepositoryProviders,
    PointHistoryMapper,
    UserPointMapper,
  ],
})
export class PointModule {}
