// components/dialogs/SocialContentModal.tsx
import * as React from 'react';
import { SocialContentResult } from '../../types';
import { Spinner } from '../common/Spinner';
import { CopyIcon } from '../icons/CopyIcon';

interface SocialContentModalProps {
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    content: SocialContentResult | null;
    onClose: () => void;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-2 text-sm font-semibold py-1 px-3 rounded-md transition ${copied ? 'bg-green-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
        >
            <CopyIcon className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};

export const SocialContentModal: React.FC<SocialContentModalProps> = ({ isOpen, isLoading, error, content, onClose }) => {
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-gray-900 rounded-xl p-6 border border-gray-700 max-w-lg w-full animate-fade-in space-y-4" 
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-center text-gray-100">AI Social Content</h2>
                
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Spinner />
                        <p className="text-gray-400 mt-4">Generating fresh ideas...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md">
                        <p className="font-bold">Generation Failed</p>
                        <p>{error}</p>
                    </div>
                )}

                {content && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg text-gray-200 mb-2">Caption Suggestions</h3>
                            <div className="space-y-3">
                                {content.captions.map((caption, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-md border border-gray-700">
                                        <p className="flex-1 text-gray-300 text-sm">{caption}</p>
                                        <CopyButton textToCopy={caption} />
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="font-bold text-lg text-gray-200 mb-2">Hashtag Suggestions</h3>
                             <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-md border border-gray-700">
                                <p className="flex-1 text-cyan-400 text-sm font-mono">{content.hashtags.join(' ')}</p>
                                <CopyButton textToCopy={content.hashtags.join(' ')} />
                            </div>
                        </div>
                    </div>
                )}

                <button onClick={onClose} className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    Close
                </button>
            </div>
        </div>
    );
};
