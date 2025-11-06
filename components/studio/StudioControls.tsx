// components/studio/StudioControls.tsx
import * as React from 'react';
import { StudioSettings, VideoDevice } from '../../types';
import { Card } from '../common/Card';
import { CameraIcon } from '../icons/CameraIcon';

interface StudioControlsProps {
    settings: StudioSettings;
    onSettingsChange: (settings: StudioSettings) => void;
    teleprompterSpeed: number;
    onTeleprompterSpeedChange: (speed: number) => void;
    teleprompterFontSize: number;
    onTeleprompterFontSizeChange: (size: number) => void;
    teleprompterMirror: boolean;
    onTeleprompterMirrorChange: (mirror: boolean) => void;
    onSwitchCamera: () => void;
    videoDevices: VideoDevice[];
    onGeneratePreview: () => void;
}

export const StudioControls: React.FC<StudioControlsProps> = ({ 
    settings, onSettingsChange, 
    teleprompterSpeed, onTeleprompterSpeedChange, 
    teleprompterFontSize, onTeleprompterFontSizeChange,
    teleprompterMirror, onTeleprompterMirrorChange,
    onSwitchCamera, videoDevices,
    onGeneratePreview,
}) => {

    const handleSettingChange = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const SettingLabel: React.FC<{ children: React.ReactNode, isExport?: boolean }> = ({ children, isExport = true }) => (
        <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
            <span>{children}</span>
            {isExport && <span className="text-xs text-cyan-400/70 font-normal">On Export</span>}
        </label>
    );

    return (
        <div className="space-y-4">
            <Card title="Teleprompter & Recording">
                <div className="space-y-4 p-2">
                    <div className="space-y-2">
                        <label htmlFor="speed" className="text-sm font-medium text-gray-300">Speed: {teleprompterSpeed.toFixed(1)}</label>
                        <input type="range" id="speed" min="1" max="10" step="0.5" value={teleprompterSpeed} onChange={(e) => onTeleprompterSpeedChange(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"/>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="fontSize" className="text-sm font-medium text-gray-300">Font Size: {teleprompterFontSize}px</label>
                        <input type="range" id="fontSize" min="24" max="120" step="2" value={teleprompterFontSize} onChange={(e) => onTeleprompterFontSizeChange(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"/>
                    </div>
                    <div className="pt-2">
                        <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={teleprompterMirror} onChange={(e) => onTeleprompterMirrorChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500"/><span className="text-gray-300 text-sm">Mirror Teleprompter Text</span></label>
                    </div>
                     <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <SettingLabel isExport={false}>Export Quality</SettingLabel>
                            <select id="exportQuality" value={settings.exportQuality} onChange={(e) => handleSettingChange('exportQuality', e.target.value as StudioSettings['exportQuality'])} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200">
                                <option value="4K">4K (UHD)</option>
                                <option value="1080p">Full HD (1080p)</option>
                                <option value="720p">HD (720p)</option>
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Camera Control</label>
                            <button onClick={onSwitchCamera} disabled={videoDevices.length <= 1} className="mt-1 w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>
                                Switch Camera
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="AI Studio Controls" initiallyOpen={true}>
                 <div className="space-y-6 p-2">
                    <fieldset>
                        <legend className="font-semibold text-gray-200 mb-3 text-md">Appearance</legend>
                        <div className="space-y-4">
                            <div>
                                <SettingLabel>Color Grading</SettingLabel>
                                <select value={settings.colorGrade} onChange={(e) => handleSettingChange('colorGrade', e.target.value as StudioSettings['colorGrade'])} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200">
                                    <option value="none">None</option>
                                    <option value="cinematic">Cinematic Teal & Orange</option>
                                    <option value="vintage">Vintage Film</option>
                                    <option value="noir">Black & White Noir</option>
                                    <option value="vibrant">Vibrant Boost</option>
                                </select>
                            </div>
                             <div>
                                <SettingLabel>Lighting</SettingLabel>
                                <select value={settings.lighting} onChange={(e) => handleSettingChange('lighting', e.target.value as StudioSettings['lighting'])} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200">
                                    <option value="default">Default</option>
                                    <option value="ring">Pro Ring Light</option>
                                    <option value="golden">Golden Hour</option>
                                    <option value="dramatic">Dramatic</option>
                                </select>
                            </div>
                             <div>
                                <SettingLabel>Skin Tone</SettingLabel>
                                <select value={settings.skinTone} onChange={(e) => handleSettingChange('skinTone', e.target.value as StudioSettings['skinTone'])} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200">
                                    <option value="none">None</option>
                                    <option value="warm">Warm</option>
                                    <option value="cool">Cool</option>
                                    <option value="glow">Natural Glow</option>
                                </select>
                            </div>
                             <div>
                                <SettingLabel>Skin Smoothing: {Math.round(settings.skinSmoothingLevel * 100)}%</SettingLabel>
                                <input type="range" id="skinSmoothing" min="0" max="1" step="0.05" value={settings.skinSmoothingLevel} onChange={(e) => handleSettingChange('skinSmoothingLevel', parseFloat(e.target.value))} className="mt-1 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"/>
                             </div>
                        </div>
                    </fieldset>

                     <fieldset>
                        <legend className="font-semibold text-gray-200 mb-3 text-md">Audio & Post-Processing</legend>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={settings.noiseReduction} onChange={(e) => handleSettingChange('noiseReduction', e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500"/><span className="text-gray-300 text-sm">AI Sound Balancer</span><span className="text-xs text-cyan-400/70 font-normal ml-auto">On Export</span></label>
                            <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={settings.autoLeveling} onChange={(e) => handleSettingChange('autoLeveling', e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500"/><span className="text-gray-300 text-sm">Auto-level Volume</span><span className="text-xs text-cyan-400/70 font-normal ml-auto">On Export</span></label>
                            <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={settings.autoCutFillers} onChange={(e) => handleSettingChange('autoCutFillers', e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500"/><span className="text-gray-300 text-sm">Auto-cut Fillers</span><span className="text-xs text-cyan-400/70 font-normal ml-auto">On Export</span></label>
                        </div>
                    </fieldset>

                    <fieldset>
                         <legend className="font-semibold text-gray-200 mb-3 text-md">Background</legend>
                         <div className="space-y-4">
                            <select value={settings.background.mode} onChange={(e) => handleSettingChange('background', { ...settings.background, mode: e.target.value as StudioSettings['background']['mode'] })} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 mb-2">
                                <option value="none">Real Background</option>
                                <option value="vignette">Vignette (Live)</option>
                            </select>
                         </div>
                    </fieldset>
                     
                    <fieldset>
                         <legend className="font-semibold text-gray-200 mb-3 text-md">Overlays</legend>
                         <div className="space-y-4">
                            <div>
                                <SettingLabel isExport={false}>Watermark Text</SettingLabel>
                                <input type="text" value={settings.watermark} onChange={(e) => handleSettingChange('watermark', e.target.value)} placeholder="e.g., @YourHandle" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200"/>
                            </div>
                            <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={settings.showFrameGuide} onChange={(e) => handleSettingChange('showFrameGuide', e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500"/><span className="text-gray-300 text-sm">Show Framing Guide</span></label>
                        </div>
                    </fieldset>

                    <div className="pt-4">
                        <button onClick={onGeneratePreview} className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-md transition">
                            Preview AI Effects
                        </button>
                    </div>
                 </div>
            </Card>
        </div>
    );
};