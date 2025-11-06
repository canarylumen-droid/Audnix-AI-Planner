// components/tabs/BrandKitTab.tsx
import * as React from 'react';
import { BrandKit } from '../../types';
import { Card } from '../common/Card';
import { UploadIcon } from '../icons/UploadIcon';

interface BrandKitTabProps {
    brandKit: BrandKit;
    onBrandKitChange: (newBrandKit: BrandKit) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const BrandKitTab: React.FC<BrandKitTabProps> = ({ brandKit, onBrandKitChange }) => {
    const logoInputRef = React.useRef<HTMLInputElement>(null);
    const [isSaved, setIsSaved] = React.useState(false);

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64Logo = await fileToBase64(file);
                onBrandKitChange({ ...brandKit, logo: base64Logo });
                showSavedMessage();
            } catch (error) {
                console.error("Error converting logo to base64", error);
            }
        }
    };

    const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor', value: string) => {
        onBrandKitChange({ ...brandKit, [colorType]: value });
    };
    
    const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onBrandKitChange({ ...brandKit, bio: e.target.value });
    };

    // All changes are saved automatically via the main App state, but this provides user feedback.
    const showSavedMessage = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-100">Your Brand Kit</h2>
                <p className="text-gray-400 mt-2">Personalize the AI. Upload your assets and define your brand's voice to get content that is uniquely yours.</p>
            </div>

            <Card title="Brand Logo" initiallyOpen={true}>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                    <div className="w-40 h-40 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 mx-auto">
                        {brandKit.logo ? (
                            <img src={brandKit.logo} alt="Brand Logo" className="object-contain w-full h-full p-2" />
                        ) : (
                            <span className="text-gray-500 text-sm">No Logo</span>
                        )}
                    </div>
                    <div className="md:col-span-2 space-y-4 text-center md:text-left">
                        <p className="text-gray-400">Upload a transparent PNG for the best results. This logo will be automatically used as a watermark in the Studio.</p>
                        <div className="flex gap-4 justify-center md:justify-start">
                             <button onClick={() => logoInputRef.current?.click()} className="saas-button-primary">
                                <UploadIcon className="w-5 h-5 mr-2" /> Upload Logo
                            </button>
                             {brandKit.logo && (
                                <button onClick={() => { onBrandKitChange({ ...brandKit, logo: null }); showSavedMessage(); }} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full">
                                    Remove
                                </button>
                            )}
                        </div>
                        <input ref={logoInputRef} type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleLogoChange} />
                    </div>
                </div>
            </Card>

            <Card title="Brand Colors & Voice" initiallyOpen={true}>
                 <div className="p-4 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Brand Colors</label>
                        <div className="flex items-center gap-6">
                             <div className="flex items-center gap-3">
                                <div className="saas-color-picker-container">
                                  <div className="saas-color-preview" style={{ backgroundColor: brandKit.primaryColor }}></div>
                                  <input type="color" value={brandKit.primaryColor} onBlur={showSavedMessage} onChange={(e) => handleColorChange('primaryColor', e.target.value)} className="saas-color-picker" />
                                </div>
                                <span>Primary</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <div className="saas-color-picker-container">
                                  <div className="saas-color-preview" style={{ backgroundColor: brandKit.secondaryColor }}></div>
                                  <input type="color" value={brandKit.secondaryColor} onBlur={showSavedMessage} onChange={(e) => handleColorChange('secondaryColor', e.target.value)} className="saas-color-picker" />
                                </div>
                                <span>Secondary</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="brand-bio" className="block text-sm font-medium text-gray-300 mb-2">Brand Bio & Voice</label>
                        <textarea 
                            id="brand-bio" 
                            rows={5} 
                            value={brandKit.bio} 
                            onBlur={showSavedMessage}
                            onChange={handleBioChange} 
                            placeholder="e.g., 'We are a fun, energetic brand that uses humor and pop culture references to teach people about finance.'" 
                            className="w-full saas-input" 
                        />
                        <p className="text-xs text-gray-500 mt-2">The AI will use this to match your tone and style in all generated scripts.</p>
                    </div>
                </div>
            </Card>

            <div className={`text-center transition-opacity duration-300 ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-green-400 font-semibold">Changes Saved Automatically!</p>
            </div>
        </div>
    );
};