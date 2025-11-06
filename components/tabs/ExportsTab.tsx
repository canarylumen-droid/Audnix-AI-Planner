// components/tabs/ExportsTab.tsx
import * as React from 'react';
import { Recording, SocialContentResult } from '../../types';
import { DownloadIcon } from '../icons/DownloadIcon';
import { SocialContentModal } from '../dialogs/SocialContentModal';
import { generateSocialContent } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import { AnalyticsIcon } from '../icons/AnalyticsIcon';
// FIX: Import ExportIcon for use in the empty state.
import { ExportIcon } from '../icons/ExportIcon';

interface ExportsTabProps {
    recordings: Recording[];
    onAnalyzePerformance: (recording: Recording) => void; // NEW
}

const formatTime = (ms: number, separator: ',' | '.'): string => {
    const date = new Date(ms);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}${separator}${milliseconds}`;
};

const splitLineForCaptions = (text: string, maxLength = 42): string[] => {
    if (text.length <= maxLength) {
        return [text];
    }
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxLength) {
            lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine = (currentLine + ' ' + word).trim();
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
};


export const ExportsTab: React.FC<ExportsTabProps> = ({ recordings, onAnalyzePerformance }) => {
    const [socialContent, setSocialContent] = React.useState<SocialContentResult | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [selectedRecording, setSelectedRecording] = React.useState<Recording | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleGenerateSocialContent = async (recording: Recording) => {
        if (!recording.transcriptLog || recording.transcriptLog.length === 0) {
            alert('A transcript is required to generate social content. This video was recorded before the feature was available.');
            return;
        }
        
        setSelectedRecording(recording);
        setIsGenerating(true);
        setError(null);
        setSocialContent(null);
        
        try {
            const transcript = recording.transcriptLog.map(entry => entry.text).join(' ');
            const result = await generateSocialContent(transcript, recording.title);
            setSocialContent(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate content.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateTranscript = (recording: Recording, format: 'srt' | 'vtt' | 'txt') => {
        if (!recording.transcriptLog || recording.transcriptLog.length === 0) {
            alert('No transcript available for this recording.');
            return;
        }

        const log = recording.transcriptLog;
        let content = '';
        
        if (format === 'txt') {
            content = log.map(entry => entry.text).join(' ');
        } else {
            if (format === 'vtt') {
                content += 'WEBVTT\n\n';
            }
            let counter = 1;
            log.forEach((entry, index) => {
                const startTime = entry.timestamp;
                const endTime = (index < log.length - 1) 
                    ? log[index + 1].timestamp 
                    : startTime + Math.max(2000, entry.text.length * 80);

                const lines = splitLineForCaptions(entry.text);
                const lineDuration = (endTime - startTime) / lines.length;

                lines.forEach((line, lineIndex) => {
                    const lineStartTime = startTime + (lineIndex * lineDuration);
                    const lineEndTime = lineStartTime + lineDuration;
                    
                    content += `${counter++}\n`;
                    const separator = format === 'srt' ? ',' : '.';
                    content += `${formatTime(lineStartTime, separator)} --> ${formatTime(lineEndTime, separator)}\n`;
                    content += `${line}\n\n`;
                });
            });
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recording.title}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleCopyTranscript = (recording: Recording) => {
        if (!recording.transcriptLog || recording.transcriptLog.length === 0) {
            alert('No transcript available for this recording.');
            return;
        }
        const transcript = recording.transcriptLog.map(entry => entry.text).join(' ');
        navigator.clipboard.writeText(transcript).then(() => {
             alert('Transcript copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy transcript: ', err);
            alert('Failed to copy transcript.');
        });
    }
    
    const closeModal = () => {
        setSelectedRecording(null);
        setSocialContent(null);
        setError(null);
    }

    if (recordings.length === 0) {
        // FIX: Improved the empty state UI with an icon and better copy.
        return (
            <div className="text-center py-20">
                <ExportIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-400">No recordings yet!</h2>
                <p className="text-gray-500 mt-2">Your saved videos from the Studio will appear here.</p>
            </div>
        );
    }

    return (
        <>
            {selectedRecording && (
                <SocialContentModal 
                    isOpen={!!selectedRecording}
                    isLoading={isGenerating}
                    error={error}
                    content={socialContent}
                    onClose={closeModal}
                />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recordings.map((recording) => (
                    <div key={recording.id} className="glow-card relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 flex flex-col">
                        <div className="aspect-video">
                            <video src={recording.url} controls className="w-full h-full object-cover"></video>
                        </div>
                        <div className="absolute top-2 right-2 bg-cyan-900/50 backdrop-blur-sm text-cyan-300 text-xs font-bold px-2 py-1 rounded-full border border-cyan-700">
                            {recording.quality}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-gray-200 truncate">{recording.title}</h3>
                            <p className="text-sm text-gray-500">{recording.date}</p>
                            <div className="mt-4 flex flex-col gap-2 flex-grow justify-end">
                                <button
                                    onClick={() => onAnalyzePerformance(recording)}
                                    className="w-full text-sm font-semibold py-2 px-3 rounded-md transition bg-gray-700 hover:bg-gray-600 text-cyan-300 flex items-center justify-center gap-2"
                                >
                                    <AnalyticsIcon className="w-4 h-4" /> Analyze Performance
                                </button>
                                <button 
                                    onClick={() => handleGenerateSocialContent(recording)} 
                                    className="w-full text-sm font-semibold py-2 px-3 rounded-md transition bg-cyan-500 hover:bg-cyan-600 text-gray-900 flex items-center justify-center gap-2"
                                    disabled={!recording.transcriptLog || recording.transcriptLog.length === 0}
                                >
                                    <SparklesIcon className="w-4 h-4" /> AI Social Content
                                </button>
                                
                                <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700 space-y-2">
                                    <p className="text-xs font-bold text-gray-300 text-center">Export Captions & Transcript</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => handleGenerateTranscript(recording, 'srt')} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded p-2 transition">.SRT</button>
                                        <button onClick={() => handleGenerateTranscript(recording, 'vtt')} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded p-2 transition">.VTT</button>
                                        <button onClick={() => handleGenerateTranscript(recording, 'txt')} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded p-2 transition">.TXT</button>
                                        <button onClick={() => handleCopyTranscript(recording)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded p-2 transition">Copy</button>
                                    </div>
                                </div>
                                
                                 <a href={recording.url} download={`${recording.title}.webm`} className="w-full text-center text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md transition flex items-center justify-center gap-2">
                                    <DownloadIcon className="w-4 h-4" /> Download Video
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};
