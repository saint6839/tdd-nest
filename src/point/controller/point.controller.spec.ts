import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PointBody as PointDto } from '../dto/point.dto';

describe('PointController e2e test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/point/:id (GET)', () => {
    it('저장되어있는 사용자 포인트가 없을 경우에는 0을 반환한다.', async () => {
      //given
      const userId = 1;

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}`,
      );

      //then
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.point).toBe(0);
    });

    it('저장되어있는 사용자 포인트가 있을 경우에는 해당 포인트를 반환한다.', async () => {
      //given
      const userId = 2;
      await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send(new PointDto(100));

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}`,
      );

      //then
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.point).toBe(100);
    });

    it('userId가 숫자가 아닌 경우 500을 반환한다.', async () => {
      //given
      const userId = 'string';

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}`,
      );
      //then
      expect(response.status).toBe(500);
    });

    it('userId가 0보다 작은 경우 500을 반환한다.', async () => {
      //given
      const userId = -1;

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}`,
      );

      //then
      expect(response.status).toBe(500);
    });

    it('userId가 0인 경우 500을 반환한다.', async () => {
      //given
      const userId = 0;

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}`,
      );

      //then
      expect(response.status).toBe(500);
    });
  });

  describe('/point/:id/histories (GET)', () => {
    it('포인트 이력이 없을 경우 빈 배열을 반환한다.', async () => {
      //given
      const userId = 3;

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}/histories`,
      );

      //then
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('포인트 이력이 있을 경우 해당 이력을 반환한다.', async () => {
      //given
      const userId = 4;
      await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send(new PointDto(100));

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}/histories`,
      );

      //then
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].amount).toBe(100);
    });

    it('userId가 숫자가 아닌 경우 500을 반환한다.', async () => {
      //given
      const userId = 'string';

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}/histories`,
      );

      //then
      expect(response.status).toBe(500);
    });

    it('userId가 0보다 작은 경우 500을 반환한다.', async () => {
      //given
      const userId = -1;

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}/histories`,
      );

      //then
      expect(response.status).toBe(500);
    });

    it('userId가 0인 경우 500을 반환한다.', async () => {
      //given
      const userId = 0;

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}/histories`,
      );

      //then
      expect(response.status).toBe(500);
    });

    it('userId가 숫자가 아닌 경우 500을 반환한다.', async () => {
      //given
      const userId = 'string';

      //when
      const response = await request(app.getHttpServer()).get(
        `/point/${userId}/histories`,
      );

      //then
      expect(response.status).toBe(500);
    });
  });

  describe('/point/:id/charge (PATCH)', () => {
    it('포인트를 충전한다.', async () => {
      //given
      const userId = 5;
      const amount = 100;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(200);
      expect(response.body.data.point).toBe(amount);
    });

    it('userId가 숫자가 아닌 경우 500을 반환한다.', async () => {
      //given
      const userId = 'string';
      const amount = 100;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(500);
    });

    it('userId가 0보다 작은 경우 500을 반환한다.', async () => {
      //given
      const userId = -1;
      const amount = 100;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(500);
    });

    it('userId가 0인 경우 500을 반환한다.', async () => {
      //given
      const userId = 0;
      const amount = 100;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(500);
    });

    it('amount가 0보다 작은 경우 400을 반환한다.', async () => {
      //given
      const userId = 7;
      const amount = -1;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(400);
    });
  });

  describe('/point/:id/use (PATCH)', () => {
    it('포인트를 사용한다.', async () => {
      //given
      const userId = 8;
      const amount = 100;
      await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send(new PointDto(amount));

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send(new PointDto(50));

      //then
      expect(response.status).toBe(200);
      expect(response.body.data.point).toBe(50);
    });

    it('userId가 숫자가 아닌 경우 500을 반환한다.', async () => {
      //given
      const userId = 'string';
      const amount = 100;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(500);
    });

    it('userId가 0보다 작은 경우 500을 반환한다.', async () => {
      //given
      const userId = -1;
      const amount = 100;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(500);
    });

    it('userId가 0인 경우 500을 반환한다.', async () => {
      //given
      const userId = 0;
      const amount = 100;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(500);
    });

    it('amount가 0보다 작은 경우 400을 반환한다.', async () => {
      //given
      const userId = 9;
      const amount = -1;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(400);
    });

    it('포인트가 부족한 경우 500을 반환한다.', async () => {
      //given
      const userId = 10;
      const amount = 100;

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send(new PointDto(amount));

      //then
      expect(response.status).toBe(500);
    });

    it('포인트가 부족하지 않은 경우 200을 반환한다.', async () => {
      //given
      const userId = 11;
      const amount = 100;
      await request(app.getHttpServer())
        .patch(`/point/${userId}/charge`)
        .send(new PointDto(amount));

      //when
      const response = await request(app.getHttpServer())
        .patch(`/point/${userId}/use`)
        .send(new PointDto(amount - 50));

      //then
      expect(response.status).toBe(200);
    });
  });
});
