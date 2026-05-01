import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
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

  @Get('teacher/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  findByTeacher(@GetUser('userId') userId: string) {
    return this.examService.findByTeacher(userId);
  }

  @Get('teacher/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  getTeacherQuestions(@GetUser('userId') userId: string) {
    return this.examService.getTeacherQuestions(userId);
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  update(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
    @Body() dto: Partial<CreateExamDto>,
  ) {
    return this.examService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.examService.remove(id, userId);
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  duplicate(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.examService.duplicate(id, userId);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  toggleStatus(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.examService.toggleStatus(id, userId);
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

  @Patch('teacher/questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  updateQuestion(
    @Param('questionId') questionId: string,
    @GetUser('userId') userId: string,
    @Body() body: any,
  ) {
    return this.examService.updateQuestion(questionId, userId, body);
  }

  @Delete('teacher/questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  deleteQuestion(
    @Param('questionId') questionId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.examService.deleteQuestion(questionId, userId);
  }
}
