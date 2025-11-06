// components/studio/CameraPlaceholder.tsx
import * as React from 'react';
import { CameraIcon } from '../icons/CameraIcon';

interface CameraPlaceholderProps {
    onStartCamera: () => void;
}

export const CameraPlaceholder: React.FC<CameraPlaceholderProps> = ({ onStartCamera }) => {
    return (
        <div className="w-full aspect-[9/16] bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-center p-4">
            <CameraIcon className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-300">Studio is Ready</h3>
            <p className="text-gray-400 mb-6">Click below to start your camera.</p>
            <button
                onClick={onStartCamera}
                className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-6 rounded-full transition-colors"
            >
                Setup Camera
            </button>
        </div>
    );
};