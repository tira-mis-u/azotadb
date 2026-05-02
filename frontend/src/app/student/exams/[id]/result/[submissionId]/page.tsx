'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ExamResult } from '@/components/ui/exam-result';
import { THPTQGExamLayout } from '@/components/ui/thptqg-exam-layout';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string, token: string) => 
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

export default function ExamResultPage() {
  const { id: examId, submissionId } = useParams();
  const searchParams = useSearchParams();
  const guestSessionId = searchParams.get('guestSessionId');
  const { session } = useAuth();
  const router = useRouter();
  
  const [showDetails, setShowDetails] = useState(false);

  const { data: submission, error, isLoading } = useSWR(
    (session?.access_token || guestSessionId) && submissionId 
      ? [`/api/submissions/${submissionId}${guestSessionId ? `?guestSessionId=${guestSessionId}` : ''}`, session?.access_token] 
      : null,
    ([url, token]) => {
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return axios.get(url, { headers }).then(res => res.data);
    }
  );

  if (isLoading || !submission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải kết quả...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-red-500">
        Đã có lỗi xảy ra. Không thể tải kết quả.
      </div>
    );
  }

  const exam = submission.exam;

  if (showDetails && exam.allowAnswerReview) {
    // Reconstruct answers map
    const answersMap: Record<string, any> = {};
    submission.answers?.forEach((ans: any) => {
      answersMap[ans.questionId] = ans.studentAnswer;
    });

    return (
      <div className="relative">
        <THPTQGExamLayout 
          exam={exam}
          questions={exam.questions}
          answers={answersMap}
          onAnswer={() => {}} // Read-only
          timeLeft={0}
          onSubmit={() => setShowDetails(false)}
          violations={submission.violations || []}
          reviewMode={true}
        />
        {/* Overlay block to disable interactions if needed, but it's better to add a reviewMode prop to layout. For now, onAnswer does nothing. */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={() => setShowDetails(false)}
            className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold shadow-xl border border-gray-700 hover:bg-black transition-colors"
          >
            Đóng xem lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExamResult 
      exam={exam} 
      submission={submission} 
      onViewDetails={() => setShowDetails(true)} 
    />
  );
}
