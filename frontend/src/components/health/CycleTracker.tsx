import React from 'react';

interface CycleTrackerProps {
  cycleDay: number;
  phase: string;
  fertility: number;
}

const CycleTracker: React.FC<CycleTrackerProps> = ({ cycleDay, phase, fertility }) => (
  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Smart Cycle Tracking</h3>
        <p className="text-sm text-pink-600">Day {cycleDay} • {phase}</p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-pink-600">{fertility}%</div>
        <div className="text-xs text-gray-500">Fertility</div>
      </div>
    </div>

    <div className="relative mb-4">
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-3 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500" 
          style={{ width: `${(cycleDay / 28) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Period</span>
        <span>Ovulation</span>
        <span>PMS</span>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 bg-white rounded-xl">
        <div className="text-lg font-bold text-gray-900">5</div>
        <div className="text-xs text-gray-500">Days to Period</div>
      </div>
      <div className="text-center p-3 bg-white rounded-xl">
        <div className="text-lg font-bold text-green-600">High</div>
        <div className="text-xs text-gray-500">Fertility</div>
      </div>
      <div className="text-center p-3 bg-white rounded-xl">
        <div className="text-lg font-bold text-blue-600">28</div>
        <div className="text-xs text-gray-500">Cycle Length</div>
      </div>
    </div>
  </div>
);

export default CycleTracker;