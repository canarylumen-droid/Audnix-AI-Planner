import * as React from 'react';

// FIX: Added 'Tab' type definition for clarity and type safety.
interface Tab {
    name: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

// FIX: Modified props to make this a controlled component.
interface TabsProps {
    tabs: Tab[];
    activeTab: number;
    onTabChange: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto pb-px" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} aria-label="Tabs">
                    <style>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    {/* FIX: Implemented tab navigation with dynamic rendering and active state handling. */}
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.name}
                            onClick={() => onTabChange(index)}
                            className={`${
                                activeTab === index
                                    ? 'border-cyan-400 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } flex items-center flex-shrink-0 whitespace-nowrap py-4 px-2 sm:px-3 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            {tab.icon}
                            <span className="ml-2 hidden sm:inline">{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {/* FIX: Ensured that only the content of the currently active tab is rendered. */}
                {tabs[activeTab].content}
            </div>
        </div>
    );
};