import React from 'react';
import { Sparkles } from 'lucide-react';
import { BaseComponentProps } from '../../types';

const AuthLayout: React.FC<BaseComponentProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 ${className}`}>
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-accent-600 items-center justify-center p-12">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome to Luna</h1>
            <p className="text-xl text-primary-100 mb-8">
              Your ultimate AI-powered women's health companion
            </p>
            <div className="space-y-4 text-primary-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Smart cycle tracking with 95% accuracy</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>AI photo analysis for instant health insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>24/7 AI health companion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;