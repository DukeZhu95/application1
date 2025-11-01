/**
 * Achievements 组件
 * 显示学生获得的成就/勋章
 */

'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Award, Star, Zap, Trophy, Target, BookOpen, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  earned: boolean;
  earnedAt?: number;
}

export function Achievements() {
  const { user } = useUser();
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // 获取学生的所有任务数据
  const tasks = useQuery(
    api.tasks.getStudentTasks,
    user?.id ? { userId: user.id } : 'skip'
  );

  // 计算成就
  const calculateAchievements = (): Achievement[] => {
    if (!tasks) return [];

    const submittedTasks = tasks.filter(t => t.isSubmitted);
    const gradedTasks = tasks.filter(t => t.grade !== null && t.grade !== undefined);
    const perfectScores = gradedTasks.filter(t => t.grade === 100);
    const highScores = gradedTasks.filter(t => t.grade && t.grade >= 90);

    return [
      {
        id: 'first-submission',
        name: 'First Submission',
        description: 'Submit your first assignment',
        icon: CheckCircle,
        color: 'from-blue-400 to-blue-600',
        earned: submittedTasks.length > 0,
        earnedAt: submittedTasks[0]?._creationTime,
      },
      {
        id: 'top-scorer',
        name: 'Top Scorer',
        description: 'Get a score of 90% or higher',
        icon: Star,
        color: 'from-yellow-400 to-orange-500',
        earned: highScores.length > 0,
        earnedAt: highScores[0]?._creationTime,
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve a perfect score of 100%',
        icon: Trophy,
        color: 'from-purple-400 to-pink-600',
        earned: perfectScores.length > 0,
        earnedAt: perfectScores[0]?._creationTime,
      },
      {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Submit 5 assignments',
        icon: Target,
        color: 'from-green-400 to-emerald-600',
        earned: submittedTasks.length >= 5,
      },
      {
        id: 'scholar',
        name: 'Scholar',
        description: 'Submit 10 assignments',
        icon: BookOpen,
        color: 'from-cyan-400 to-blue-600',
        earned: submittedTasks.length >= 10,
      },
      {
        id: 'overachiever',
        name: 'Overachiever',
        description: 'Get 5 scores above 90%',
        icon: Zap,
        color: 'from-orange-400 to-red-600',
        earned: highScores.length >= 5,
      },
    ];
  };

  const achievements = calculateAchievements();
  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;
  const progress = Math.round((earnedCount / totalCount) * 100);

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Achievements</h2>
        <p className="text-gray-500">Please sign in to view achievements</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* 标题和进度 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">Achievements</h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-600">
            {earnedCount}/{totalCount}
          </p>
          <p className="text-xs text-gray-500">{progress}% Complete</p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 徽章网格 */}
      <div className="grid grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const isHovered = hoveredBadge === achievement.id;

          return (
            <div
              key={achievement.id}
              className="relative group"
              onMouseEnter={() => setHoveredBadge(achievement.id)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              {/* 徽章图标 */}
              <div
                className={`
                  aspect-square rounded-xl flex items-center justify-center
                  transition-all duration-300 cursor-pointer
                  ${achievement.earned
                  ? `bg-gradient-to-br ${achievement.color} shadow-lg hover:scale-110`
                  : 'bg-gray-200 grayscale opacity-40 hover:opacity-60'
                }
                `}
              >
                <Icon
                  className={`w-8 h-8 ${
                    achievement.earned ? 'text-white' : 'text-gray-400'
                  }`}
                />
              </div>

              {/* Hover 详情卡片 */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-gray-900 text-white rounded-lg shadow-xl z-10">
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-1">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-gray-300 mb-2">
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <div className="flex items-center justify-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>Earned!</span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Not earned yet</p>
                    )}
                  </div>
                  {/* 小三角 */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 空状态提示 */}
      {earnedCount === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Complete assignments to unlock achievements! 🎯
          </p>
        </div>
      )}
    </div>
  );
}