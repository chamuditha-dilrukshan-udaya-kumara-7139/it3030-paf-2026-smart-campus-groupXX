import React, { useState, useEffect, useRef } from 'react';
import http from '../services/http';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await http.get('/api/notifications', { withCredentials: true });
      const data = Array.isArray(response.data) ? response.data : [];
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await http.put(`/api/notifications/${id}/read`, null, { withCredentials: true });
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true, isRead: true } : notif))
      );
    } catch (err) {
      console.error('Failed to mark as read.', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await http.delete(`/api/notifications/${id}`, { withCredentials: true });
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (err) {
      console.error('Failed to delete notification.', err);
    }
  };

  const getUnreadCount = () => notifications.filter((n) => !n.isRead && !n.read).length;

  const filteredNotifications = notifications.filter((notif) => {
    const isNotifRead = notif.isRead || notif.read;
    if (filter === 'UNREAD') return !isNotifRead;
    if (filter === 'READ') return isNotifRead;
    return true;
  });

  const getTypeIcon = (type) => {
    if (type === 'BOOKING') return '📅';
    if (type === 'TICKET') return '🛠️';
    return '🔔';
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Unknown time';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return Math.floor(seconds) + 's ago';
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {getUnreadCount() > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {getUnreadCount()}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
            className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden isolate"
            style={{ minHeight: '300px', maxHeight: '500px', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
            {getUnreadCount() > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {getUnreadCount()} New
              </span>
            )}
          </div>

          {/* Filters */}
          <div className="flex border-b border-slate-100 bg-white">
            {['ALL', 'UNREAD', 'READ'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 text-xs font-bold transition-colors ${
                  filter === f
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto bg-white p-2 space-y-1">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500 animate-pulse">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl opacity-50">📭</span>
                </div>
                <p className="text-sm font-semibold text-slate-600">No notifications found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {filter !== 'ALL' ? `You have no ${filter.toLowerCase()} items.` : "You're all caught up!"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isRead = notif.isRead || notif.read;
                return (
                  <div
                    key={notif.id}
                    className={`group relative p-3 rounded-lg border flex gap-3 transition-all ${
                      isRead
                        ? 'bg-white border-transparent hover:border-slate-100'
                        : 'bg-blue-50/50 border-blue-100'
                    }`}
                  >
                    {/* Icon based on type */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        isRead ? 'bg-slate-100' : 'bg-white shadow-sm'
                      }`}>
                        {getTypeIcon(notif.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-6"> {/* Ensure enough space for absolute delete button */}
                      <p className={`text-sm ${isRead ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                        {notif.message || notif.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {timeAgo(notif.createdAt)}
                      </p>
                      
                      {/* Mark As Read Button */}
                      {!isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 mt-2 block"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    
                    {/* Delete Button (visible on hover) */}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete notification"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
