// app/context/NotificationContext.js
import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Pending Reservation',
      message: 'Item Reserved: This reservation is still pending and needs admin approval.',
      date: '21 May 2025',
      time: '1:00 PM',
      read: false,
    },
    {
      id: 2,
      title: 'Reserved Item',
      message: 'Item Reserved: Your reservation has been placed successfully.',
      date: '21 May 2025',
      time: '2:00 PM',
      read: false,
    },
    {
      id: 3,
      title: 'Item Received',
      message: 'Item Ready: You have successfully received the item.',
      date: '27 May 2025',
      time: '7:00 AM',
      read: false,
    },
    {
      id: 4,
      title: 'Item Returned',
      message: 'Item Returned: Thank you! The item has been successfully returned.',
      date: '27 May 2025',
      time: '11:00 AM',
      read: false,
    },
    {
      id: 5,
      title: 'Reservation Cancelled',
      message: 'Admin cancelled your reservation.',
      date: '27 May 2025',
      time: '7:00 AM',
      read: false,
    },
  ]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
