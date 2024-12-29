import { Id } from '../../convex/_generated/dataModel';

export type UserRole = 'teacher' | 'student';

// 学生信息接口
export interface Student {
  studentId: string;
  joinedAt: number;
  status: string;
}

// 课程接口
export interface Classroom {
  _id: Id<'classrooms'>;
  code: string;
  name?: string;
  teacherId: string;
  createdAt: number;
  students: Student[];
}

// 任务接口
export interface Task {
  _id: Id<'tasks'>;
  title: string;
  description: string;
  classroomId: Id<'classrooms'>;
  teacherId: string;
  dueDate?: number;
  createdAt: number;
  status: string;
}

// 任务提交接口
export interface TaskSubmission {
  _id: Id<'taskSubmissions'>;
  taskId: Id<'tasks'>;
  studentId: string;
  content: string;
  submittedAt: number;
  status: string;
  grade?: number;
  feedback?: string;
  gradedAt?: number;
  gradedBy?: string;
}
