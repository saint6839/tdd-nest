import { Injectable } from '@nestjs/common';
import { PointHistory } from 'src/point/model/point.model';
import { PointHistoryDomain } from '../domain/point-history.domain';
import { PointHistoryResponseDto } from '../dto/point-history/point-history.response.dto';

@Injectable()
export class PointHistoryMapper {
  toEntity(domain: PointHistoryDomain): PointHistory {
    return {
      id: domain.getId(),
      userId: domain.getUserId(),
      amount: domain.getAmount(),
      type: domain.getType(),
      timeMillis: domain.getTimeMillis(),
    };
  }

  toDomain(entity: PointHistory): PointHistoryDomain {
    return new PointHistoryDomain(
      entity.id,
      entity.userId,
      entity.amount,
      entity.type,
      entity.timeMillis,
    );
  }

  toDto(domain: PointHistoryDomain): PointHistoryResponseDto {
    return new PointHistoryResponseDto(
      domain.getId(),
      domain.getUserId(),
      domain.getAmount(),
      domain.getType(),
      domain.getTimeMillis(),
    );
  }
}
