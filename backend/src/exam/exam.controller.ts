import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  create(@GetUser('userId') userId: string, @Body() dto: CreateExamDto) {
    return this.examService.create(userId, dto);
  }

  @Get()
  findAll() {
    return this.examService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
    @GetUser('role') role: string,
  ) {
    return this.examService.findOne(id, userId, role);
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  addQuestions(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
    @Body() questions: any[],
  ) {
    return this.examService.addQuestions(id, userId, questions);
  }
}
