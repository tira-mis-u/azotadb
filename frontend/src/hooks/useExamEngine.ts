import { useState, useEffect, useCallback, useRef } from 'react';

export interface Violation {
  type: 'TAB_SWITCH' | 'BLUR' | 'FULLSCREEN_EXIT' | 'COPY_PASTE' | 'RIGHT_CLICK';
  timestamp: string;
}

interface ExamEngineOptions {
  examId: string;
  duration: number; // in minutes
  strictMode: boolean;
  fullscreenRequired: boolean;
  onAutoSave?: (answers: Record<string, any>) => void;
  onSubmit?: (answers: Record<string, any>, violations: Violation[]) => void;
}

export function useExamEngine({
  examId,
  duration,
  strictMode,
  fullscreenRequired,
  onAutoSave,
  onSubmit
}: ExamEngineOptions) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save
  useEffect(() => {
    if (isExamStarted && onAutoSave) {
      autoSaveRef.current = setInterval(() => {
        onAutoSave(answers);
      }, 30000); // 30 seconds
    }
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [isExamStarted, answers, onAutoSave]);

  // Timer
  useEffect(() => {
    if (isExamStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto submit when time is up
            if (onSubmit) onSubmit(answers, violations);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamStarted, timeLeft, answers, violations, onSubmit]);

  const addViolation = useCallback((type: Violation['type']) => {
    if (!strictMode || !isExamStarted) return;
    setViolations(prev => [...prev, { type, timestamp: new Date().toISOString() }]);
  }, [strictMode, isExamStarted]);

  // Strict Mode Listeners
  useEffect(() => {
    if (!strictMode || !isExamStarted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        addViolation('TAB_SWITCH');
      }
    };

    const handleBlur = () => {
      addViolation('BLUR');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation('COPY_PASTE');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation('RIGHT_CLICK');
    };

    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs && fullscreenRequired) {
        addViolation('FULLSCREEN_EXIT');
      }
    };

    // Prevent F12, Ctrl+Shift+I, etc.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [strictMode, isExamStarted, fullscreenRequired, addViolation]);

  const startExam = async () => {
    if (fullscreenRequired) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Lỗi khi yêu cầu fullscreen:', err);
        alert('Vui lòng cho phép chế độ toàn màn hình để bắt đầu bài thi.');
        return false;
      }
    }
    setIsExamStarted(true);
    return true;
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitExam = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    setIsExamStarted(false);
    if (onSubmit) onSubmit(answers, violations);
  };

  return {
    answers,
    handleAnswer,
    timeLeft,
    violations,
    isExamStarted,
    startExam,
    submitExam,
    isFullscreen
  };
}
