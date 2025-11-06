import * as React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Audnix AI Planner
            </h1>
            <p className="mt-2 text-lg text-gray-400">
                The on-device dashboard for viral content creation.
            </p>
        </header>
    );
};