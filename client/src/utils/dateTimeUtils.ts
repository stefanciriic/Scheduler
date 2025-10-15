export const parseAppointmentTime = (appointmentTime: string | number[]): Date => {
  if (Array.isArray(appointmentTime)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = appointmentTime;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  return new Date(appointmentTime);
};

interface FormattedDateTime {
  date: string;
  time: string;
  combined: string;
}

export const formatDateTime = (dateTime: string | number[]): FormattedDateTime => {
  const date = parseAppointmentTime(dateTime);
  
  if (isNaN(date.getTime())) {
    return {
      date: 'Invalid Date',
      time: 'Invalid Time',
      combined: 'Invalid Date and Time'
    };
  }
  
  const dateStr = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const combinedStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    date: dateStr,
    time: timeStr,
    combined: combinedStr
  };
};

/**
 * Format Date to LocalDateTime string (yyyy-MM-ddTHH:mm:ss) for backend
 * @param date - JavaScript Date object
 * @returns Formatted LocalDateTime string without timezone
 */
export const formatToLocalDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};