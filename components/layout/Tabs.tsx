import * as React from 'react';
import { HamburgerIcon } from '../icons/HamburgerIcon';
import { CloseIcon } from '../icons/CloseIcon';

interface Tab {
    name: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: number;
    onTabChange: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleTabClick = (index: number) => {
        onTabChange(index);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="glow-card rounded-xl">
            {/* Desktop and Tablet Tabs */}
            <nav className="hidden md:flex flex-wrap sm:flex-nowrap justify-center sm:justify-start space-x-1 sm:space-x-2 p-2 bg-gray-900/50 rounded-t-xl" aria-label="Tabs">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.name}
                        onClick={() => onTabChange(index)}
                        className={`group relative flex-grow sm:flex-1 flex items-center justify-center whitespace-nowrap py-3 px-3 sm:px-4 rounded-lg font-bold text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
                            activeTab === index
                                ? 'bg-gray-800 text-white shadow-inner'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                    >
                        <span className="flex items-center">
                            {React.cloneElement(tab.icon as React.ReactElement, { className: 'h-6 w-6' })}
                            <span className="ml-2 hidden lg:inline">{tab.name}</span>
                        </span>
                    </button>
                ))}
            </nav>

            {/* Mobile Header and Hamburger Menu */}
            <div className="md:hidden flex items-center justify-between p-2 bg-gray-900/50 rounded-t-xl">
                <div className="font-bold text-lg text-white ml-2">
                    {tabs[activeTab].name}
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md text-gray-300 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                    aria-label="Open navigation menu"
                >
                    <HamburgerIcon className="w-6 h-6" />
                </button>
            </div>
            
            {/* Mobile Slide-out Menu */}
            <div 
                className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className="absolute right-0 top-0 h-full w-64 bg-gray-900 border-l border-gray-800 p-4 space-y-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-200">Navigation</h3>
                         <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none"
                            aria-label="Close navigation menu"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    {tabs.map((tab, index) => (
                         <button
                            key={tab.name}
                            onClick={() => handleTabClick(index)}
                            className={`w-full flex items-center p-3 rounded-md text-left font-semibold transition-colors ${
                                activeTab === index ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            {React.cloneElement(tab.icon as React.ReactElement, { className: 'h-6 w-6 mr-3' })}
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 sm:p-6 animate-fade-in-slow bg-gray-900 rounded-b-xl">
                {tabs[activeTab].content}
            </div>
        </div>
    );
};