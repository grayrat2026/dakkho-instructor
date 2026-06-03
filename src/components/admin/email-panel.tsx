'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Mail, FileText, Users, BookOpen, CreditCard, Award,
  Bell, BarChart3, AlertTriangle, GraduationCap, Video,
  MessageSquare, Heart, Star, Sparkles, Search, X, Eye, ArrowLeft,
  Shield, Target, Megaphone, UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiPost, ApiError } from '@/lib/api-client';

// ─── Email Templates ───

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  html: string;
  variables: string[];
}

const TEMPLATES: EmailTemplate[] = [
  // Welcome & Onboarding
  {
    id: 'welcome-student',
    name: 'Welcome New Student',
    description: 'Greet a new student joining the platform',
    category: 'Welcome & Onboarding',
    subject: 'Welcome to DAKKHO, {{studentName}}! 🎉',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to DAKKHO!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #00D4AA;">Hey {{studentName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">We're thrilled to have you on board! DAKKHO is your gateway to world-class learning in Bangla. Start exploring courses, connect with instructors, and begin your learning journey today.</p>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Explore Courses</a>
        <p style="color: #64748B; font-size: 13px; margin-top: 30px;">If you have any questions, reach out to us at support@dakkho.pro.bd</p>
      </div>
    </div>`,
    variables: ['studentName', 'dashboardUrl'],
  },
  {
    id: 'welcome-instructor',
    name: 'Welcome New Instructor',
    description: 'Welcome a new instructor to the platform',
    category: 'Welcome & Onboarding',
    subject: 'Welcome to DAKKHO as an Instructor, {{instructorName}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">You're an Instructor Now!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{instructorName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Congratulations on becoming a DAKKHO instructor! You can now create courses, upload videos, and share your knowledge with thousands of students across Bangladesh.</p>
        <a href="{{instructorDashboard}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Go to Instructor Panel</a>
      </div>
    </div>`,
    variables: ['instructorName', 'instructorDashboard'],
  },
  {
    id: 'account-verified',
    name: 'Account Verified',
    description: 'Notify user their account has been verified',
    category: 'Welcome & Onboarding',
    subject: 'Your DAKKHO Account is Verified!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">✅ Account Verified!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Great news, {{userName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your DAKKHO account has been successfully verified. You now have full access to all platform features including course enrollment, community discussions, and more.</p>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Start Learning</a>
      </div>
    </div>`,
    variables: ['userName', 'dashboardUrl'],
  },
  {
    id: 'email-verification',
    name: 'Email Verification',
    description: 'Send email verification link',
    category: 'Welcome & Onboarding',
    subject: 'Verify your DAKKHO email address',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📧 Verify Your Email</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hello {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Please verify your email address to complete your DAKKHO account setup. Click the button below to verify:</p>
        <a href="{{verificationUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Verify Email</a>
        <p style="color: #64748B; font-size: 13px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
      </div>
    </div>`,
    variables: ['userName', 'verificationUrl'],
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Send password reset link',
    category: 'Welcome & Onboarding',
    subject: 'Reset your DAKKHO password',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hello {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">We received a request to reset your DAKKHO password. Click the button below to set a new password:</p>
        <a href="{{resetUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Reset Password</a>
        <p style="color: #64748B; font-size: 13px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    </div>`,
    variables: ['userName', 'resetUrl'],
  },
  {
    id: 'profile-setup-reminder',
    name: 'Profile Setup Reminder',
    description: 'Remind user to complete their profile',
    category: 'Welcome & Onboarding',
    subject: 'Complete your DAKKHO profile, {{userName}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">👤 Complete Your Profile</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your DAKKHO profile is almost complete! Adding a profile picture and bio helps instructors and peers recognize you. Complete your profile now to unlock all features.</p>
        <a href="{{profileUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Complete Profile</a>
      </div>
    </div>`,
    variables: ['userName', 'profileUrl'],
  },
  {
    id: 'first-enrollment',
    name: 'First Course Enrollment',
    description: 'Celebrate user enrolling in their first course',
    category: 'Welcome & Onboarding',
    subject: 'You just enrolled in your first course! 🎓',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎓 First Course!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Awesome, {{studentName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You just enrolled in <strong style="color: #fff;">{{courseName}}</strong>. Your learning journey has officially begun! Here are some tips to get started:</p>
        <ul style="color: #94A3B8; line-height: 2;"><li>Set a regular study schedule</li><li>Take notes as you watch videos</li><li>Join the course discussion</li></ul>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Start Learning</a>
      </div>
    </div>`,
    variables: ['studentName', 'courseName', 'courseUrl'],
  },
  {
    id: 'course-completion',
    name: 'Course Completion Congratulations',
    description: 'Celebrate course completion',
    category: 'Welcome & Onboarding',
    subject: 'Congratulations on completing {{courseName}}! 🏆',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🏆 Course Completed!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Amazing work, {{studentName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You've successfully completed <strong style="color: #fff;">{{courseName}}</strong>! Your dedication and hard work have paid off. Keep learning and growing!</p>
        <a href="{{certificateUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Certificate</a>
      </div>
    </div>`,
    variables: ['studentName', 'courseName', 'certificateUrl'],
  },

  // Course Updates
  {
    id: 'new-course-announcement',
    name: 'New Course Announcement',
    description: 'Announce a new course to students',
    category: 'Course Updates',
    subject: '🆕 New Course: {{courseName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">New Course Alert!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #00D4AA;">{{courseName}}</h2>
        <p style="color: #94A3B8; line-height: 1.6;">{{courseDescription}}</p>
        <p style="color: #94A3B8;"><strong style="color: #fff;">Instructor:</strong> {{instructorName}}</p>
        <p style="color: #94A3B8;"><strong style="color: #fff;">Level:</strong> {{courseLevel}}</p>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Enroll Now</a>
      </div>
    </div>`,
    variables: ['courseName', 'courseDescription', 'instructorName', 'courseLevel', 'courseUrl'],
  },
  {
    id: 'course-update',
    name: 'Course Update',
    description: 'Notify students about course content updates',
    category: 'Course Updates',
    subject: 'Update: {{courseName}} — New content available!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📢 Course Updated</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">{{courseName}} has been updated!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">New content has been added to your course: {{updateDetails}}</p>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Continue Learning</a>
      </div>
    </div>`,
    variables: ['courseName', 'updateDetails', 'courseUrl'],
  },
  {
    id: 'new-video-added',
    name: 'New Video Added',
    description: 'Notify about new video in enrolled course',
    category: 'Course Updates',
    subject: 'New video in {{courseName}}: {{videoTitle}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎬 New Video</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">{{videoTitle}}</h2>
        <p style="color: #94A3B8; line-height: 1.6;">A new video has been added to <strong style="color: #fff;">{{courseName}}</strong>. Don't fall behind — watch it now!</p>
        <a href="{{videoUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Watch Now</a>
      </div>
    </div>`,
    variables: ['courseName', 'videoTitle', 'videoUrl'],
  },
  {
    id: 'course-price-change',
    name: 'Course Price Change',
    description: 'Notify about course price changes',
    category: 'Course Updates',
    subject: 'Price update: {{courseName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💰 Price Update</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">{{courseName}}</h2>
        <p style="color: #94A3B8; line-height: 1.6;">The price for this course has been updated from <strong style="color: #EF4444;">{{oldPrice}}</strong> to <strong style="color: #10B981;">{{newPrice}}</strong>. {{priceMessage}}</p>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Course</a>
      </div>
    </div>`,
    variables: ['courseName', 'oldPrice', 'newPrice', 'priceMessage', 'courseUrl'],
  },
  {
    id: 'course-going-live',
    name: 'Course Going Live',
    description: 'Announce a live session for a course',
    category: 'Course Updates',
    subject: '🔴 {{courseName}} is going LIVE at {{liveTime}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔴 Going Live!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">{{courseName}}</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Join the live session with {{instructorName}} at <strong style="color: #fff;">{{liveTime}}</strong>. Don't miss it!</p>
        <a href="{{liveUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Join Live</a>
      </div>
    </div>`,
    variables: ['courseName', 'instructorName', 'liveTime', 'liveUrl'],
  },
  {
    id: 'course-discount',
    name: 'Course Discount',
    description: 'Promote a course discount',
    category: 'Course Updates',
    subject: '🔥 {{discountPercent}}% OFF — {{courseName}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔥 Limited Time Offer!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">{{discountPercent}}% OFF {{courseName}}</h2>
        <p style="color: #94A3B8; line-height: 1.6;">For a limited time, get <strong style="color: #F59E0B;">{{discountPercent}}% off</strong> this course! Offer ends {{expiryDate}}.</p>
        <p style="color: #94A3B8;"><strong style="color: #fff;">Original:</strong> {{originalPrice}} → <strong style="color: #10B981;">{{salePrice}}</strong></p>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Grab the Deal</a>
      </div>
    </div>`,
    variables: ['discountPercent', 'courseName', 'expiryDate', 'originalPrice', 'salePrice', 'courseUrl'],
  },
  {
    id: 'free-course-available',
    name: 'Free Course Available',
    description: 'Announce a free course',
    category: 'Course Updates',
    subject: '🎁 Free Course: {{courseName}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎁 Free Course!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">{{courseName}}</h2>
        <p style="color: #94A3B8; line-height: 1.6;">A new free course is now available! <strong style="color: #fff;">{{courseName}}</strong> by {{instructorName}} is completely free. Enroll now before it's too late!</p>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Enroll Free</a>
      </div>
    </div>`,
    variables: ['courseName', 'instructorName', 'courseUrl'],
  },
  {
    id: 'course-review-request',
    name: 'Course Review Request',
    description: 'Ask student to review a completed course',
    category: 'Course Updates',
    subject: 'Share your review for {{courseName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #8B5CF6); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⭐ Rate Your Course</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{studentName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You recently completed <strong style="color: #fff;">{{courseName}}</strong>. Your feedback helps other students make informed decisions. Would you take a moment to share your experience?</p>
        <a href="{{reviewUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #8B5CF6); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Write a Review</a>
      </div>
    </div>`,
    variables: ['studentName', 'courseName', 'reviewUrl'],
  },

  // Notifications
  {
    id: 'payment-confirmation',
    name: 'Payment Confirmation',
    description: 'Confirm a successful payment',
    category: 'Notifications',
    subject: 'Payment confirmed — {{courseName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">✅ Payment Confirmed</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Thank you, {{studentName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your payment of <strong style="color: #fff;">{{amount}}</strong> for <strong style="color: #fff;">{{courseName}}</strong> has been confirmed. You now have full access to all course content.</p>
        <p style="color: #94A3B8;"><strong style="color: #fff;">Transaction ID:</strong> {{transactionId}}</p>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Start Course</a>
      </div>
    </div>`,
    variables: ['studentName', 'amount', 'courseName', 'transactionId', 'courseUrl'],
  },
  {
    id: 'payment-failed',
    name: 'Payment Failed',
    description: 'Notify about a failed payment',
    category: 'Notifications',
    subject: 'Payment failed for {{courseName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">❌ Payment Failed</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Hi {{studentName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">We were unable to process your payment of <strong style="color: #fff;">{{amount}}</strong> for <strong style="color: #fff;">{{courseName}}</strong>. Reason: {{failureReason}}</p>
        <a href="{{retryUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Try Again</a>
      </div>
    </div>`,
    variables: ['studentName', 'amount', 'courseName', 'failureReason', 'retryUrl'],
  },
  {
    id: 'subscription-renewal',
    name: 'Subscription Renewal',
    description: 'Remind about upcoming subscription renewal',
    category: 'Notifications',
    subject: 'Your subscription renews on {{renewalDate}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔄 Subscription Renewal</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your DAKKHO subscription will renew on <strong style="color: #fff;">{{renewalDate}}</strong> for <strong style="color: #fff;">{{amount}}</strong>. You can manage your subscription anytime.</p>
        <a href="{{manageUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Manage Subscription</a>
      </div>
    </div>`,
    variables: ['userName', 'renewalDate', 'amount', 'manageUrl'],
  },
  {
    id: 'certificate-ready',
    name: 'Certificate Ready',
    description: 'Notify that a certificate is ready',
    category: 'Notifications',
    subject: 'Your certificate for {{courseName}} is ready! 🎓',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #10B981); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎓 Certificate Ready!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Congratulations, {{studentName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your certificate for <strong style="color: #fff;">{{courseName}}</strong> is ready! Download it and share your achievement with the world.</p>
        <a href="{{certificateUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #10B981); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Download Certificate</a>
      </div>
    </div>`,
    variables: ['studentName', 'courseName', 'certificateUrl'],
  },
  {
    id: 'assignment-due',
    name: 'Assignment Due',
    description: 'Remind about upcoming assignment deadline',
    category: 'Notifications',
    subject: 'Assignment due in {{courseName}} — {{dueDate}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📝 Assignment Due</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{studentName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your assignment <strong style="color: #fff;">{{assignmentName}}</strong> for <strong style="color: #fff;">{{courseName}}</strong> is due on <strong style="color: #EF4444;">{{dueDate}}</strong>. Make sure to submit it on time!</p>
        <a href="{{assignmentUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Go to Assignment</a>
      </div>
    </div>`,
    variables: ['studentName', 'assignmentName', 'courseName', 'dueDate', 'assignmentUrl'],
  },
  {
    id: 'live-session-reminder',
    name: 'Live Session Reminder',
    description: 'Remind about upcoming live session',
    category: 'Notifications',
    subject: 'Reminder: Live session at {{sessionTime}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #EF4444); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔴 Live Session Reminder</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">Hi {{studentName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Just a reminder: <strong style="color: #fff;">{{courseName}}</strong> live session with {{instructorName}} starts at <strong style="color: #EF4444;">{{sessionTime}}</strong>.</p>
        <a href="{{sessionUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #EF4444); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Join Session</a>
      </div>
    </div>`,
    variables: ['studentName', 'courseName', 'instructorName', 'sessionTime', 'sessionUrl'],
  },
  {
    id: 'maintenance-notice',
    name: 'Maintenance Notice',
    description: 'Notify about scheduled maintenance',
    category: 'Notifications',
    subject: 'Scheduled maintenance on {{maintenanceDate}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #64748B, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔧 Scheduled Maintenance</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">DAKKHO will undergo scheduled maintenance on <strong style="color: #fff;">{{maintenanceDate}}</strong> from <strong style="color: #fff;">{{startTime}}</strong> to <strong style="color: #fff;">{{endTime}}</strong>. During this time, the platform may be temporarily unavailable.</p>
        <p style="color: #64748B; font-size: 13px;">We apologize for any inconvenience. Your progress is safe!</p>
      </div>
    </div>`,
    variables: ['userName', 'maintenanceDate', 'startTime', 'endTime'],
  },
  {
    id: 'system-update',
    name: 'System Update',
    description: 'Notify about new features or updates',
    category: 'Notifications',
    subject: 'New features on DAKKHO! 🚀',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🚀 What's New</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #00D4AA;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">We've been busy making DAKKHO even better! Here's what's new:</p>
        <div style="color: #94A3B8; line-height: 1.8;">{{updateDetails}}</div>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Check It Out</a>
      </div>
    </div>`,
    variables: ['userName', 'updateDetails', 'dashboardUrl'],
  },

  // Engagement
  {
    id: 'weekly-progress',
    name: 'Weekly Progress Report',
    description: 'Weekly learning progress summary',
    category: 'Engagement',
    subject: 'Your weekly progress on DAKKHO 📊',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #10B981); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📊 Weekly Progress</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{studentName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Here's your learning summary for this week:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #fff; font-size: 18px; font-weight: 600;">{{videosWatched}} videos watched</p>
          <p style="color: #fff; font-size: 18px; font-weight: 600;">{{hoursLearned}} hours learned</p>
          <p style="color: #fff; font-size: 18px; font-weight: 600;">{{coursesInProgress}} courses in progress</p>
        </div>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2, #10B981); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Continue Learning</a>
      </div>
    </div>`,
    variables: ['studentName', 'videosWatched', 'hoursLearned', 'coursesInProgress', 'dashboardUrl'],
  },
  {
    id: 'streak-achievement',
    name: 'Streak Achievement',
    description: 'Celebrate a learning streak milestone',
    category: 'Engagement',
    subject: '🔥 {{streakDays}}-day learning streak!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔥 {{streakDays}}-Day Streak!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Incredible, {{studentName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You've been learning for <strong style="color: #F59E0B;">{{streakDays}} days in a row</strong>! Consistency is the key to success. Keep up the amazing work!</p>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Keep Going</a>
      </div>
    </div>`,
    variables: ['studentName', 'streakDays', 'dashboardUrl'],
  },
  {
    id: 'leaderboard-update',
    name: 'Leaderboard Update',
    description: 'Notify about leaderboard position',
    category: 'Engagement',
    subject: 'You ranked #{{rank}} on the leaderboard! 🏅',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #8B5CF6); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🏅 Leaderboard Update</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Great job, {{studentName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You're currently ranked <strong style="color: #F59E0B;">#{{rank}}</strong> on the DAKKHO leaderboard! Keep learning to climb higher!</p>
        <a href="{{leaderboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #8B5CF6); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Leaderboard</a>
      </div>
    </div>`,
    variables: ['studentName', 'rank', 'leaderboardUrl'],
  },
  {
    id: 'community-highlight',
    name: 'Community Highlight',
    description: 'Highlight community activities',
    category: 'Engagement',
    subject: 'Community highlight: {{highlightTitle}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💡 Community Highlight</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">{{highlightTitle}}</h2>
        <p style="color: #94A3B8; line-height: 1.6;">{{highlightDescription}}</p>
        <a href="{{communityUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Join Discussion</a>
      </div>
    </div>`,
    variables: ['highlightTitle', 'highlightDescription', 'communityUrl'],
  },
  {
    id: 'study-group-invitation',
    name: 'Study Group Invitation',
    description: 'Invite to join a study group',
    category: 'Engagement',
    subject: 'Join the study group: {{groupName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00D4AA, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">👥 Study Group Invite</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #00D4AA;">Hi {{studentName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You've been invited to join the study group <strong style="color: #fff;">{{groupName}}</strong> for <strong style="color: #fff;">{{courseName}}</strong>. Study together, share notes, and help each other succeed!</p>
        <a href="{{groupUrl}}" style="display: inline-block; background: linear-gradient(135deg, #00D4AA, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Join Group</a>
      </div>
    </div>`,
    variables: ['studentName', 'groupName', 'courseName', 'groupUrl'],
  },
  {
    id: 'peer-connection',
    name: 'Peer Connection Request',
    description: 'Notify about a peer connection request',
    category: 'Engagement',
    subject: '{{peerName}} wants to connect with you',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #8B5CF6); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🤝 Connection Request</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;"><strong style="color: #fff;">{{peerName}}</strong> wants to connect with you on DAKKHO. Expand your learning network and study together!</p>
        <a href="{{connectionUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8B5CF6); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Request</a>
      </div>
    </div>`,
    variables: ['userName', 'peerName', 'connectionUrl'],
  },
  {
    id: 'feedback-request',
    name: 'Feedback Request',
    description: 'Request platform feedback',
    category: 'Engagement',
    subject: 'How is your DAKKHO experience? 💬',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💬 We Value Your Feedback</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">We'd love to hear about your experience on DAKKHO. Your feedback helps us improve and build a better learning platform for everyone.</p>
        <a href="{{feedbackUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Share Feedback</a>
      </div>
    </div>`,
    variables: ['userName', 'feedbackUrl'],
  },
  {
    id: 're-engagement',
    name: 'Re-engagement',
    description: 'Re-engage inactive users',
    category: 'Engagement',
    subject: 'We miss you, {{userName}}! Come back to learning 💪',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #EF4444); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💪 Come Back!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #6366f1;">We miss you, {{userName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">It's been a while since you last visited DAKKHO. Your courses are waiting for you! Remember, consistency is the key to mastering new skills.</p>
        <p style="color: #94A3B8;"><strong style="color: #fff;">You have {{incompleteCourses}} incomplete courses</strong></p>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #EF4444); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Resume Learning</a>
      </div>
    </div>`,
    variables: ['userName', 'incompleteCourses', 'dashboardUrl'],
  },

  // Admin
  {
    id: 'new-user-signup',
    name: 'New User Signup Alert',
    description: 'Alert admin about new user signup',
    category: 'Admin',
    subject: 'New signup: {{userName}} ({{userEmail}})',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">👤 New User Signup</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">New user registered</h2>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Name:</strong> {{userName}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Email:</strong> {{userEmail}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Role:</strong> {{userRole}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Joined:</strong> {{joinDate}}</p>
        </div>
      </div>
    </div>`,
    variables: ['userName', 'userEmail', 'userRole', 'joinDate'],
  },
  {
    id: 'instructor-application',
    name: 'Instructor Application',
    description: 'New instructor application received',
    category: 'Admin',
    subject: 'New instructor application: {{applicantName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎓 Instructor Application</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">New instructor application</h2>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Name:</strong> {{applicantName}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Email:</strong> {{applicantEmail}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Specialization:</strong> {{specialization}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Experience:</strong> {{experience}}</p>
        </div>
        <a href="{{reviewUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Review Application</a>
      </div>
    </div>`,
    variables: ['applicantName', 'applicantEmail', 'specialization', 'experience', 'reviewUrl'],
  },
  {
    id: 'content-flagged',
    name: 'Content Flagged',
    description: 'Alert about flagged content',
    category: 'Admin',
    subject: '⚠️ Content flagged: {{contentType}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⚠️ Content Flagged</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Content requires review</h2>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Type:</strong> {{contentType}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">ID:</strong> {{contentId}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Reason:</strong> {{flagReason}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Reported by:</strong> {{reporterName}}</p>
        </div>
        <a href="{{reviewUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Review Content</a>
      </div>
    </div>`,
    variables: ['contentType', 'contentId', 'flagReason', 'reporterName', 'reviewUrl'],
  },
  {
    id: 'system-error-alert',
    name: 'System Error Alert',
    description: 'Alert admin about system errors',
    category: 'Admin',
    subject: '🚨 System Error: {{errorType}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #991B1B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🚨 System Error</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">{{errorType}}</h2>
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Service:</strong> {{serviceName}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Error:</strong> {{errorMessage}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Time:</strong> {{errorTime}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Occurrences:</strong> {{occurrenceCount}}</p>
        </div>
      </div>
    </div>`,
    variables: ['errorType', 'serviceName', 'errorMessage', 'errorTime', 'occurrenceCount'],
  },
  {
    id: 'daily-summary',
    name: 'Daily Summary Report',
    description: 'Daily platform summary for admins',
    category: 'Admin',
    subject: 'DAKKHO Daily Summary — {{date}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📊 Daily Summary</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #00D4AA;">{{date}}</h2>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">New Signups:</strong> {{newSignups}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">New Enrollments:</strong> {{newEnrollments}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Active Users:</strong> {{activeUsers}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Revenue:</strong> {{revenue}}</p>
        </div>
      </div>
    </div>`,
    variables: ['date', 'newSignups', 'newEnrollments', 'activeUsers', 'revenue'],
  },
  {
    id: 'weekly-analytics-report',
    name: 'Weekly Analytics Report',
    description: 'Weekly analytics summary for admins',
    category: 'Admin',
    subject: 'DAKKHO Weekly Analytics — Week of {{weekStart}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #8B5CF6); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📈 Weekly Analytics</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">Week of {{weekStart}}</h2>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Total Users:</strong> {{totalUsers}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">New This Week:</strong> {{newUsersWeek}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Course Completions:</strong> {{courseCompletions}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Avg Watch Time:</strong> {{avgWatchTime}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Top Course:</strong> {{topCourse}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Revenue:</strong> {{weeklyRevenue}}</p>
        </div>
      </div>
    </div>`,
    variables: ['weekStart', 'totalUsers', 'newUsersWeek', 'courseCompletions', 'avgWatchTime', 'topCourse', 'weeklyRevenue'],
  },

  // Student Engagement
  {
    id: 'inactive-user-reminder',
    name: 'Inactive User Reminder (7 Days)',
    description: 'Remind user who hasn\'t logged in for 7 days',
    category: 'Student Engagement',
    subject: 'Hey {{userName}}, your courses miss you! 🏠',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🏠 We Miss You!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">It's been <strong style="color: #fff;">7 days</strong> since you last visited DAKKHO. Your learning journey doesn't have to pause! Jump back in and pick up right where you left off.</p>
        <p style="color: #94A3B8;">You have <strong style="color: #F59E0B;">{{incompleteCourses}} incomplete courses</strong> waiting for you.</p>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Resume Learning</a>
        <p style="color: #64748B; font-size: 13px; margin-top: 16px;">Even 15 minutes a day can make a big difference!</p>
      </div>
    </div>`,
    variables: ['userName', 'incompleteCourses', 'dashboardUrl'],
  },
  {
    id: 'inactive-user-reminder-30',
    name: 'Inactive User Reminder (30 Days)',
    description: 'Re-engage user who hasn\'t logged in for 30 days',
    category: 'Student Engagement',
    subject: '{{userName}}, it\'s been a month! Here\'s what\'s new ✨',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">✨ A Lot Has Changed!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">It's been <strong style="color: #fff;">30 days</strong> since your last visit, and we've been busy! New courses, improved features, and a thriving community await you.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">New Courses:</strong> {{newCoursesCount}} added since you left</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Your Progress:</strong> {{completedPercentage}}% still saved</p>
        </div>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Come Back Now</a>
      </div>
    </div>`,
    variables: ['userName', 'newCoursesCount', 'completedPercentage', 'dashboardUrl'],
  },
  {
    id: 'course-abandoned',
    name: 'Course Abandoned',
    description: 'Remind student who started but didn\'t finish a course',
    category: 'Student Engagement',
    subject: 'Don\'t give up on {{courseName}}! 💪',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💪 Don't Give Up!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{studentName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You were making great progress on <strong style="color: #fff;">{{courseName}}</strong> — you completed <strong style="color: #10B981;">{{progressPercent}}%</strong> of the course. That's already an achievement!</p>
        <p style="color: #94A3B8;">Just <strong style="color: #fff;">{{remainingLessons}} more lessons</strong> to go. You're closer than you think!</p>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Continue Course</a>
      </div>
    </div>`,
    variables: ['studentName', 'courseName', 'progressPercent', 'remainingLessons', 'courseUrl'],
  },
  {
    id: 'daily-learning-tip',
    name: 'Daily Learning Tip',
    description: 'Send daily learning motivation and tips',
    category: 'Student Engagement',
    subject: '💡 Today\'s Learning Tip: {{tipTitle}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💡 Daily Learning Tip</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">{{tipTitle}}</h2>
        <p style="color: #94A3B8; line-height: 1.6;">{{tipContent}}</p>
        <div style="background: rgba(16,185,129,0.1); border-left: 4px solid #10B981; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #10B981; font-style: italic; margin: 0;">"{{quoteText}}" — {{quoteAuthor}}</p>
        </div>
        <a href="{{exploreUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Explore Courses</a>
      </div>
    </div>`,
    variables: ['tipTitle', 'tipContent', 'quoteText', 'quoteAuthor', 'exploreUrl'],
  },
  {
    id: 'weekly-digest',
    name: 'Weekly Digest',
    description: 'Weekly learning summary with stats and highlights',
    category: 'Student Engagement',
    subject: 'Your DAKKHO Weekly Digest 📬',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #10B981); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📬 Weekly Digest</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Here's what happened this week on DAKKHO:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">📚 Hours Learned:</strong> {{hoursLearned}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">🎬 Videos Watched:</strong> {{videosWatched}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">✅ Lessons Completed:</strong> {{lessonsCompleted}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">🔥 Streak:</strong> {{streakDays}} days</p>
        </div>
        <h3 style="color: #10B981;">Trending This Week</h3>
        <p style="color: #94A3B8;">{{trendingCourseName}} — {{trendingEnrollCount}} students enrolled!</p>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2, #10B981); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Full Digest</a>
      </div>
    </div>`,
    variables: ['userName', 'hoursLearned', 'videosWatched', 'lessonsCompleted', 'streakDays', 'trendingCourseName', 'trendingEnrollCount', 'dashboardUrl'],
  },
  {
    id: 'milestone-achievement',
    name: 'Milestone Achievement',
    description: 'Celebrate a learning milestone reached',
    category: 'Student Engagement',
    subject: '🎉 You reached a milestone: {{milestoneName}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #10B981); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Milestone Reached!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Amazing, {{studentName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You've just unlocked the <strong style="color: #fff;">{{milestoneName}}</strong> milestone! This means you've <strong style="color: #10B981;">{{milestoneDescription}}</strong>.</p>
        <p style="color: #94A3B8;">You're among the top <strong style="color: #F59E0B;">{{topPercentile}}%</strong> of DAKKHO learners. Keep pushing forward!</p>
        <a href="{{achievementsUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #10B981); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Achievements</a>
      </div>
    </div>`,
    variables: ['studentName', 'milestoneName', 'milestoneDescription', 'topPercentile', 'achievementsUrl'],
  },
  {
    id: 'course-recommendation',
    name: 'Course Recommendation',
    description: 'Recommend courses based on user interests and history',
    category: 'Student Engagement',
    subject: '📚 Courses you might love, {{userName}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📚 Picked for You</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Based on your interest in <strong style="color: #fff;">{{interestCategory}}</strong>, we think you'll love these courses:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #fff; font-weight: 600;">🎯 {{recommendedCourse1}}</p>
          <p style="color: #94A3B8; font-size: 14px;">by {{instructorName1}} — {{courseLevel1}}</p>
          <p style="color: #fff; font-weight: 600; margin-top: 12px;">🎯 {{recommendedCourse2}}</p>
          <p style="color: #94A3B8; font-size: 14px;">by {{instructorName2}} — {{courseLevel2}}</p>
        </div>
        <a href="{{exploreUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Explore All Recommendations</a>
      </div>
    </div>`,
    variables: ['userName', 'interestCategory', 'recommendedCourse1', 'instructorName1', 'courseLevel1', 'recommendedCourse2', 'instructorName2', 'courseLevel2', 'exploreUrl'],
  },
  {
    id: 'skill-assessment-invitation',
    name: 'Skill Assessment Invitation',
    description: 'Invite user to take a skill assessment test',
    category: 'Student Engagement',
    subject: '🧠 Test your {{skillName}} skills on DAKKHO!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00D4AA, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🧠 Skill Assessment</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #00D4AA;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Ready to see where you stand? Take our <strong style="color: #fff;">{{skillName}}</strong> skill assessment and discover your strengths!</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">⏱ Duration:</strong> {{duration}} minutes</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">📝 Questions:</strong> {{questionCount}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">🏆 Badge:</strong> {{badgeName}} on completion</p>
        </div>
        <a href="{{assessmentUrl}}" style="display: inline-block; background: linear-gradient(135deg, #00D4AA, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Take Assessment</a>
      </div>
    </div>`,
    variables: ['userName', 'skillName', 'duration', 'questionCount', 'badgeName', 'assessmentUrl'],
  },

  // Instructor Communications
  {
    id: 'instructor-new-enrollment',
    name: 'Instructor New Enrollment',
    description: 'Notify instructor when a student enrolls in their course',
    category: 'Instructor Communications',
    subject: '🎓 New student enrolled in {{courseName}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎓 New Enrollment!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Hi {{instructorName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Great news! <strong style="color: #fff;">{{studentName}}</strong> just enrolled in your course <strong style="color: #fff;">{{courseName}}</strong>.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Total Enrollments:</strong> {{totalEnrollments}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">This Month:</strong> {{monthlyEnrollments}}</p>
        </div>
        <a href="{{courseDashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Course Stats</a>
      </div>
    </div>`,
    variables: ['instructorName', 'studentName', 'courseName', 'totalEnrollments', 'monthlyEnrollments', 'courseDashboardUrl'],
  },
  {
    id: 'instructor-course-review',
    name: 'Instructor Course Review',
    description: 'Notify instructor about a new review on their course',
    category: 'Instructor Communications',
    subject: '⭐ New review on {{courseName}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #8B5CF6); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⭐ New Review!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{instructorName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;"><strong style="color: #fff;">{{studentName}}</strong> left a review on your course <strong style="color: #fff;">{{courseName}}</strong>.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #F59E0B; font-size: 20px;">{{ratingStars}}</p>
          <p style="color: #94A3B8; font-style: italic;">"{{reviewText}}"</p>
        </div>
        <p style="color: #94A3B8;">Your course now has an average rating of <strong style="color: #F59E0B;">{{averageRating}}</strong>.</p>
        <a href="{{reviewsUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #8B5CF6); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View All Reviews</a>
      </div>
    </div>`,
    variables: ['instructorName', 'studentName', 'courseName', 'ratingStars', 'reviewText', 'averageRating', 'reviewsUrl'],
  },
  {
    id: 'instructor-monthly-report',
    name: 'Instructor Monthly Report',
    description: 'Monthly course performance report for instructors',
    category: 'Instructor Communications',
    subject: '📊 Your Monthly Report — {{month}} on DAKKHO',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📊 Monthly Report</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{instructorName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Here's your performance summary for <strong style="color: #fff;">{{month}}</strong>:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">New Enrollments:</strong> {{newEnrollments}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Course Completions:</strong> {{courseCompletions}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Average Rating:</strong> {{averageRating}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Revenue:</strong> ৳{{revenue}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Total Students:</strong> {{totalStudents}}</p>
        </div>
        <a href="{{analyticsUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Full Analytics</a>
      </div>
    </div>`,
    variables: ['instructorName', 'month', 'newEnrollments', 'courseCompletions', 'averageRating', 'revenue', 'totalStudents', 'analyticsUrl'],
  },
  {
    id: 'instructor-payout',
    name: 'Instructor Payout',
    description: 'Notify instructor about payment/payout',
    category: 'Instructor Communications',
    subject: '💰 Payout of ৳{{amount}} sent to your account',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💰 Payout Sent!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Hi {{instructorName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your payout of <strong style="color: #10B981;">৳{{amount}}</strong> has been sent to your <strong style="color: #fff;">{{paymentMethod}}</strong> account.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Payout ID:</strong> {{payoutId}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Period:</strong> {{payoutPeriod}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Total Earnings:</strong> ৳{{totalEarnings}}</p>
        </div>
        <a href="{{earningsUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Earnings</a>
      </div>
    </div>`,
    variables: ['instructorName', 'amount', 'paymentMethod', 'payoutId', 'payoutPeriod', 'totalEarnings', 'earningsUrl'],
  },
  {
    id: 'instructor-course-approval',
    name: 'Instructor Course Approval',
    description: 'Notify instructor their course was approved',
    category: 'Instructor Communications',
    subject: '✅ Your course {{courseName}} has been approved!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">✅ Course Approved!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Congratulations, {{instructorName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your course <strong style="color: #fff;">{{courseName}}</strong> has been reviewed and approved by the DAKKHO team. It's now live and visible to students across Bangladesh!</p>
        <p style="color: #94A3B8;">Students can start enrolling immediately. Share your course link on social media to get your first enrollments!</p>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Course</a>
        <a href="{{shareUrl}}" style="display: inline-block; background: rgba(255,255,255,0.1); color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 10px 0 20px 10px;">Share Course</a>
      </div>
    </div>`,
    variables: ['instructorName', 'courseName', 'courseUrl', 'shareUrl'],
  },
  {
    id: 'instructor-course-rejection',
    name: 'Instructor Course Rejection',
    description: 'Notify instructor their course needs revision',
    category: 'Instructor Communications',
    subject: '⚠️ {{courseName}} needs some revisions',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⚠️ Revision Needed</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Hi {{instructorName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your course <strong style="color: #fff;">{{courseName}}</strong> needs a few changes before it can go live. Don't worry — this is common and easy to fix!</p>
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #EF4444; font-weight: 600;">Feedback:</p>
          <p style="color: #94A3B8;">{{rejectionReason}}</p>
        </div>
        <a href="{{editCourseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Edit Course</a>
        <p style="color: #64748B; font-size: 13px;">Need help? Contact us at instructors@dakkho.pro.bd</p>
      </div>
    </div>`,
    variables: ['instructorName', 'courseName', 'rejectionReason', 'editCourseUrl'],
  },
  {
    id: 'instructor-qa-question',
    name: 'Instructor Q&A Question',
    description: 'Notify instructor about a new student question',
    category: 'Instructor Communications',
    subject: '❓ {{studentName}} asked a question in {{courseName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">❓ New Question</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{instructorName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;"><strong style="color: #fff;">{{studentName}}</strong> asked a question in your course <strong style="color: #fff;">{{courseName}}</strong>:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8; font-style: italic;">"{{questionText}}"</p>
        </div>
        <p style="color: #94A3B8;">Answering questions promptly helps keep your students engaged and improves your course rating!</p>
        <a href="{{answerUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Answer Question</a>
      </div>
    </div>`,
    variables: ['instructorName', 'studentName', 'courseName', 'questionText', 'answerUrl'],
  },
  {
    id: 'instructor-live-session-started',
    name: 'Instructor Live Session Started',
    description: 'Notify instructor their live session is starting',
    category: 'Instructor Communications',
    subject: '🔴 Your live session "{{sessionTitle}}" is starting now!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔴 Time to Go Live!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Hi {{instructorName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your live session <strong style="color: #fff;">{{sessionTitle}}</strong> for <strong style="color: #fff;">{{courseName}}</strong> is starting now!</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">📅 Scheduled:</strong> {{scheduledTime}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">👥 Registered:</strong> {{registeredStudents}} students</p>
        </div>
        <a href="{{liveUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Start Session</a>
      </div>
    </div>`,
    variables: ['instructorName', 'sessionTitle', 'courseName', 'scheduledTime', 'registeredStudents', 'liveUrl'],
  },
  {
    id: 'instructor-achievement',
    name: 'Instructor Achievement',
    description: 'Celebrate instructor milestone achievement',
    category: 'Instructor Communications',
    subject: '🏆 You achieved {{achievementName}} on DAKKHO!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #10B981); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🏆 Instructor Achievement!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Well done, {{instructorName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You've unlocked the <strong style="color: #fff;">{{achievementName}}</strong> achievement! You've now <strong style="color: #10B981;">{{achievementDescription}}</strong>.</p>
        <p style="color: #94A3B8;">Only <strong style="color: #F59E0B;">{{percentOfInstructors}}%</strong> of DAKKHO instructors have reached this milestone. You're truly inspiring!</p>
        <a href="{{profileUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #10B981); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Badge</a>
      </div>
    </div>`,
    variables: ['instructorName', 'achievementName', 'achievementDescription', 'percentOfInstructors', 'profileUrl'],
  },

  // Account & Security
  {
    id: 'account-suspended',
    name: 'Account Suspended',
    description: 'Notify user their account has been suspended',
    category: 'Account & Security',
    subject: '⚠️ Your DAKKHO account has been suspended',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #991B1B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⚠️ Account Suspended</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your DAKKHO account has been suspended due to: <strong style="color: #fff;">{{suspensionReason}}</strong>.</p>
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Suspended on:</strong> {{suspensionDate}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Duration:</strong> {{suspensionDuration}}</p>
        </div>
        <p style="color: #94A3B8;">If you believe this is a mistake, please contact our support team.</p>
        <a href="{{supportUrl}}" style="display: inline-block; background: rgba(255,255,255,0.1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Contact Support</a>
      </div>
    </div>`,
    variables: ['userName', 'suspensionReason', 'suspensionDate', 'suspensionDuration', 'supportUrl'],
  },
  {
    id: 'account-reactivated',
    name: 'Account Reactivated',
    description: 'Notify user their account has been reactivated',
    category: 'Account & Security',
    subject: '✅ Your DAKKHO account has been reactivated!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">✅ Account Reactivated</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Welcome back, {{userName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Great news! Your DAKKHO account has been reactivated. You now have full access to all your courses, progress, and certificates.</p>
        <p style="color: #94A3B8;">All your data has been preserved — pick up right where you left off!</p>
        <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Go to Dashboard</a>
      </div>
    </div>`,
    variables: ['userName', 'dashboardUrl'],
  },
  {
    id: 'login-from-new-device',
    name: 'Login from New Device',
    description: 'Security alert when user logs in from a new device',
    category: 'Account & Security',
    subject: '🔒 New login to your DAKKHO account',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔒 New Device Login</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">We detected a login to your DAKKHO account from a new device:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Device:</strong> {{deviceName}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Location:</strong> {{location}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Time:</strong> {{loginTime}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">IP Address:</strong> {{ipAddress}}</p>
        </div>
        <p style="color: #94A3B8;">If this wasn't you, secure your account immediately.</p>
        <a href="{{securityUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Secure Account</a>
      </div>
    </div>`,
    variables: ['userName', 'deviceName', 'location', 'loginTime', 'ipAddress', 'securityUrl'],
  },
  {
    id: 'password-changed',
    name: 'Password Changed',
    description: 'Confirmation that password was changed successfully',
    category: 'Account & Security',
    subject: '🔐 Your DAKKHO password was changed',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Password Changed</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your DAKKHO account password was successfully changed on <strong style="color: #fff;">{{changeDate}}</strong>.</p>
        <p style="color: #94A3B8;">If you made this change, no further action is needed.</p>
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="color: #EF4444; font-weight: 600; margin: 0;">If you didn't change your password, reset it immediately and contact support.</p>
        </div>
        <a href="{{securityUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Security Settings</a>
      </div>
    </div>`,
    variables: ['userName', 'changeDate', 'securityUrl'],
  },
  {
    id: 'email-changed',
    name: 'Email Changed',
    description: 'Confirmation that email address was changed',
    category: 'Account & Security',
    subject: '📧 Your DAKKHO email address was changed',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📧 Email Changed</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your DAKKHO account email address was changed from <strong style="color: #EF4444;">{{oldEmail}}</strong> to <strong style="color: #10B981;">{{newEmail}}</strong> on <strong style="color: #fff;">{{changeDate}}</strong>.</p>
        <p style="color: #94A3B8;">If you made this change, please verify your new email address.</p>
        <a href="{{verificationUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Verify New Email</a>
        <p style="color: #64748B; font-size: 13px;">If you didn't make this change, contact support@dakkho.pro.bd immediately.</p>
      </div>
    </div>`,
    variables: ['userName', 'oldEmail', 'newEmail', 'changeDate', 'verificationUrl'],
  },
  {
    id: 'two-factor-enabled',
    name: 'Two-Factor Enabled',
    description: 'Confirmation that 2FA was enabled on account',
    category: 'Account & Security',
    subject: '🛡️ Two-factor authentication enabled on your account',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🛡️ 2FA Enabled</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Great, {{userName}}!</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Two-factor authentication has been successfully enabled on your DAKKHO account. Your account is now extra secure!</p>
        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #10B981; font-weight: 600;">Security Tips:</p>
          <ul style="color: #94A3B8; line-height: 1.8; padding-left: 20px;">
            <li>Save your backup codes in a safe place</li>
            <li>Never share your 2FA codes with anyone</li>
            <li>Use an authenticator app for best security</li>
          </ul>
        </div>
        <a href="{{securityUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Security Settings</a>
      </div>
    </div>`,
    variables: ['userName', 'securityUrl'],
  },
  {
    id: 'account-deletion-request',
    name: 'Account Deletion Request',
    description: 'Confirm account deletion request and pending deletion',
    category: 'Account & Security',
    subject: '⚠️ Your DAKKHO account deletion has been requested',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⚠️ Account Deletion</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">We received a request to delete your DAKKHO account. Your account will be permanently deleted on <strong style="color: #fff;">{{deletionDate}}</strong>.</p>
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #EF4444;">This action is irreversible.</strong> All your data, courses, progress, and certificates will be permanently removed.</p>
        </div>
        <a href="{{cancelUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Cancel Deletion</a>
      </div>
    </div>`,
    variables: ['userName', 'deletionDate', 'cancelUrl'],
  },
  {
    id: 'data-export-ready',
    name: 'Data Export Ready',
    description: 'Notify user their data export is ready for download',
    category: 'Account & Security',
    subject: '📦 Your data export is ready to download',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📦 Data Export Ready</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your DAKKHO data export is ready! It includes your profile, course progress, certificates, and activity history.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">File Size:</strong> {{fileSize}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Format:</strong> {{fileFormat}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Expires:</strong> {{expiryDate}}</p>
        </div>
        <a href="{{downloadUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Download Export</a>
        <p style="color: #64748B; font-size: 13px;">This download link will expire in 7 days.</p>
      </div>
    </div>`,
    variables: ['userName', 'fileSize', 'fileFormat', 'expiryDate', 'downloadUrl'],
  },

  // Social & Community
  {
    id: 'discussion-reply',
    name: 'Discussion Reply',
    description: 'Notify when someone replies to user\'s discussion',
    category: 'Social & Community',
    subject: '💬 {{replierName}} replied to your discussion',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💬 New Reply</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;"><strong style="color: #fff;">{{replierName}}</strong> replied to your discussion in <strong style="color: #fff;">{{courseName}}</strong>:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8; font-style: italic;">"{{replyText}}"</p>
        </div>
        <a href="{{discussionUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Reply</a>
      </div>
    </div>`,
    variables: ['userName', 'replierName', 'courseName', 'replyText', 'discussionUrl'],
  },
  {
    id: 'mention-in-discussion',
    name: 'Mention in Discussion',
    description: 'Notify user they were mentioned in a discussion',
    category: 'Social & Community',
    subject: '📢 {{mentionerName}} mentioned you in a discussion',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00D4AA, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📢 You Were Mentioned</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #00D4AA;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;"><strong style="color: #fff;">{{mentionerName}}</strong> mentioned you in a discussion on <strong style="color: #fff;">{{courseName}}</strong>:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8; font-style: italic;">"{{mentionText}}"</p>
        </div>
        <a href="{{discussionUrl}}" style="display: inline-block; background: linear-gradient(135deg, #00D4AA, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Discussion</a>
      </div>
    </div>`,
    variables: ['userName', 'mentionerName', 'courseName', 'mentionText', 'discussionUrl'],
  },
  {
    id: 'course-group-message',
    name: 'Course Group Message',
    description: 'New message in a study group the user belongs to',
    category: 'Social & Community',
    subject: '👥 New message in {{groupName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #8B5CF6); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">👥 Group Message</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;"><strong style="color: #fff;">{{senderName}}</strong> posted in <strong style="color: #fff;">{{groupName}}</strong>:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;">"{{messageText}}"</p>
        </div>
        <a href="{{groupUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2, #8B5CF6); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Reply in Group</a>
      </div>
    </div>`,
    variables: ['userName', 'senderName', 'groupName', 'messageText', 'groupUrl'],
  },
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    description: 'Invite user to a community event',
    category: 'Social & Community',
    subject: '🎉 You\'re invited: {{eventName}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #8B5CF6); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎉 You're Invited!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You're invited to <strong style="color: #fff;">{{eventName}}</strong> — a special community event on DAKKHO!</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">📅 Date:</strong> {{eventDate}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">⏰ Time:</strong> {{eventTime}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">📍 Where:</strong> {{eventLocation}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">🎤 Speaker:</strong> {{speakerName}}</p>
        </div>
        <a href="{{rsvpUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #8B5CF6); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">RSVP Now</a>
      </div>
    </div>`,
    variables: ['userName', 'eventName', 'eventDate', 'eventTime', 'eventLocation', 'speakerName', 'rsvpUrl'],
  },
  {
    id: 'challenge-invitation',
    name: 'Challenge Invitation',
    description: 'Invite user to a learning challenge',
    category: 'Social & Community',
    subject: '🏆 Join the {{challengeName}} challenge!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🏆 Learning Challenge</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Ready for a challenge? Join the <strong style="color: #fff;">{{challengeName}}</strong> and compete with fellow learners!</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">📅 Duration:</strong> {{challengeDuration}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">👥 Participants:</strong> {{participantCount}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">🎁 Prize:</strong> {{challengePrize}}</p>
        </div>
        <a href="{{challengeUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Join Challenge</a>
      </div>
    </div>`,
    variables: ['userName', 'challengeName', 'challengeDuration', 'participantCount', 'challengePrize', 'challengeUrl'],
  },

  // Marketing & Promotions
  {
    id: 'seasonal-promotion',
    name: 'Seasonal Promotion',
    description: 'Special offer for Eid/Ramadan/Holiday seasons',
    category: 'Marketing & Promotions',
    subject: '🌙 {{festivalName}} Special: {{discountPercent}}% OFF on DAKKHO!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🌙 {{festivalName}} Special!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Celebrate <strong style="color: #fff;">{{festivalName}}</strong> with DAKKHO! Enjoy <strong style="color: #F59E0B;">{{discountPercent}}% OFF</strong> on all courses. Use code <strong style="color: #10B981;">{{promoCode}}</strong> at checkout.</p>
        <p style="color: #94A3B8;">Offer valid until <strong style="color: #fff;">{{expiryDate}}</strong>. Don't miss out!</p>
        <a href="{{coursesUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Shop Now</a>
      </div>
    </div>`,
    variables: ['userName', 'festivalName', 'discountPercent', 'promoCode', 'expiryDate', 'coursesUrl'],
  },
  {
    id: 'flash-sale',
    name: 'Flash Sale',
    description: 'Urgent flash sale announcement',
    category: 'Marketing & Promotions',
    subject: '⚡ FLASH SALE: {{discountPercent}}% OFF — Ends in {{hoursLeft}} hours!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #F59E0B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⚡ FLASH SALE!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">This is NOT a drill! For the next <strong style="color: #EF4444;">{{hoursLeft}} hours</strong>, get <strong style="color: #F59E0B;">{{discountPercent}}% OFF</strong> on ALL courses on DAKKHO!</p>
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center;">
          <p style="color: #EF4444; font-size: 24px; font-weight: 700; margin: 0;">Code: {{promoCode}}</p>
        </div>
        <a href="{{coursesUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #F59E0B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Grab the Deal</a>
      </div>
    </div>`,
    variables: ['userName', 'discountPercent', 'hoursLeft', 'promoCode', 'coursesUrl'],
  },
  {
    id: 'early-bird-offer',
    name: 'Early Bird Offer',
    description: 'Early bird pricing for upcoming courses',
    category: 'Marketing & Promotions',
    subject: '🐦 Early Bird: {{discountPercent}}% OFF {{courseName}}!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00D4AA, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🐦 Early Bird Pricing</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #00D4AA;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Be among the first to enroll in <strong style="color: #fff;">{{courseName}}</strong> by {{instructorName}} and save <strong style="color: #00D4AA;">{{discountPercent}}%</strong>!</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #EF4444;">Regular Price:</strong> ৳{{regularPrice}}</p>
          <p style="color: #94A3B8;"><strong style="color: #10B981;">Early Bird Price:</strong> ৳{{earlyBirdPrice}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Spots Left:</strong> {{spotsLeft}}</p>
        </div>
        <a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #00D4AA, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Enroll Early</a>
      </div>
    </div>`,
    variables: ['userName', 'courseName', 'instructorName', 'discountPercent', 'regularPrice', 'earlyBirdPrice', 'spotsLeft', 'courseUrl'],
  },
  {
    id: 'bundle-offer',
    name: 'Bundle Offer',
    description: 'Course bundle deal promotion',
    category: 'Marketing & Promotions',
    subject: '📦 Bundle Deal: {{bundleName}} — Save {{savingsPercent}}%!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #6366f1); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📦 Bundle Deal!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Level up your skills with the <strong style="color: #fff;">{{bundleName}}</strong>! Get {{courseCount}} courses at one unbeatable price.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Courses Included:</strong> {{courseList}}</p>
          <p style="color: #94A3B8;"><strong style="color: #EF4444;">Individual Total:</strong> ৳{{individualTotal}}</p>
          <p style="color: #94A3B8;"><strong style="color: #10B981;">Bundle Price:</strong> ৳{{bundlePrice}}</p>
          <p style="color: #94A3B8;"><strong style="color: #F59E0B;">You Save:</strong> {{savingsPercent}}%</p>
        </div>
        <a href="{{bundleUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366f1); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Get the Bundle</a>
      </div>
    </div>`,
    variables: ['userName', 'bundleName', 'courseCount', 'courseList', 'individualTotal', 'bundlePrice', 'savingsPercent', 'bundleUrl'],
  },
  {
    id: 'refer-a-friend',
    name: 'Refer a Friend',
    description: 'Referral program promotion',
    category: 'Marketing & Promotions',
    subject: '🎁 Give {{rewardAmount}}, Get {{rewardAmount}} — Refer a Friend!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎁 Refer & Earn</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Share DAKKHO with your friends and both of you get <strong style="color: #10B981;">৳{{rewardAmount}}</strong> in credits!</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center;">
          <p style="color: #fff; font-size: 16px; font-weight: 600;">Your Referral Code:</p>
          <p style="color: #10B981; font-size: 28px; font-weight: 700; letter-spacing: 4px;">{{referralCode}}</p>
        </div>
        <p style="color: #94A3B8;">You've referred <strong style="color: #fff;">{{referralCount}}</strong> friends so far. Keep sharing!</p>
        <a href="{{referralUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Share & Earn</a>
      </div>
    </div>`,
    variables: ['userName', 'rewardAmount', 'referralCode', 'referralCount', 'referralUrl'],
  },
  {
    id: 'loyalty-reward',
    name: 'Loyalty Reward',
    description: 'Loyalty points and rewards notification',
    category: 'Marketing & Promotions',
    subject: '🌟 You earned {{pointsEarned}} loyalty points on DAKKHO!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #10B981); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🌟 Loyalty Reward</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You've earned <strong style="color: #F59E0B;">{{pointsEarned}} loyalty points</strong> for your recent activity on DAKKHO!</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Total Points:</strong> {{totalPoints}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Current Tier:</strong> {{loyaltyTier}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Next Reward:</strong> {{nextReward}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Points Needed:</strong> {{pointsToNextReward}}</p>
        </div>
        <a href="{{rewardsUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #10B981); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">View Rewards</a>
      </div>
    </div>`,
    variables: ['userName', 'pointsEarned', 'totalPoints', 'loyaltyTier', 'nextReward', 'pointsToNextReward', 'rewardsUrl'],
  },
  {
    id: 'back-to-school',
    name: 'Back to School',
    description: 'Back to school promotion',
    category: 'Marketing & Promotions',
    subject: '📚 Back to School: {{discountPercent}}% OFF all courses!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4A90E2, #8B5CF6); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📚 Back to School!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">It's that time of the year! Get ready to learn with DAKKHO's <strong style="color: #8B5CF6;">Back to School</strong> sale — <strong style="color: #F59E0B;">{{discountPercent}}% OFF</strong> all courses!</p>
        <p style="color: #94A3B8;">Use code <strong style="color: #10B981;">{{promoCode}}</strong> at checkout. Offer ends <strong style="color: #fff;">{{expiryDate}}</strong>.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;">🎯 <strong style="color: #fff;">Top Picks:</strong> {{featuredCourses}}</p>
        </div>
        <a href="{{coursesUrl}}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2, #8B5CF6); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Browse Courses</a>
      </div>
    </div>`,
    variables: ['userName', 'discountPercent', 'promoCode', 'expiryDate', 'featuredCourses', 'coursesUrl'],
  },
  {
    id: 'new-year-offer',
    name: 'New Year Offer',
    description: 'New year special promotion',
    category: 'Marketing & Promotions',
    subject: '🎆 New Year, New Skills: {{discountPercent}}% OFF!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎆 Happy New Year!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Start the new year right! Invest in yourself with <strong style="color: #F59E0B;">{{discountPercent}}% OFF</strong> all DAKKHO courses.</p>
        <p style="color: #94A3B8;">Make <strong style="color: #fff;">{{year}}</strong> the year you level up your skills. Use code <strong style="color: #10B981;">{{promoCode}}</strong> — valid until <strong style="color: #fff;">{{expiryDate}}</strong>.</p>
        <a href="{{coursesUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Start Learning</a>
      </div>
    </div>`,
    variables: ['userName', 'discountPercent', 'year', 'promoCode', 'expiryDate', 'coursesUrl'],
  },

  // Admin & System
  {
    id: 'account-locked',
    name: 'Account Locked',
    description: 'Notify user their account was locked due to failed login attempts',
    category: 'Admin & System',
    subject: '🔒 Your DAKKHO account has been locked',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #EF4444, #991B1B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔒 Account Locked</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your DAKKHO account has been temporarily locked due to <strong style="color: #fff;">{{failedAttempts}} failed login attempts</strong>. This is a security measure to protect your account.</p>
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Locked at:</strong> {{lockTime}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Auto-unlock:</strong> {{unlockTime}}</p>
        </div>
        <a href="{{unlockUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #991B1B); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Unlock Account</a>
        <p style="color: #64748B; font-size: 13px;">If you didn't attempt to log in, please contact support@dakkho.pro.bd immediately.</p>
      </div>
    </div>`,
    variables: ['userName', 'failedAttempts', 'lockTime', 'unlockTime', 'unlockUrl'],
  },
  {
    id: 'terms-update',
    name: 'Terms of Service Update',
    description: 'Notify users about updated terms of service',
    category: 'Admin & System',
    subject: '📋 DAKKHO Terms of Service have been updated',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #4A90E2); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📋 Terms Update</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #4A90E2;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">We've updated our <strong style="color: #fff;">Terms of Service</strong> effective <strong style="color: #fff;">{{effectiveDate}}</strong>. Key changes include:</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8; line-height: 1.8;">{{changeSummary}}</p>
        </div>
        <p style="color: #94A3B8;">By continuing to use DAKKHO, you agree to the updated terms.</p>
        <a href="{{termsUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4A90E2); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Read Full Terms</a>
      </div>
    </div>`,
    variables: ['userName', 'effectiveDate', 'changeSummary', 'termsUrl'],
  },
  {
    id: 'privacy-policy-update',
    name: 'Privacy Policy Update',
    description: 'Notify users about privacy policy changes',
    category: 'Admin & System',
    subject: '🛡️ DAKKHO Privacy Policy has been updated',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10B981, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🛡️ Privacy Update</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #10B981;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">Your privacy matters to us. We've updated our <strong style="color: #fff;">Privacy Policy</strong> effective <strong style="color: #fff;">{{effectiveDate}}</strong>.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8; line-height: 1.8;">{{changeSummary}}</p>
        </div>
        <p style="color: #94A3B8;">We encourage you to review the updated policy. Your continued use of DAKKHO means you accept these changes.</p>
        <a href="{{privacyUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Read Privacy Policy</a>
      </div>
    </div>`,
    variables: ['userName', 'effectiveDate', 'changeSummary', 'privacyUrl'],
  },
  {
    id: 'feature-sunset',
    name: 'Feature Sunset',
    description: 'Notify users about a feature being removed',
    category: 'Admin & System',
    subject: '⚠️ {{featureName}} will be removed on {{removalDate}}',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⚠️ Feature Update</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #F59E0B;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">We wanted to let you know that <strong style="color: #fff;">{{featureName}}</strong> will be removed from DAKKHO on <strong style="color: #EF4444;">{{removalDate}}</strong>.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">Reason:</strong> {{removalReason}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Alternative:</strong> {{alternativeFeature}}</p>
        </div>
        <p style="color: #94A3B8;">We're committed to making DAKKHO better. This change helps us focus on features that matter most to you.</p>
        <a href="{{learnMoreUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Learn More</a>
      </div>
    </div>`,
    variables: ['userName', 'featureName', 'removalDate', 'removalReason', 'alternativeFeature', 'learnMoreUrl'],
  },
  {
    id: 'beta-access',
    name: 'Beta Access',
    description: 'Invite user to try a beta feature',
    category: 'Admin & System',
    subject: '🧪 You\'re invited to try {{featureName}} (Beta)!',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #8B5CF6, #00D4AA); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🧪 Beta Access</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #8B5CF6;">Hi {{userName}},</h2>
        <p style="color: #94A3B8; line-height: 1.6;">You've been selected to try <strong style="color: #fff;">{{featureName}}</strong> — a new feature we're building for DAKKHO! As a beta tester, your feedback will shape the future of this feature.</p>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94A3B8;"><strong style="color: #fff;">What it does:</strong> {{featureDescription}}</p>
          <p style="color: #94A3B8;"><strong style="color: #fff;">Beta ends:</strong> {{betaEndDate}}</p>
        </div>
        <a href="{{betaUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #00D4AA); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0;">Try It Now</a>
        <p style="color: #64748B; font-size: 13px;">This is an exclusive invitation. Beta features may have bugs — your feedback helps us improve!</p>
      </div>
    </div>`,
    variables: ['userName', 'featureName', 'featureDescription', 'betaEndDate', 'betaUrl'],
  },
];

const CATEGORIES = [...new Set(TEMPLATES.map(t => t.category))];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Welcome & Onboarding': Sparkles,
  'Course Updates': BookOpen,
  'Notifications': Bell,
  'Engagement': Heart,
  'Admin': BarChart3,
  'Student Engagement': Target,
  'Instructor Communications': UserCheck,
  'Account & Security': Shield,
  'Social & Community': MessageSquare,
  'Marketing & Promotions': Megaphone,
  'Admin & System': AlertTriangle,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Welcome & Onboarding': 'from-purple-500 to-indigo-500',
  'Course Updates': 'from-blue-500 to-cyan-400',
  'Notifications': 'from-amber-500 to-orange-400',
  'Engagement': 'from-pink-500 to-rose-400',
  'Admin': 'from-emerald-500 to-teal-400',
  'Student Engagement': 'from-teal-500 to-emerald-400',
  'Instructor Communications': 'from-amber-500 to-yellow-400',
  'Account & Security': 'from-red-500 to-orange-400',
  'Social & Community': 'from-violet-500 to-purple-400',
  'Marketing & Promotions': 'from-rose-500 to-pink-400',
  'Admin & System': 'from-slate-500 to-gray-400',
};

function renderTemplate(html: string, variables: Record<string, string>): string {
  let rendered = html;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value || `{{${key}}}`);
  }
  return rendered;
}

export default function EmailPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  // Compose tab state
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', html: '' });

  // Test tab state
  const [testEmail, setTestEmail] = useState('');

  const { toast } = useToast();

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    const vars: Record<string, string> = {};
    template.variables.forEach(v => { vars[v] = ''; });
    setVariableValues(vars);
    setShowPreview(false);
  };

  const handleSendTemplate = async () => {
    if (!selectedTemplate || !recipientEmail) {
      toast({ title: 'Error', description: 'Recipient email and template are required', variant: 'destructive' });
      return;
    }
    const missingVars = selectedTemplate.variables.filter(v => !variableValues[v]);
    if (missingVars.length > 0) {
      toast({ title: 'Error', description: `Missing variables: ${missingVars.join(', ')}`, variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const renderedSubject = renderTemplate(selectedTemplate.subject, variableValues);
      const renderedHtml = renderTemplate(selectedTemplate.html, variableValues);
      await apiPost('/email/custom', { to: recipientEmail, subject: renderedSubject, html: renderedHtml });
      toast({ title: 'Success', description: 'Email sent!' });
      setRecipientEmail('');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({ title: 'Error', description: 'Email address required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      await apiPost('/email/test', { to: testEmail });
      toast({ title: 'Success', description: 'Test email sent!' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleSendCustom = async () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.html) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      await apiPost('/email/custom', { to: composeForm.to, subject: composeForm.subject, html: composeForm.html });
      toast({ title: 'Success', description: 'Email sent!' });
      setComposeForm({ to: '', subject: '', html: '' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  // Template editor view
  if (selectedTemplate) {
    const renderedHtml = renderTemplate(selectedTemplate.html, variableValues);
    const gradientColor = CATEGORY_COLORS[selectedTemplate.category] || 'from-blue-500 to-cyan-400';

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedTemplate(null); setShowPreview(false); }} className="text-muted-foreground hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold text-white">{selectedTemplate.name}</h3>
            <p className="text-xs text-muted-foreground">{selectedTemplate.category}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Variable inputs */}
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Configure Email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="bg-white/5 border-white/10"
                  placeholder="student@example.com"
                />
              </div>
              {selectedTemplate.variables.map(variable => (
                <div key={variable} className="space-y-2">
                  <Label>{variable}</Label>
                  <Input
                    value={variableValues[variable] || ''}
                    onChange={(e) => setVariableValues({ ...variableValues, [variable]: e.target.value })}
                    className="bg-white/5 border-white/10"
                    placeholder={`Enter ${variable}`}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="border-white/10 flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" /> {showPreview ? 'Hide Preview' : 'Preview'}
                </Button>
                <Button
                  onClick={handleSendTemplate}
                  disabled={sending}
                  className="gradient-primary text-white flex-1"
                >
                  {sending ? 'Sending...' : <><Send className="h-4 w-4 mr-2" /> Send</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card className="glass-card border-0">
              <CardHeader><CardTitle className="text-lg">Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={renderedHtml}
                    className="w-full border-0"
                    style={{ height: '400px' }}
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="templates" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">
            <FileText className="h-4 w-4 mr-2" /> Templates
          </TabsTrigger>
          <TabsTrigger value="compose" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">
            <Mail className="h-4 w-4 mr-2" /> Compose
          </TabsTrigger>
          <TabsTrigger value="test" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">
            <Send className="h-4 w-4 mr-2" /> Test
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 border-white/10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!selectedCategory ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={!selectedCategory ? 'gradient-primary text-white' : 'border-white/10'}
              >
                All
              </Button>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? 'gradient-primary text-white' : 'border-white/10'}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map(template => {
              const Icon = CATEGORY_ICONS[template.category] || FileText;
              const gradient = CATEGORY_COLORS[template.category] || 'from-blue-500 to-cyan-400';
              return (
                <Card
                  key={template.id}
                  className="glass-card border-0 cursor-pointer hover:bg-white/[0.04] transition-all group"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white group-hover:text-dakkho-blue transition-colors truncate">{template.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                        <Badge variant="secondary" className="bg-white/5 text-muted-foreground text-[10px] mt-2">{template.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No templates found matching your search</p>
            </div>
          )}
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Compose Email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  type="email"
                  value={composeForm.to}
                  onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="Email subject"
                />
              </div>
              <div className="space-y-2">
                <Label>HTML Body</Label>
                <Textarea
                  value={composeForm.html}
                  onChange={(e) => setComposeForm({ ...composeForm, html: e.target.value })}
                  className="bg-white/5 border-white/10 font-mono text-sm"
                  rows={12}
                  placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                />
              </div>
              <Button onClick={handleSendCustom} disabled={sending} className="w-full gradient-primary text-white">
                {sending ? 'Sending...' : <><Mail className="h-4 w-4 mr-2" /> Send Email</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Send Test Email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-blue-400">This will send a simple test email to verify your Resend configuration is working correctly.</p>
              </div>
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="bg-white/5 border-white/10"
                  placeholder="admin@dakkho.pro.bd"
                />
              </div>
              <Button onClick={handleSendTest} disabled={sending} className="w-full gradient-primary text-white">
                {sending ? 'Sending...' : <><Send className="h-4 w-4 mr-2" /> Send Test Email</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Config Info */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-lg">Email Configuration</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded bg-white/[0.03]">
              <span className="text-muted-foreground">Provider</span>
              <span>Resend</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white/[0.03]">
              <span className="text-muted-foreground">From Email</span>
              <span>noreply@dakkho.pro.bd</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white/[0.03]">
              <span className="text-muted-foreground">Support Email</span>
              <span>support@dakkho.pro.bd</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white/[0.03]">
              <span className="text-muted-foreground">Templates Available</span>
              <span>{TEMPLATES.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
