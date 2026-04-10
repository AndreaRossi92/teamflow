import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/auth.decorators';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.entity';

@ApiTags('AI')
@ApiCookieAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-ticket')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a ticket from a customer request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerRequest: { type: 'string' },
      },
    },
  })
  async generateTicket(@Body() body: { customerRequest: string }) {
    return this.aiService.generateTicket(body.customerRequest);
  }
}
