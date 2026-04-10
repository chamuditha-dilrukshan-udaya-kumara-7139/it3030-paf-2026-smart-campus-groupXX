import { useEffect, useState } from 'react';
import http from '../services/http';

function getMessage(notification) {
  return notification.message || notification.title || 'Notification';
}

function isRead(notification) {
  if (typeof notification.read === 'boolean') {
    return notification.read;
  }
  if (typeof notification.isRead === 'boolean') {
    return notification.isRead;
  }
  if (typeof notification.status === 'string') {
    return notification.status.toUpperCase() === 'READ';
  }
  return false;
}

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await http.get('/api/notifications', { withCredentials: true });
        const data = Array.isArray(response.data) ? response.data : [];
        setNotifications(data);
      } catch (err) {
        setError('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
        <span className="text-xs text-slate-500">{notifications.length} total</span>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading notifications...</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <p className="text-sm text-slate-500">No notifications available.</p>
      )}

      {!loading && !error && notifications.length > 0 && (
        <ul className="space-y-2">
          {notifications.map((notification, index) => {
            const read = isRead(notification);
            return (
              <li
                key={notification.id ?? `${getMessage(notification)}-${index}`}
                className={`p-3 rounded-lg border ${
                  read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-slate-700">{getMessage(notification)}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      read ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {read ? 'Read' : 'Unread'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default NotificationPanel;
