// components/studio/StudioControls.tsx
import * as React from 'react';
import { StudioSettings, VideoDevice } from '../../types';
import { Card } from '../common/Card';
import { CameraIcon } from '../icons/CameraIcon';

interface StudioControlsProps {
    settings: StudioSettings;
    onSettingsChange: (settings: StudioSettings) => void;
    onSwitchCamera: (deviceId: string) => void;
    videoDevices: VideoDevice[];
    selectedDeviceId?: string;
    onGeneratePreview: () => void;
}

export const StudioControls: React.FC<StudioControlsProps> = ({ 
    settings, onSettingsChange, 
    onSwitchCamera, videoDevices, selectedDeviceId,
    onGeneratePreview,
}) => {

    const handleSettingChange = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handleTeleprompterChange = <K extends keyof StudioSettings['teleprompter']>(key: K, value: StudioSettings['teleprompter'][K]) => {
        onSettingsChange({
            ...settings,
            teleprompter: { ...settings.teleprompter, [key]: value }
        });
    };

    const SettingLabel: React.FC<{ children: React.ReactNode, isExport?: boolean }> = ({ children, isExport = true }) => (
        <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
            <span>{children}</span>
            {isExport && <span className="text-xs text-teal-400/70 font-normal">On Export</span>}
        </label>
    );
    
    const CustomCheckbox: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; children: React.ReactNode; description?: string; isExport?: boolean; }> = ({ checked, onChange, children, description, isExport = false }) => (
        <label className="saas-checkbox-container p-2 rounded-md hover:bg-gray-800/50">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="saas-checkbox" />
            <div className="ml-3">
                <span className="text-gray-200 text-sm font-semibold flex items-center">{children} {isExport && <span className="text-xs text-teal-400/70 font-normal ml-auto pl-4">On Export</span>}</span>
                {description && <p className="text-xs text-gray-400">{description}</p>}
            </div>
        </label>
    );

    return (
        <div className="space-y-4">
            <Card title="Teleprompter & Recording">
                <div className="space-y-4 p-2">
                     <div className="space-y-2">
                        <label htmlFor="fontSize" className="text-sm font-medium text-gray-300">Font Size: {settings.teleprompter.fontSize}px</label>
                        <input type="range" id="fontSize" min="24" max="120" step="2" value={settings.teleprompter.fontSize} onChange={(e) => handleTeleprompterChange('fontSize', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400"/>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="opacity" className="text-sm font-medium text-gray-300">Background Opacity: {Math.round(settings.teleprompter.opacity * 100)}%</label>
                        <input type="range" id="opacity" min="0.1" max="1" step="0.05" value={settings.teleprompter.opacity} onChange={(e) => handleTeleprompterChange('opacity', parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400"/>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="lookahead" className="text-sm font-medium text-gray-300">Scroll Lookahead: +{settings.teleprompter.lookahead} words</label>
                        <input type="range" id="lookahead" min="0" max="10" step="1" value={settings.teleprompter.lookahead} onChange={(e) => handleTeleprompterChange('lookahead', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400"/>
                    </div>
                    <div className="flex items-center gap-4">
                        <label htmlFor="textColor" className="text-sm font-medium text-gray-300">Text Color</label>
                        <div className="saas-color-picker-container">
                            <div className="saas-color-preview" style={{backgroundColor: settings.teleprompter.textColor}}></div>
                            <input type="color" id="textColor" value={settings.teleprompter.textColor} onChange={(e) => handleTeleprompterChange('textColor', e.target.value)} className="saas-color-picker" />
                        </div>
                    </div>
                    <div className="pt-2">
                       <CustomCheckbox checked={settings.teleprompter.isMirrored} onChange={(checked) => handleTeleprompterChange('isMirrored', checked)}>Mirror Teleprompter</CustomCheckbox>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <SettingLabel isExport={false}>Countdown</SettingLabel>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {([3, 5, 10] as const).map(duration => (
                                    <button
                                        key={duration}
                                        onClick={() => handleSettingChange('countdownDuration', duration)}
                                        className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${settings.countdownDuration === duration ? 'bg-teal-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                                    >
                                        {duration}s
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <SettingLabel isExport={false}>Export Quality</SettingLabel>
                            <div className="saas-select-container mt-1">
                                <select id="exportQuality" value={settings.exportQuality} onChange={(e) => handleSettingChange('exportQuality', e.target.value as StudioSettings['exportQuality'])} className="w-full saas-input saas-select">
                                    <option value="4K">4K (UHD)</option>
                                    <option value="1080p">Full HD (1080p)</option>
                                    <option value="720p">HD (720p)</option>
                                </select>
                                <div className="saas-select-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                            </div>
                        </div>
                         <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium text-gray-300">Camera Input</label>
                            <div className="saas-select-container mt-1">
                                <select 
                                    id="camera-select"
                                    value={selectedDeviceId || ''}
                                    onChange={e => onSwitchCamera(e.target.value)}
                                    disabled={videoDevices.length <= 1}
                                    className="w-full saas-input saas-select disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                    {videoDevices.map(device => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Camera ${device.deviceId.substring(0, 6)}`}
                                        </option>
                                    ))}
                                </select>
                                <div className="saas-select-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="AI Studio Controls" initiallyOpen={true}>
                 <div className="space-y-6 p-2">
                    <fieldset>
                        <legend className="font-semibold text-gray-200 mb-3 text-md">Appearance</legend>
                        <div className="space-y-4">
                             <CustomCheckbox checked={settings.livePreviewEnabled} onChange={(checked) => handleSettingChange('livePreviewEnabled', checked)} description="See color/lighting effects in real-time. May reduce camera smoothness.">Live AI Effects Preview</CustomCheckbox>
                            <div>
                                <SettingLabel>Color Grading</SettingLabel>
                                <div className="saas-select-container mt-1">
                                    <select value={settings.colorGrade} onChange={(e) => handleSettingChange('colorGrade', e.target.value as StudioSettings['colorGrade'])} className="w-full saas-input saas-select">
                                        <option value="none">None</option>
                                        <option value="cinematic">Cinematic Teal & Orange</option>
                                        <option value="vintage">Vintage Film</option>
                                        <option value="noir">Black & White Noir</option>
                                        <option value="vibrant">Vibrant Boost</option>
                                    </select>
                                    <div className="saas-select-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                                </div>
                            </div>
                             <div>
                                <SettingLabel>Lighting</SettingLabel>
                                <div className="saas-select-container mt-1">
                                    <select value={settings.lighting} onChange={(e) => handleSettingChange('lighting', e.target.value as StudioSettings['lighting'])} className="w-full saas-input saas-select">
                                        <option value="default">Default</option>
                                        <option value="ring">Pro Ring Light</option>
                                        <option value="golden">Golden Hour</option>
                                        <option value="dramatic">Dramatic</option>
                                    </select>
                                    <div className="saas-select-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                                </div>
                            </div>
                             <div>
                                <SettingLabel>Skin Tone</SettingLabel>
                                <div className="saas-select-container mt-1">
                                    <select value={settings.skinTone} onChange={(e) => handleSettingChange('skinTone', e.target.value as StudioSettings['skinTone'])} className="w-full saas-input saas-select">
                                        <option value="none">None</option>
                                        <option value="warm">Warm</option>
                                        <option value="cool">Cool</option>
                                        <option value="glow">Natural Glow</option>
                                    </select>
                                    <div className="saas-select-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                                </div>
                            </div>
                             <div>
                                <SettingLabel>Skin Smoothing: {Math.round(settings.skinSmoothingLevel * 100)}%</SettingLabel>
                                <input type="range" id="skinSmoothing" min="0" max="1" step="0.05" value={settings.skinSmoothingLevel} onChange={(e) => handleSettingChange('skinSmoothingLevel', parseFloat(e.target.value))} className="mt-1 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400"/>
                             </div>
                        </div>
                    </fieldset>

                     <fieldset>
                        <legend className="font-semibold text-gray-200 mb-3 text-md">Audio & Post-Processing</legend>
                        <div className="space-y-1">
                            <CustomCheckbox checked={settings.noiseReduction} onChange={(checked) => handleSettingChange('noiseReduction', checked)} isExport={true}>AI Sound Balancer</CustomCheckbox>
                            <CustomCheckbox checked={settings.autoLeveling} onChange={(checked) => handleSettingChange('autoLeveling', checked)} isExport={true}>Auto-level Volume</CustomCheckbox>
                            <CustomCheckbox checked={settings.autoCutFillers} onChange={(checked) => handleSettingChange('autoCutFillers', checked)} isExport={true}>Auto-cut Fillers</CustomCheckbox>
                        </div>
                    </fieldset>

                    <fieldset>
                         <legend className="font-semibold text-gray-200 mb-3 text-md">Background</legend>
                         <div className="saas-select-container">
                            <select value={settings.background.mode} onChange={(e) => handleSettingChange('background', { ...settings.background, mode: e.target.value as StudioSettings['background']['mode'] })} className="w-full saas-input saas-select">
                                <option value="none">Real Background</option>
                                <option value="vignette">Vignette (Live)</option>
                            </select>
                            <div className="saas-select-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                         </div>
                    </fieldset>
                     
                    <fieldset>
                         <legend className="font-semibold text-gray-200 mb-3 text-md">Overlays</legend>
                         <div className="space-y-4">
                            <div>
                                <SettingLabel isExport={false}>Watermark Text</SettingLabel>
                                <input type="text" value={settings.watermark} onChange={(e) => handleSettingChange('watermark', e.target.value)} placeholder="e.g., @YourHandle" className="mt-1 w-full saas-input"/>
                            </div>
                           <CustomCheckbox checked={settings.showFrameGuide} onChange={(checked) => handleSettingChange('showFrameGuide', checked)}>Show Framing Guide</CustomCheckbox>
                        </div>
                    </fieldset>

                    <div className="pt-4">
                        <button onClick={onGeneratePreview} className="w-full saas-button-primary">
                            Preview AI Effects
                        </button>
                    </div>
                 </div>
            </Card>
        </div>
    );
};