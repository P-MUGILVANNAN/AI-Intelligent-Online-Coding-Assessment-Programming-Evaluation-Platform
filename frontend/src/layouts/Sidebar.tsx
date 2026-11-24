import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building, FileCode, CheckSquare,
  HelpCircle, Eye, ShieldAlert, BarChart3, Settings,
  Code2, PlusCircle, History, UserCheck, Shield, X
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { role } = useAuth();

  const getNavLinks = () => {
    if (role === 'Administrator') {
      return [
        { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'Institutions', path: '/admin/institutions', icon: Building },
        { label: 'Assessments', path: '/admin/assessments', icon: CheckSquare },
        { label: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
        { label: 'Submissions', path: '/admin/submissions', icon: History },
        { label: 'Plagiarism Audit', path: '/admin/plagiarism', icon: ShieldAlert },
        { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'System Settings', path: '/admin/settings', icon: Settings },
      ];
    }
    if (role === 'Instructor') {
      return [
        { label: 'Instructor Home', path: '/instructor', icon: LayoutDashboard },
        { label: 'Manage Assessments', path: '/instructor/assessments', icon: CheckSquare },
        { label: 'Create Assessment', path: '/instructor/assessments/create', icon: PlusCircle },
        { label: 'Question Bank', path: '/instructor/questions', icon: HelpCircle },
        { label: 'Question Builder', path: '/instructor/questions/create', icon: FileCode },
        { label: 'Exam Monitoring', path: '/instructor/monitoring', icon: Eye },
        { label: 'Plagiarism Analysis', path: '/instructor/plagiarism', icon: ShieldAlert },
        { label: 'Reports & Export', path: '/instructor/reports', icon: BarChart3 },
      ];
    }
    // Student Links
    return [
      { label: 'Student Dashboard', path: '/student', icon: LayoutDashboard },
      { label: 'Available Assessments', path: '/student/assessments', icon: CheckSquare },
      { label: 'My Submissions', path: '/student/submissions', icon: History },
      { label: 'Skill Analytics', path: '/student/analytics', icon: BarChart3 },
      { label: 'Profile Settings', path: '/student/profile', icon: UserCheck },
    ];
  };

  const links = getNavLinks();

  const content = (
    <div className="h-full flex flex-col justify-between">
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span>Navigation Menu</span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onCloseMobile}
              end={link.path === '/admin' || link.path === '/instructor' || link.path === '/student'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2F2D7D] text-white shadow-md shadow-[#2F2D7D]/30 border border-[#5a57be]/50'
                    : 'text-slate-400 hover:text-white hover:bg-[#18173d]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-[#18173d] to-[#0c0b24] border border-[#2a276b] text-xs shadow-md">
        <div className="flex items-center gap-2 text-[#a5a3ee] font-semibold mb-1">
          <Shield className="w-3.5 h-3.5 text-[#a5a3ee]" /> FIIT Sandbox Engine
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Subprocess Container Isolation with 2.0s execution timeout & 128MB memory quota.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-[#2a276b]/60 bg-[#0c0b24] flex-col shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#080718]/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[80vw] h-full bg-[#0c0b24] border-r border-[#2a276b] shadow-2xl z-10">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
