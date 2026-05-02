'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/providers/theme-provider';
import axios from 'axios';
import { DataTable } from '@/components/ui/data-table';
import {
  Plus, Search, MoreHorizontal, Edit2, Trash2,
  Copy, Eye, Play, Pause, FileText, AlertCircle, Calendar, Users, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

interface TeacherExam {
  id: string;
  publicId: string;
  title: string;
  createdAt: string;
  status: 'DRAFT' | 'PUBLISHED';
  _count: {
    questions: number;
    submissions: number;
  };
}

export default function TeacherExamsPage() {
  const { session } = useAuth();
  const { theme } = useTheme();
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExams = async () => {
    if (!session?.access_token) return;
    try {
      const res = await axios.get<TeacherExam[]>('/api/exams/teacher/my', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setExams(res.data);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá đề thi này?')) return;
    try {
      await axios.delete(`/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setExams(exams.filter(e => e.id !== id));
    } catch (err) {
      alert('Xoá thất bại');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await axios.post(`/api/exams/${id}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      fetchExams();
    } catch (err) {
      alert('Nhân bản thất bại');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await axios.patch(`/api/exams/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      fetchExams();
    } catch (err) {
      alert('Thay đổi trạng thái thất bại');
    }
  };

  const filteredExams = exams.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: 'Tên đề thi',
      accessorKey: 'title',
      cell: (exam: TeacherExam) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <FileText size={24} />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-foreground line-clamp-1 text-base tracking-tight">{exam.title}</p>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
               <Calendar size={12} /> {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: (exam: TeacherExam) => {
        const isPublished = exam.status === 'PUBLISHED';
        return (
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
            isPublished 
              ? "bg-success/10 text-success border-success/30" 
              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
          )}>
            {isPublished ? 'Đang công khai' : 'Bản nháp'}
          </span>
        );
      }
    },
    {
      header: 'Thống kê',
      accessorKey: 'stats',
      cell: (exam: TeacherExam) => (
        <div className="flex flex-col gap-1.5">
           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <FileText size={14} className="text-primary" />
              <span>{exam._count?.questions || 0} câu</span>
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Users size={14} className="text-success" />
              <span>{exam._count?.submissions || 0} lượt thi</span>
           </div>
        </div>
      )
    },
    {
      header: 'Thao tác',
      accessorKey: 'actions',
      cell: (exam: TeacherExam) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleStatus(exam.id)}
            title={exam.status === 'PUBLISHED' ? 'Tạm dừng' : 'Công khai'}
            className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
          >
            {exam.status === 'PUBLISHED' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <Link
            href={`/teacher/exams/${exam.id}/edit`}
            title="Chỉnh sửa"
            className="p-2.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
          >
            <Edit2 className="w-5 h-5" />
          </Link>
          <button
            onClick={() => handleDuplicate(exam.id)}
            title="Nhân bản"
            className="p-2.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (!exam.publicId) {
                 alert('Bài thi này chưa có Public ID do được tạo từ trước. Vui lòng cập nhật hoặc nhân bản để có link chia sẻ!');
                 return;
              }
              const url = `${window.location.origin}/student/exams/${exam.publicId}/take`;
              navigator.clipboard.writeText(url);
              alert('Đã copy link bài thi: ' + url);
            }}
            title="Copy link chia sẻ"
            className="p-2.5 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
          >
            <LinkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(exam.id)}
            title="Xoá"
            className="p-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Integrated Header & Toolbar */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">Quản lý đề thi</h1>
              <p className="text-sm font-bold text-muted-foreground opacity-70 uppercase tracking-widest">Tổ chức và theo dõi hiệu quả các bộ đề của bạn</p>
            </div>
            <Link
              href="/teacher/create"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl shadow-primary/30"
            >
              <Plus className="w-5 h-5" /> TẠO ĐỀ THI MỚI
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
              <input
                type="text"
                placeholder="TÌM KIẾM THEO TIÊU ĐỀ BÀI THI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-background border border-border rounded-[2rem] text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 placeholder:font-black placeholder:uppercase placeholder:tracking-[0.15em] shadow-inner"
              />
            </div>
            <div className="flex items-center gap-4 px-8 py-5 bg-muted/50 rounded-[1.5rem] border border-border text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
              <AlertCircle className="w-5 h-5 text-primary animate-pulse" />
              TỔNG SỐ ĐỀ THI: <span className="text-primary text-base ml-2 font-black">{exams.length}</span>
            </div>
          </div>
        </div>
        
        {/* DataTable starts directly below toolbar with no gap */}
        <div className="border-t border-border/50">
          <DataTable
            columns={columns}
            data={filteredExams}
            isLoading={loading}
            emptyMessage="Danh sách đang trống. Hãy tạo đề thi đầu tiên của bạn!"
          />
        </div>
      </div>
    </div>
  );
}
