import * as React from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface CardProps {
    title: string;
    children: React.ReactNode;
    initiallyOpen?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(initiallyOpen);

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700/50 transition-colors"
            >
                <h3 className="text-lg font-bold text-gray-200">{title}</h3>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700">
                    {children}
                </div>
            )}
        </div>
    );
};