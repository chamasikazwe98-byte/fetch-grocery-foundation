import { useState } from 'react';
import { Clock, CalendarDays, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format, addHours, setHours, setMinutes, startOfHour, isBefore, addDays } from 'date-fns';

interface ScheduledDeliveryProps {
  onScheduleSelect: (date: Date | null) => void;
  selectedDate: Date | null;
}

// Generate 2-hour delivery windows
const generateTimeSlots = (date: Date) => {
  const slots: { start: Date; end: Date; label: string }[] = [];
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  // Store hours: 7:00 - 20:00
  const openHour = 7;
  const closeHour = 20;
  
  // Start from next even hour if today
  let startHour = openHour;
  if (isToday) {
    const currentHour = now.getHours();
    startHour = Math.max(openHour, Math.ceil((currentHour + 1) / 2) * 2);
  }
  
  for (let hour = startHour; hour < closeHour - 1; hour += 2) {
    const start = setMinutes(setHours(date, hour), 0);
    const end = addHours(start, 2);
    
    // Skip if slot is in the past
    if (isBefore(start, now)) continue;
    
    slots.push({
      start,
      end,
      label: `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`,
    });
  }
  
  return slots;
};

export const ScheduledDelivery = ({ onScheduleSelect, selectedDate }: ScheduledDeliveryProps) => {
  const [deliveryType, setDeliveryType] = useState<'now' | 'scheduled'>(selectedDate ? 'scheduled' : 'now');
  const [selectedDay, setSelectedDay] = useState<Date>(selectedDate || new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    selectedDate ? format(selectedDate, 'HH:mm') : null
  );

  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const days = [
    { date: today, label: 'Today' },
    { date: tomorrow, label: 'Tomorrow' },
  ];

  const timeSlots = generateTimeSlots(selectedDay);

  const handleDeliveryTypeChange = (type: 'now' | 'scheduled') => {
    setDeliveryType(type);
    if (type === 'now') {
      onScheduleSelect(null);
      setSelectedSlot(null);
    }
  };

  const handleSlotSelect = (slot: { start: Date }) => {
    setSelectedSlot(format(slot.start, 'HH:mm'));
    onScheduleSelect(slot.start);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Delivery Time</Label>
      
      {/* Delivery Type Selection */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={deliveryType === 'now' ? 'default' : 'outline'}
          className={`h-auto py-3 flex flex-col items-center gap-1 ${
            deliveryType === 'now' ? '' : 'border-2'
          }`}
          onClick={() => handleDeliveryTypeChange('now')}
        >
          <Zap className="h-5 w-5" />
          <span className="font-semibold">Deliver Now</span>
          <span className="text-xs opacity-70">ASAP delivery</span>
        </Button>
        
        <Button
          type="button"
          variant={deliveryType === 'scheduled' ? 'default' : 'outline'}
          className={`h-auto py-3 flex flex-col items-center gap-1 ${
            deliveryType === 'scheduled' ? '' : 'border-2'
          }`}
          onClick={() => handleDeliveryTypeChange('scheduled')}
        >
          <CalendarDays className="h-5 w-5" />
          <span className="font-semibold">Schedule</span>
          <span className="text-xs opacity-70">Pick a time</span>
        </Button>
      </div>

      {/* Scheduled Options */}
      {deliveryType === 'scheduled' && (
        <div className="space-y-4 bg-muted/50 rounded-xl p-4">
          {/* Day Selection */}
          <div>
            <Label className="text-sm mb-2 block">Select Day</Label>
            <div className="flex gap-2">
              {days.map(({ date, label }) => (
                <Button
                  key={label}
                  type="button"
                  variant={selectedDay.toDateString() === date.toDateString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedDay(date);
                    setSelectedSlot(null);
                    onScheduleSelect(null);
                  }}
                  className="flex-1"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <Label className="text-sm mb-2 block flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Select Time Window
            </Label>
            
            {timeSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No available slots for today. Try tomorrow!
              </p>
            ) : (
              <RadioGroup
                value={selectedSlot || ''}
                onValueChange={(val) => {
                  const slot = timeSlots.find((s) => format(s.start, 'HH:mm') === val);
                  if (slot) handleSlotSelect(slot);
                }}
                className="grid grid-cols-2 gap-2"
              >
                {timeSlots.map((slot) => {
                  const value = format(slot.start, 'HH:mm');
                  return (
                    <div key={value}>
                      <RadioGroupItem
                        value={value}
                        id={value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={value}
                        className="flex items-center justify-center rounded-lg border-2 border-muted bg-background px-3 py-2 text-sm font-medium cursor-pointer hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                      >
                        {slot.label}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            )}
          </div>

          {/* Selected Time Display */}
          {selectedDate && (
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-sm text-primary font-medium">
                📅 Scheduled for {format(selectedDate, 'EEEE, MMM d')} at{' '}
                {format(selectedDate, 'h:mm a')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
