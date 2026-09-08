import { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

function Notifications() {
  const { notifications, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedNotifications = notifications.slice(startIndex, endIndex);
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const getNotificationTypeLabel = (type) => {
    const labels = {
      ORDER_PLACED: '📤 Order Placed',
      NEW_ORDER_RECEIVED: '📥 New Order',
      ORDER_ACCEPTED: '✅ Order Accepted',
      ORDER_REJECTED: '❌ Order Rejected',
      ORDER_CANCELLED: '🚫 Order Cancelled',
    };
    return labels[type] || type;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification._id);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Notifications</h1>
        <p className="page-subtitle">You have {notifications.filter((n) => !n.is_read).length} unread notifications</p>
      </div>

      {notifications.length > 0 && (
        <div className="notifications-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={markAllAsRead}
          >
            Mark All as Read
          </button>
        </div>
      )}

      {displayedNotifications.length > 0 ? (
        <div className="notifications-container">
          {displayedNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-card-header">
                <h3 className="notification-card-title">{getNotificationTypeLabel(notification.type)}</h3>
                <p className="notification-card-date">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              <p className="notification-card-title-main">{notification.title}</p>
              <p className="notification-card-message">{notification.message}</p>

              {!notification.is_read && (
                <button
                  type="button"
                  className="btn btn-small btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification._id);
                  }}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No notifications yet</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Notifications;
