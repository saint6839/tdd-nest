import { ApiResponseDto } from './../dto/common/api-response.dto';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { PointBody as PointDto } from '../dto/point.dto';
import { IPointService } from '../service/point.service.interface';
import { UserPointResponseDto } from '../dto/user-point/user-point.response.dto';
import { PointHistoryResponseDto } from '../dto/point-history/point-history.response.dto';
import { POINT_SERVICE_TOKEN } from '../service/point.service';

@Controller('/point')
export class PointController {
  constructor(
    @Inject(POINT_SERVICE_TOKEN) private readonly pointService: IPointService,
  ) {}

  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param('id') id): Promise<ApiResponseDto<UserPointResponseDto>> {
    return new ApiResponseDto(
      true,
      '포인트 조회 성공',
      await this.pointService.getPoint(Number.parseInt(id)),
    );
  }

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(
    @Param('id') id,
  ): Promise<ApiResponseDto<PointHistoryResponseDto[]>> {
    return new ApiResponseDto(
      true,
      '포인트 충전/이용 내역 조회 성공',
      await this.pointService.getHistory(Number.parseInt(id)),
    );
  }

  /**
   * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   */
  @Patch(':id/charge')
  async charge(
    @Param('id') id,
    @Body(ValidationPipe) pointDto: PointDto,
  ): Promise<ApiResponseDto<UserPointResponseDto>> {
    return new ApiResponseDto(
      true,
      '포인트 충전 성공',
      await this.pointService.charge(Number.parseInt(id), pointDto),
    );
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  async use(
    @Param('id') id,
    @Body(ValidationPipe) pointDto: PointDto,
  ): Promise<ApiResponseDto<UserPointResponseDto>> {
    return new ApiResponseDto(
      true,
      '포인트 사용 성공',
      await this.pointService.use(Number.parseInt(id), pointDto),
    );
  }
}
