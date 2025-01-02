'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import { ClassCodeInput } from '@/app/components/shared/class-code-input';
import { Button } from '@/app/components/ui/button';
import { CreateTaskForm } from '@/app/dashboard/teacher/create-task-form';

export default function TeacherDashboard() {
  const { user } = useUser();
  const [currentClass, setCurrentClass] = useState<string | null>(null);
  const router = useRouter();
  const classes = useQuery(api.classes.getTeacherClasses, {
    teacherId: user?.id || '',
  });
  const [className, setClassName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const createClass = useMutation(api.classes.createClass);

  const handleClassCreated = async (code: string) => {
    if (!user || !className.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a class name',
      });
      return;
    }

    setIsCreating(true);
    try {
      await createClass({
        code,
        teacherId: user.id,
        name: className.trim(),
      });

      setFeedback({
        type: 'success',
        message: `Class "${className}" created successfully with code: ${code}`,
      });
      setClassName('');
    } catch {
      // 移除未使用的 error 参数
      setFeedback({
        type: 'error',
        message: 'Failed to create class. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="container">
          <div className="nav-content">
            <h1>Teacher Dashboard</h1>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="dashboard-sections">
          {/* 创建新班级部分 */}
          <section className="dashboard-section">
            {/*<h2>Create New Class</h2>*/}
            {feedback && (
              <div className={`feedback-message ${feedback.type}`}>
                {feedback.message}
              </div>
            )}
            <div className="form-group">
              {/*<div>*/}
              {/*  <label htmlFor="className">(Not Class Code)</label>*/}
              {/*  <input*/}
              {/*    type="text"*/}
              {/*    id="className"*/}
              {/*    value={className}*/}
              {/*    onChange={(e) => setClassName(e.target.value)}*/}
              {/*    className="form-input"*/}
              {/*    placeholder="Enter class name"*/}
              {/*    disabled={isCreating}*/}
              {/*  />*/}
              {/*</div>*/}
              <ClassCodeInput
                userRole="teacher"
                onClassCreated={handleClassCreated}
                isDisabled={isCreating}
              />
            </div>
          </section>

          {/* 班级列表部分 */}
          <section className="dashboard-section">
            <h2>Your Classes</h2>
            {classes === undefined ? (
              <p className="status-message">Loading classes...</p>
            ) : classes.length === 0 ? (
              <p className="status-message">No classes created yet.</p>
            ) : (
              <div className="class-grid">
                {classes.map((classItem) => (
                  <div key={classItem._id} className="class-card">
                    <div className="class-card-header">
                      <h3>{classItem.name}</h3>
                      <p className="class-code">Code: {classItem.code}</p>
                      <p className="student-count">
                        {classItem.students.length} student(s)
                      </p>
                    </div>

                    <div className="class-card-actions">
                      <Button
                        onClick={() =>
                          router.push(
                            `/dashboard/teacher/class/${classItem._id}`
                          )
                        }
                        variant="outline"
                        className="action-button"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => setCurrentClass(classItem._id)}
                        className="action-button primary"
                      >
                        Create Task
                      </Button>
                    </div>

                    {currentClass === classItem._id && (
                      <CreateTaskForm
                        classId={classItem._id}
                        onClose={() => setCurrentClass(null)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
