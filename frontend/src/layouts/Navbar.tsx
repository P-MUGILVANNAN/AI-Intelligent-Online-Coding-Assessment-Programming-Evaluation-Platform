import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import { Notification } from '../types';
import {
  Code2, Bell, LogOut, User as UserIcon, Shield,
  GraduationCap, BookOpen, CheckCircle, AlertTriangle, Info, Menu
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.list();
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = () => {
    if (role === 'Administrator') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-300 border border-red-800">
          <Shield className="w-3 h-3" /> <span className="hidden sm:inline">Admin</span>
        </span>
      );
    }
    if (role === 'Instructor') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
          <GraduationCap className="w-3 h-3" /> <span className="hidden sm:inline">Instructor</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
        <BookOpen className="w-3 h-3" /> <span className="hidden sm:inline">Student</span>
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a276b]/60 bg-[#0c0b24]/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Hamburger */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#18173d] transition"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white/95 rounded-lg px-2 py-1 flex items-center justify-center shadow-md shadow-[#2F2D7D]/20 group-hover:scale-105 transition-transform">
              <img src="/fiit-logo.png" alt="FIIT - Create Your Value" className="h-6 sm:h-7 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight">
                  FIIT <span className="text-[#a5a3ee] font-semibold">Coding Assessment</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 -mt-0.5 tracking-wider uppercase font-medium hidden sm:block">
                Create Your Value
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {getRoleBadge()}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#18173d] transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#2F2D7D] text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse border border-[#5a57be]">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-96 rounded-xl border border-[#2a276b] bg-[#141334] shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2a276b]">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#a5a3ee]" /> Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-[#a5a3ee] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg text-xs border transition ${
                          n.is_read
                            ? 'bg-[#0c0b24]/60 border-[#2a276b]/40 text-slate-400'
                            : 'bg-[#2F2D7D]/20 border-[#2F2D7D]/50 text-slate-200'
                        }`}
                      >
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                          {n.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                          {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                          {n.type === 'info' && <Info className="w-3.5 h-3.5 text-[#a5a3ee]" />}
                          {n.title}
                        </div>
                        <p className="line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile and logout */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-[#2a276b]">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-200">{user?.full_name || 'User'}</span>
              <span className="text-xs text-slate-400 truncate max-w-[160px]">{user?.email}</span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
