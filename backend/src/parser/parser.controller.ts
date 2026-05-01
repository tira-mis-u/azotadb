import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ParserService } from './parser.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('parser')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER', 'ADMIN')
export class ParserController {
  constructor(
    private readonly parserService: ParserService,
    private prisma: PrismaService,
  ) {}

  @Post('upload')
  async uploadFile(
    @GetUser('userId') userId: string,
    @Body() body: { fileUrl: string },
  ) {
    return this.prisma.uploadedFile.create({
      data: {
        userId,
        fileUrl: body.fileUrl,
        status: 'PENDING',
      },
    });
  }

  @Post('process/:id')
  async processFile(@Param('id') id: string) {
    return this.parserService.processFile(id);
  }

  @Get('file/:id')
  async getFile(@Param('id') id: string) {
    return this.prisma.uploadedFile.findUnique({
      where: { id },
    });
  }
}
