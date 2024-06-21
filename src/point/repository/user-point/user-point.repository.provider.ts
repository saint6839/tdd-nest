import {
  USER_POINT_REPOSITORY_TOKEN,
  UserPointRepository,
} from './user-point.repository';

export const userPointRepositoryProviders = [
  {
    provide: USER_POINT_REPOSITORY_TOKEN,
    useClass: UserPointRepository,
  },
];
