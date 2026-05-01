import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get(':id')
  getSubmission(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.submissionService.getSubmission(id, userId);
  }

  @Post('start/:examId')
  startSubmission(@Param('examId') examId: string, @GetUser('userId') userId: string) {
    return this.submissionService.startSubmission(examId, userId);
  }

  @Post(':id/autosave')
  autosave(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
    @Body() body: { questionId: string; answer: any }
  ) {
    return this.submissionService.autosave(id, userId, body.questionId, body.answer);
  }

  @Post(':id/submit')
  submitExam(
    @Param('id') id: string, 
    @GetUser('userId') userId: string,
    @Body() body: { violations?: any[]; candidateNumber?: string; examCode?: string }
  ) {
    return this.submissionService.submitExam(id, userId, {
      violations: body.violations,
      candidateNumber: body.candidateNumber,
      examCode: body.examCode
    });
  }

  @Get('my/list')
  getMySubmissions(@GetUser('userId') userId: string) {
    return this.submissionService.getMySubmissions(userId);
  }
}
