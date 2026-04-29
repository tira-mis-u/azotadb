import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post('start/:examId')
  startSubmission(@Param('examId') examId: string, @GetUser('userId') userId: string) {
    return this.submissionService.startSubmission(examId, userId);
  }

  @Post(':id/submit')
  submitExam(@Param('id') id: string, @Body() answers: Record<string, any>) {
    return this.submissionService.submitExam(id, answers);
  }

  @Get('my')
  getMySubmissions(@GetUser('userId') userId: string) {
    return this.submissionService.getMySubmissions(userId);
  }
}
