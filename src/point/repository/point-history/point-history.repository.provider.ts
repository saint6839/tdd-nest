import {
  POINT_HISTORY_REPOSITORY_TOKEN,
  PointHistoryRepository,
} from './point-history.repository';

export const pointHistoryRepositoryProviders = [
  {
    provide: POINT_HISTORY_REPOSITORY_TOKEN,
    useClass: PointHistoryRepository,
  },
];
