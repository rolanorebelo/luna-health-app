import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reminder {
  id: string;
  type: 'period' | 'ovulation' | 'appointment' | 'medication' | 'custom';
  title: string;
  description?: string;
  date: string; // ISO date string
  time?: string; // HH:MM format
  urgent: boolean;
  completed: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'cycle';
    interval?: number; // for "every X days/weeks/months"
  };
  createdAt: string;
}

interface ReminderState {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  getUpcomingReminders: () => Reminder[];
  getTodayReminders: () => Reminder[];
  generateCycleReminders: (lastPeriodDate: string, cycleLength: number, periodLength: number) => void;
}

const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],

      addReminder: (reminderData) => {
        const newReminder: Reminder = {
          ...reminderData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          reminders: [...state.reminders, newReminder]
        }));
      },

      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map(reminder =>
            reminder.id === id ? { ...reminder, ...updates } : reminder
          )
        }));
      },

      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter(reminder => reminder.id !== id)
        }));
      },

      completeReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.map(reminder =>
            reminder.id === id ? { ...reminder, completed: true } : reminder
          )
        }));
      },

      getUpcomingReminders: () => {
        const { reminders } = get();
        const today = new Date();
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(today.getDate() + 14); // Show reminders for next 2 weeks

        console.log('🔍 getUpcomingReminders called');
        console.log('🔍 Total reminders:', reminders.length);
        console.log('🔍 Today:', today.toISOString().split('T')[0]);
        console.log('🔍 Two weeks from now:', twoWeeksFromNow.toISOString().split('T')[0]);

        const filtered = reminders
          .filter(reminder => {
            if (reminder.completed) {
              console.log('🔍 Skipping completed reminder:', reminder.title);
              return false;
            }
            const reminderDate = new Date(reminder.date);
            const isInRange = reminderDate >= today && reminderDate <= twoWeeksFromNow;
            console.log(`🔍 Reminder "${reminder.title}" on ${reminder.date}: in range = ${isInRange}`);
            return isInRange;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        console.log('🔍 Filtered upcoming reminders:', filtered.length);
        return filtered;
      },

      getTodayReminders: () => {
        const { reminders } = get();
        const today = new Date().toISOString().split('T')[0];

        return reminders
          .filter(reminder => {
            if (reminder.completed) return false;
            return reminder.date === today;
          })
          .sort((a, b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
          });
      },

      generateCycleReminders: (lastPeriodDate: string, cycleLength: number, periodLength: number) => {
        console.log('🔍 generateCycleReminders called with:', { lastPeriodDate, cycleLength, periodLength });
        const { reminders, addReminder } = get();
        
        // Remove existing auto-generated cycle reminders
        const filteredReminders = reminders.filter(reminder => 
          reminder.type !== 'period' && reminder.type !== 'ovulation'
        );
        console.log('🔍 Filtered out existing cycle reminders, remaining:', filteredReminders.length);
        
        set((state) => ({
          reminders: filteredReminders
        }));

        const lastPeriod = new Date(lastPeriodDate);
        const today = new Date();
        console.log('🔍 Today:', today.toISOString().split('T')[0]);
        console.log('🔍 Last period:', lastPeriod.toISOString().split('T')[0]);

        // Calculate next few cycles
        for (let cycleCount = 1; cycleCount <= 3; cycleCount++) {
          const cycleStart = new Date(lastPeriod);
          cycleStart.setDate(lastPeriod.getDate() + (cycleLength * cycleCount));
          console.log(`🔍 Cycle ${cycleCount} start:`, cycleStart.toISOString().split('T')[0]);

          // Period reminder (2 days before)
          const periodReminder = new Date(cycleStart);
          periodReminder.setDate(cycleStart.getDate() - 2);
          console.log(`🔍 Period reminder date for cycle ${cycleCount}:`, periodReminder.toISOString().split('T')[0]);
          
          if (periodReminder >= today) {
            const daysUntilPeriod = Math.ceil((cycleStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`🔍 Adding period reminder - days until period: ${daysUntilPeriod}`);
            
            addReminder({
              type: 'period',
              title: 'Period starting soon',
              description: `In ${daysUntilPeriod} days`,
              date: periodReminder.toISOString().split('T')[0],
              urgent: daysUntilPeriod <= 1,
              completed: false
            });
          }
        }

        // Check for ovulation in current and future cycles
        for (let cycleCount = 0; cycleCount < 3; cycleCount++) {
          const ovulationDay = new Date(lastPeriod);
          const ovulationDayNumber = Math.floor(cycleLength * 0.5) - 1; // Around day 10 for 22-day cycle
          ovulationDay.setDate(lastPeriod.getDate() + ovulationDayNumber + (cycleLength * cycleCount));
          console.log(`🔍 Ovulation day for cycle ${cycleCount}:`, ovulationDay.toISOString().split('T')[0], `(day ${ovulationDayNumber + 1})`);

          if (ovulationDay >= today) {
            const daysUntilOvulation = Math.ceil((ovulationDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const ovulationTitle = daysUntilOvulation === 0 ? 'Peak fertility today' : 
                                   daysUntilOvulation === 1 ? 'Peak fertility tomorrow' :
                                   `Peak fertility in ${daysUntilOvulation} days`;
            
            console.log(`🔍 Adding ovulation reminder - days until ovulation: ${daysUntilOvulation}`);
            
            addReminder({
              type: 'ovulation',
              title: ovulationTitle,
              description: 'Optimal time for conception',
              date: ovulationDay.toISOString().split('T')[0],
              urgent: daysUntilOvulation <= 1,
              completed: false
            });
          }
        }
        
        console.log('🔍 Final reminders after generation:', get().reminders);
      },
    }),
    {
      name: 'luna-reminders-storage',
    }
  )
);

export default useReminderStore;
