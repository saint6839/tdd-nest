import { Injectable } from '@nestjs/common';
import { UserPointDomain } from '../domain/user-point.domain';
import { UserPoint } from '../model/point.model';
import { UserPointResponseDto } from '../dto/user-point/user-point.response.dto';

@Injectable()
export class UserPointMapper {
  toEntity(domain: UserPointDomain): UserPoint {
    return {
      id: domain.getId(),
      point: domain.getPoint(),
      updateMillis: domain.getUpdateMillis(),
    };
  }

  toDomain(entity: UserPoint): UserPointDomain {
    return new UserPointDomain(entity.id, entity.point, entity.updateMillis);
  }

  toDto(domain: UserPointDomain): UserPointResponseDto {
    return new UserPointResponseDto(
      domain.getId(),
      domain.getPoint(),
      domain.getUpdateMillis(),
    );
  }
}
