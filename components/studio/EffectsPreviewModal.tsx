// components/studio/EffectsPreviewModal.tsx
import * as React from 'react';
import { Spinner } from '../common/Spinner';

interface EffectsPreviewModalProps {
    image: string | null;
    isLoading: boolean;
    onClose: () => void;
}

export const EffectsPreviewModal: React.FC<EffectsPreviewModalProps> = ({ image, isLoading, onClose }) => {
    // Handle Escape key press to close modal
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 max-w-md w-full animate-fade-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center mb-4 text-gray-200">AI Effects Preview</h3>
                <div className="relative aspect-[9/16] w-full bg-gray-900 rounded-md flex items-center justify-center overflow-hidden">
                    {isLoading && <Spinner />}
                    {image && !isLoading && <img src={image} alt="Effects Preview" className="object-contain w-full h-full" />}
                </div>
                <button onClick={onClose} className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors">
                    Close
                </button>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
