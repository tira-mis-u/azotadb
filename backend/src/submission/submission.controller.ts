import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  getSubmission(
    @Param('id') id: string,
    @GetUser('userId') userId?: string,
    @Query('guestSessionId') guestSessionId?: string,
  ) {
    return this.submissionService.getSubmission(id, userId, guestSessionId);
  }

  @Post('start/:publicId')
  @UseGuards(OptionalJwtAuthGuard)
  startSubmission(
    @Param('publicId') publicId: string,
    @GetUser('userId') userId?: string,
    @Body() body?: { guestName?: string; guestSessionId?: string },
  ) {
    return this.submissionService.startSubmission(
      publicId,
      userId,
      body?.guestName,
      body?.guestSessionId,
    );
  }

  @Post(':id/autosave')
  @UseGuards(OptionalJwtAuthGuard)
  autosave(
    @Param('id') id: string,
    @Body() body: { questionId: string; answer: any; guestSessionId?: string },
    @GetUser('userId') userId?: string,
  ) {
    if (!body?.questionId) {
      throw new BadRequestException('Question ID is required');
    }
    return this.submissionService.autosave(
      id,
      body.questionId,
      body.answer,
      userId,
      body.guestSessionId,
    );
  }

  @Post(':id/submit')
  @UseGuards(OptionalJwtAuthGuard)
  submitExam(
    @Param('id') id: string,
    @GetUser('userId') userId?: string,
    @Body()
    body?: {
      violations?: any[];
      candidateNumber?: string;
      examCode?: string;
      guestSessionId?: string;
    },
  ) {
    return this.submissionService.submitExam(id, userId, {
      violations: body?.violations,
      candidateNumber: body?.candidateNumber,
      examCode: body?.examCode,
      guestSessionId: body?.guestSessionId,
    });
  }

  @Get('my/list')
  @UseGuards(JwtAuthGuard)
  getMySubmissions(@GetUser('userId') userId: string) {
    return this.submissionService.getMySubmissions(userId);
  }
}
