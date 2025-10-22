'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';
import { X, Upload } from 'lucide-react';
import '@/styles/components/teacher-profile-editor.css';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeacherProfile {
  firstName: string;
  lastName: string;
  bio: string;
  city: string;
  country: string;
  specialization: string;
  teachingPhilosophy: string;
  avatar: string | null;
}

export function TeacherProfileEditor({ isOpen, onClose }: ProfileEditorProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<TeacherProfile | null>(null);
  const [formData, setFormData] = useState<TeacherProfile>({
    firstName: '',
    lastName: '',
    bio: '',
    city: '',
    country: '',
    specialization: '',
    teachingPhilosophy: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profile = useQuery(
    api.teachers.getTeacherProfile,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  const updateProfile = useMutation(api.teachers.updateTeacherProfile);

  useEffect(() => {
    if (profile) {
      const data = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        city: profile.city || '',
        country: profile.country || '',
        specialization: profile.specialization || '',
        teachingPhilosophy: profile.teachingPhilosophy || '',
        avatar: profile.avatar || null,
      };
      setFormData(data);
      setOriginalData(data);
      setAvatarPreview(profile.avatar || null);
      setHasChanges(false);
    }
  }, [profile, isOpen]);

  // 检测表单是否有修改
  useEffect(() => {
    if (originalData) {
      const changed =
        formData.firstName !== originalData.firstName ||
        formData.lastName !== originalData.lastName ||
        formData.bio !== originalData.bio ||
        formData.city !== originalData.city ||
        formData.country !== originalData.country ||
        formData.specialization !== originalData.specialization ||
        formData.teachingPhilosophy !== originalData.teachingPhilosophy ||
        formData.avatar !== originalData.avatar;
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  // 晃动模态窗
  const shakeModal = () => {
    const modal = document.querySelector('.profile-editor-modal');
    if (modal) {
      modal.classList.add('shake');
      setTimeout(() => {
        modal.classList.remove('shake');
      }, 500);
    }
  };

  // 处理点击外部区域
  const handleOverlayClick = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (confirmed) {
        setHasChanges(false);
        onClose();
      } else {
        shakeModal();
      }
    } else {
      shakeModal();
      toast('Please use the CANCEL or X button to close', {
        icon: '👇',
        duration: 2000,
      });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData((prev) => ({ ...prev, avatar: base64String }));
      setAvatarPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (!formData.firstName.trim()) {
      toast.error('Please enter your first name');
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error('Please enter your last name');
      return;
    }

    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return;
    }

    if (!formData.country.trim()) {
      toast.error('Please enter your country');
      return;
    }

    try {
      setIsLoading(true);

      const avatarToSend = formData.avatar ? formData.avatar : undefined;

      await updateProfile({
        teacherId: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        city: formData.city,
        country: formData.country,
        specialization: formData.specialization,
        teachingPhilosophy: formData.teachingPhilosophy,
        avatar: avatarToSend,
      });

      toast.success('Profile updated successfully! 🎉');

      setHasChanges(false);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="profile-editor-overlay" onClick={handleOverlayClick}>
      <div className="profile-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-editor-header">
          <h2>Edit Profile</h2>
          <button
            className="profile-editor-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-editor-form">
          <div className="profile-editor-avatar-section">
            <div className="profile-editor-avatar-container">
              <div className="profile-editor-avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <label className="profile-editor-avatar-upload">
                <Upload size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isLoading}
                />
              </label>
            </div>
            <p className="profile-editor-avatar-help">
              Click camera to upload avatar
            </p>
          </div>

          <div className="profile-editor-email-display">
            <div>
              <p className="profile-editor-email-label">Primary Email</p>
              <p className="profile-editor-email-value">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <span className="profile-editor-email-badge">Primary</span>
          </div>

          <div className="profile-editor-form-row">
            <div className="profile-editor-form-group">
              <label htmlFor="firstName">First Name *</label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                disabled={isLoading}
                required
              />
              <small>Your name as displayed on the platform</small>
            </div>

            <div className="profile-editor-form-group">
              <label htmlFor="lastName">Last Name *</label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="profile-editor-form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              placeholder="Tell others about yourself..."
              value={formData.bio}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  setFormData((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }));
                }
              }}
              disabled={isLoading}
              maxLength={200}
              className="profile-editor-textarea"
            />
            <div className="profile-editor-char-count">
              {formData.bio.length}/200
            </div>
            <small>Maximum 200 characters</small>
          </div>

          <div className="profile-editor-form-row">
            <div className="profile-editor-form-group">
              <label htmlFor="city">City *</label>
              <Input
                id="city"
                type="text"
                placeholder="e.g., Auckland"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                disabled={isLoading}
                required
              />
            </div>

            <div className="profile-editor-form-group">
              <label htmlFor="country">Country/Region *</label>
              <Input
                id="country"
                type="text"
                placeholder="e.g., New Zealand"
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="profile-editor-form-group">
            <label htmlFor="specialization">Specialization/Subject</label>
            <select
              id="specialization"
              value={formData.specialization}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  specialization: e.target.value,
                }))
              }
              disabled={isLoading}
              className="profile-editor-select"
            >
              <option value="">-- Please select --</option>
              <option value="Guitar">Guitar</option>
              <option value="Ukulele">Ukulele</option>
              <option value="Music Theory">Music Theory</option>
              <option value="Piano">Piano</option>
              <option value="Vocal">Vocal</option>
              <option value="Drums">Drums</option>
              <option value="Others">Other</option>
            </select>
            <small>Select your teaching specialization</small>
          </div>

          <div className="profile-editor-form-group">
            <label htmlFor="teachingPhilosophy">Teaching Philosophy</label>
            <textarea
              id="teachingPhilosophy"
              placeholder="What's your teaching philosophy?"
              value={formData.teachingPhilosophy}
              onChange={(e) => {
                if (e.target.value.length <= 300) {
                  setFormData((prev) => ({
                    ...prev,
                    teachingPhilosophy: e.target.value,
                  }));
                }
              }}
              disabled={isLoading}
              maxLength={300}
              className="profile-editor-textarea"
            />
            <div className="profile-editor-char-count">
              {formData.teachingPhilosophy.length}/300
            </div>
            <small>Maximum 300 characters</small>
          </div>

          <div className="profile-editor-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="profile-editor-btn-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="profile-editor-btn-submit"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
}