import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('AI')
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
