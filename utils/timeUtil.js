// Generate time slots for 24 hours with 30-minute intervals
export const generateTimeSlots = () => {
  const slots = [];
  
  // Generate all 24 hours with 30-minute intervals
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startHour = hour;
      const startMinute = minute;
      const endHour = minute === 30 ? (hour + 1) % 24 : hour;
      const endMinute = minute === 30 ? 0 : 30;
      
      // Format hours for display (5:30 AM - 6:00 AM format)
      const formatHour = (h) => {
        if (h === 0) return 12;
        if (h > 12) return h - 12;
        return h;
      };
      
      const formatPeriod = (h) => h >= 12 ? 'PM' : 'AM';
      
      const displayStartHour = formatHour(startHour);
      const displayEndHour = formatHour(endHour);
      const startPeriod = formatPeriod(startHour);
      const endPeriod = formatPeriod(endHour);
      
      slots.push({
        id: `${startHour}:${startMinute}-${endHour}:${endMinute}`,
        startTime: `${displayStartHour}:${startMinute === 0 ? '00' : startMinute} ${startPeriod}`,
        endTime: `${displayEndHour}:${endMinute === 0 ? '00' : endMinute} ${endPeriod}`,
        displayText: `${displayStartHour}:${startMinute === 0 ? '00' : startMinute} ${startPeriod} - ${displayEndHour}:${endMinute === 0 ? '00' : endMinute} ${endPeriod}`
      });
    }
  }
  
  return slots;
};