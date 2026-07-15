import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { Ticket } from './ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignUsersDto } from './dto/assign-ticket-users.dto';
import { ListTicketsDto } from './dto/list-tickets.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { Role } from '../users/user.entity';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { Paginated, PaginatedResponseDto } from '../paginated-response.dto';

class PaginatedTicketsResponse extends PaginatedResponseDto(Ticket) {}

@ApiTags('Tickets')
@ApiCookieAuth()
@Controller('tickets')
@UseGuards(JwtGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({
    summary:
      'List tickets — admin sees all, manager sees project tickets, dev sees assigned tickets',
  })
  @ApiOkResponse({ type: PaginatedTicketsResponse })
  findAll(
    @Req() req: Request,
    @Query() query: ListTicketsDto,
  ): Promise<Paginated<Ticket>> {
    return this.ticketsService.findAllForUser(req.user as JwtUser, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single ticket (access-guarded)' })
  @ApiOkResponse({ type: Ticket })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiForbiddenResponse({ description: 'No access to this ticket' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<Ticket> {
    return this.ticketsService.findOneForUser(id, req.user as JwtUser);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a ticket (admin or assigned manager)' })
  @ApiCreatedResponse({ type: Ticket })
  create(@Body() dto: CreateTicketDto, @Req() req: Request): Promise<Ticket> {
    return this.ticketsService.createTicket(dto, req.user as JwtUser);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a ticket (admin or assigned manager)' })
  @ApiOkResponse({ type: Ticket })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiForbiddenResponse({ description: 'No access to this ticket' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
    @Req() req: Request,
  ): Promise<Ticket> {
    return this.ticketsService.updateTicket(id, dto, req.user as JwtUser);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Update ticket status — all roles with project access; dev limited to assigned tickets',
  })
  @ApiOkResponse({ type: Ticket })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiForbiddenResponse({ description: 'No access to this ticket' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketStatusDto,
    @Req() req: Request,
  ): Promise<Ticket> {
    return this.ticketsService.updateTicketStatus(id, dto, req.user as JwtUser);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary:
      'Replace assignee list (admin or assigned manager) — users must be project members',
  })
  @ApiOkResponse({ type: Ticket })
  @ApiNotFoundResponse({ description: 'Ticket or user not found' })
  @ApiForbiddenResponse({ description: 'No access to this ticket' })
  assignUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignUsersDto,
    @Req() req: Request,
  ): Promise<Ticket> {
    return this.ticketsService.assignUsers(id, dto, req.user as JwtUser);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a ticket (admin or assigned manager)' })
  @ApiNoContentResponse({ description: 'Ticket deleted successfully' })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiForbiddenResponse({ description: 'No access to this ticket' })
  async deleteTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    await this.ticketsService.deleteTicket(id, req.user as JwtUser);
  }
}
