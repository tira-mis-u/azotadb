'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/providers/theme-provider';
import axios from 'axios';
import { DataTable } from '@/components/ui/data-table';
import {
  Plus, Search, MoreHorizontal, Edit2, Trash2,
  Copy, Eye, Play, Pause, FileText, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';

interface TeacherExam {
  id: string;
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
        <div className="flex items-center gap-3">
          <div 
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          >
            <FileText size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--foreground)' }} className="font-semibold line-clamp-1">{exam.title}</p>
            <p style={{ color: 'var(--muted-foreground)' }} className="text-xs">Tạo ngày {new Date(exam.createdAt).toLocaleDateString('vi-VN')}</p>
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
          <span 
            style={{ 
              backgroundColor: isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: isPublished ? '#10b981' : '#f59e0b',
              border: `1px solid ${isPublished ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
            }}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          >
            {isPublished ? 'Đang công khai' : 'Bản nháp'}
          </span>
        );
      }
    },
    {
      header: 'Số câu',
      accessorKey: 'qCount',
      cell: (exam: TeacherExam) => (
        <div style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium">
          {exam._count?.questions || 0} câu
        </div>
      )
    },
    {
      header: 'Lượt làm',
      accessorKey: 'sCount',
      cell: (exam: TeacherExam) => (
        <div style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium">
          {exam._count?.submissions || 0} lượt
        </div>
      )
    },
    {
      header: 'Thao tác',
      accessorKey: 'actions',
      cell: (exam: TeacherExam) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleToggleStatus(exam.id)}
            title={exam.status === 'PUBLISHED' ? 'Tạm dừng' : 'Công khai'}
            style={{ color: 'var(--muted-foreground)' }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            {exam.status === 'PUBLISHED' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <Link
            href={`/teacher/exams/${exam.id}/edit`}
            title="Chỉnh sửa"
            style={{ color: 'var(--muted-foreground)' }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDuplicate(exam.id)}
            title="Nhân bản"
            style={{ color: 'var(--muted-foreground)' }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(exam.id)}
            title="Xoá"
            className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader 
        title="Quản lý đề thi" 
        description="Danh sách tất cả các đề thi bạn đã tạo trên hệ thống."
        actions={
          <Link
            href="/teacher/create"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'var(--primary-foreground)',
              boxShadow: theme === 'neon' ? '0 0 15px var(--primary)' : '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Tạo đề thi mới
          </Link>
        }
      />

      {/* Filters/Search */}
      <div 
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        className="p-4 rounded-2xl border shadow-sm mb-6 flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đề thi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              backgroundColor: 'var(--input)', 
              borderColor: 'var(--border)', 
              color: 'var(--foreground)' 
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div 
          style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Tổng số: <span style={{ color: 'var(--primary)' }} className="font-bold">{exams.length}</span> đề thi
        </div>
      </div>

      {/* Content */}
      <DataTable
        columns={columns}
        data={filteredExams}
        isLoading={loading}
        emptyMessage="Bạn chưa có đề thi nào. Hãy bấm 'Tạo đề thi mới' để bắt đầu."
      />
    </div>
  );
}
