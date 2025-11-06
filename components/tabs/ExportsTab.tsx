// components/tabs/ExportsTab.tsx
import * as React from 'react';
import { Recording } from '../../types';

interface ExportsTabProps {
    recordings: Recording[];
}

export const ExportsTab: React.FC<ExportsTabProps> = ({ recordings }) => {

    const handleShare = async (recording: Recording) => {
        if (navigator.share && recording.blob) {
            const file = new File([recording.blob], `${recording.title}.webm`, { type: recording.blob.type });
            const shareData = {
                title: recording.title,
                text: `${recording.captions.join('\n\n')}\n\n${recording.hashtags.join(' ')}`,
                files: [file],
            };

            if (navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                } catch (error) {
                    console.error('Error sharing:', error);
                }
            } else {
                 alert("Sharing this file type is not supported on your device.");
            }
        } else {
            alert('Web Share API not supported in your browser.');
        }
    };

    if (recordings.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-400">No recordings yet!</h2>
                <p className="text-gray-500 mt-2">Record a video in the Studio tab to see it here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recordings.map((recording) => (
                <div key={recording.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <div className="aspect-video">
                        <video src={recording.url} controls className="w-full h-full object-cover"></video>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-gray-200 truncate">{recording.title}</h3>
                        <p className="text-sm text-gray-500">{recording.date}</p>
                        <div className="mt-4 flex gap-2">
                             <button onClick={() => handleShare(recording)} className="w-full text-sm bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold py-2 px-3 rounded-md transition">
                                Share
                            </button>
                             <a href={recording.url} download={`${recording.title}.webm`} className="w-full text-center text-sm bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-md transition">
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
