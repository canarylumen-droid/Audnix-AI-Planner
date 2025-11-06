// components/LandingPage.tsx
import * as React from 'react';
import { Header } from './Header';
import { RocketIcon } from './icons/RocketIcon';

interface LandingPageProps {
    onGetStarted: () => void;
}

const FeatureCard: React.FC<{ title: string; description: string; icon: string }> = ({ title, description, icon }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center">
             <div className="max-w-4xl mx-auto">
                <Header />
                <div className="mt-12 mb-12">
                     <button
                        onClick={onGetStarted}
                        className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-4 px-8 rounded-full transition-transform transform hover:scale-105 text-lg inline-flex items-center gap-3"
                    >
                        <RocketIcon className="w-6 h-6" />
                        Launch Studio
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard 
                        icon="📅"
                        title="AI Campaign Planner"
                        description="Generate a 7-day strategic content plan from a simple description of your brand."
                    />
                     <FeatureCard 
                        icon="🎥"
                        title="AI Recording Studio"
                        description="Record with a teleprompter, real-time coaching, and professional lighting effects."
                    />
                     <FeatureCard 
                        icon="✂️"
                        title="Automated Editing"
                        description="Export 4K video with auto-removed filler words and studio-quality sound."
                    />
                </div>
             </div>
        </div>
    );
};