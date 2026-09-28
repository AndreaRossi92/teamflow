import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('app')
@ApiTags('App')
@Controller('app')
export class AppController {
  @Get('healthcheck')
  @ApiOperation({ summary: 'Healthcheck' })
  healtcheck() {
    return;
  }
}
