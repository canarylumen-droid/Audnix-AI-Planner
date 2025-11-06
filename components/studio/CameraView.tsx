import * as React from 'react';
import { FramingGuide } from './FramingGuide';

interface CameraViewProps {
    stream: MediaStream | null;
    isRecording: boolean;
    coachingHint: string | null;
    showFrameGuide: boolean;
    countdown: number | null;
}

export const CameraView: React.FC<CameraViewProps> = ({ stream, isRecording, coachingHint, showFrameGuide, countdown }) => {
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

            {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                    <div key={countdown} className="text-white font-black text-9xl animate-countdown-pop">{countdown}</div>
                </div>
            )}
            
            <div className={`absolute top-4 left-4 flex items-center gap-2 transition-opacity ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-sm">REC</span>
            </div>
            <style>{`
                @keyframes countdown-pop {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-countdown-pop {
                    animation: countdown-pop 0.5s ease-out forwards;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};