import { ApiProperty } from '@nestjs/swagger';

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export function PaginatedResponseDto<T>(
  ItemClass: new (...args: unknown[]) => T,
) {
  abstract class PaginatedResponse {
    @ApiProperty({ type: [ItemClass] })
    data!: T[];

    @ApiProperty({ example: 42 })
    total!: number;

    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 20 })
    limit!: number;

    @ApiProperty({ example: true })
    hasNextPage!: boolean;
  }

  return PaginatedResponse;
}
