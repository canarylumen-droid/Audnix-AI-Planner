import * as React from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

// Custom hook to track mouse position
const useMousePosition = (ref: React.RefObject<HTMLDivElement>) => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                setPosition({
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                });
            }
        };

        const currentRef = ref.current;
        currentRef?.addEventListener('mousemove', handleMouseMove);

        return () => {
            currentRef?.removeEventListener('mousemove', handleMouseMove);
        };
    }, [ref]);

    return position;
};

interface CardProps {
    title: string;
    children: React.ReactNode;
    initiallyOpen?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(initiallyOpen);
    const cardRef = React.useRef<HTMLDivElement>(null);
    const mousePosition = useMousePosition(cardRef);

    return (
        <div
            ref={cardRef}
            className="glow-card rounded-lg overflow-hidden"
            style={{ '--mouse-x': `${mousePosition.x}px`, '--mouse-y': `${mousePosition.y}px` } as React.CSSProperties}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-transparent hover:bg-gray-800/50 transition-colors"
            >
                <h3 className="text-lg font-bold text-gray-200">{title}</h3>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className="grid transition-all duration-500 ease-in-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-800">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};