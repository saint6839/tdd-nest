import { POINT_SERVICE_TOKEN, PointService } from './point.service';

export const pointServiceProviders = [
  {
    provide: POINT_SERVICE_TOKEN,
    useClass: PointService,
  },
];
