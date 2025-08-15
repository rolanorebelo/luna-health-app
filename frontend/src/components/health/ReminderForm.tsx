import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Calendar, Clock, Bell, User, Pill, Heart } from 'lucide-react';
import useReminderStore from '../../stores/reminderStore';

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ isOpen, onClose }) => {
  const { addReminder } = useReminderStore();
  const [formData, setFormData] = useState({
    type: 'custom' as const,
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    urgent: false,
    recurring: {
      frequency: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
      interval: 1
    }
  });

  const reminderTypes = [
    { value: 'appointment', label: 'Appointment', icon: <User className="w-4 h-4" />, color: 'blue' },
    { value: 'medication', label: 'Medication', icon: <Pill className="w-4 h-4" />, color: 'green' },
    { value: 'custom', label: 'Custom', icon: <Bell className="w-4 h-4" />, color: 'purple' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    addReminder({
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      date: formData.date,
      time: formData.time || undefined,
      urgent: formData.urgent,
      completed: false,
      recurring: formData.recurring.frequency !== 'none' ? {
        frequency: formData.recurring.frequency,
        interval: formData.recurring.interval
      } : undefined
    });

    // Reset form
    setFormData({
      type: 'custom',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      urgent: false,
      recurring: {
        frequency: 'none',
        interval: 1
      }
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Reminder</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reminder Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {reminderTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 transition-all ${
                    formData.type === type.value
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`${formData.type === type.value ? `text-${type.color}-600` : 'text-gray-400'}`}>
                    {type.icon}
                  </div>
                  <span className={`text-xs font-medium ${
                    formData.type === type.value ? `text-${type.color}-700` : 'text-gray-600'
                  }`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter reminder title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any additional details"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time (optional)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Urgent */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="urgent"
              checked={formData.urgent}
              onChange={(e) => setFormData(prev => ({ ...prev, urgent: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">
              Mark as urgent
            </label>
          </div>

          {/* Recurring */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat
            </label>
            <select
              value={formData.recurring.frequency}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                recurring: { ...prev.recurring, frequency: e.target.value as any } 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Reminder
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReminderForm;
