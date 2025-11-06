import * as React from 'react';
import { FramingGuide } from './FramingGuide';

interface CameraViewProps {
    stream: MediaStream | null;
    isRecording: boolean;
    coachingHint: string | null;
    showFrameGuide: boolean; // NEW prop
}

export const CameraView: React.FC<CameraViewProps> = ({ stream, isRecording, coachingHint, showFrameGuide }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden border-2 border-gray-700">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
            
            {showFrameGuide && <FramingGuide />}

            {coachingHint && (
                 <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white py-2 px-5 rounded-full text-md font-semibold transition-opacity animate-fade-in z-20">
                    <p>{coachingHint}</p>
                </div>
            )}
            
            <div className={`absolute top-4 left-4 flex items-center gap-2 transition-opacity ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-sm">REC</span>
            </div>
        </div>
    );
};