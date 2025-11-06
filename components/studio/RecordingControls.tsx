import * as React from 'react';

// FIX: Defined props interface for type safety.
interface RecordingControlsProps {
    isRecording: boolean;
    recordedBlob: Blob | null;
    onStart: () => void;
    onStop: () => void;
    onSave: () => void;
    onDiscard: () => void;
    isCountingDown?: boolean;
}

// FIX: Implemented the RecordingControls component for user interaction.
export const RecordingControls: React.FC<RecordingControlsProps> = ({ isRecording, recordedBlob, onStart, onStop, onSave, onDiscard, isCountingDown }) => {
    if (recordedBlob) {
        return (
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={onDiscard}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
                >
                    Discard
                </button>
                <button
                    onClick={onSave}
                    className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors"
                >
                    Save & Finish
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center">
            <button
                onClick={isRecording ? onStop : onStart}
                disabled={isCountingDown}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-white'} ${isCountingDown ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
                <div className={`transition-all duration-200 ${isRecording ? 'w-8 h-8 bg-white rounded-md' : 'w-14 h-14 bg-red-500 rounded-full'}`} />
            </button>
        </div>
    );
};