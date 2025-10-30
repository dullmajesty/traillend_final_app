// app/context/NotificationContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const API_URL = 'http://10.178.38.115:8000'; // 🔧 Change for deployment

  // ✅ Load JWT token from storage
  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) setAccessToken(token);
    };
    loadToken();
  }, []);

  // ✅ Fetch all notifications from Django API
  const fetchNotifications = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        console.warn('Failed to fetch notifications:', data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // ✅ Mark a notification as read
  const markAsRead = async (id) => {
    if (!accessToken) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await fetch(`${API_URL}/api/notifications/${id}/read/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // ✅ Auto-refresh notifications every 15s
  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        markAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
