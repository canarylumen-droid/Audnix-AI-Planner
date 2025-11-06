// components/tabs/CampaignTab.tsx
import * as React from 'react';
import { CampaignPlan } from '../../types';
import { generateCampaignPlan } from '../../services/geminiService';
import { Spinner } from '../common/Spinner';

interface CampaignTabProps {
    onDevelopTopic: (topic: string) => void;
}

export const CampaignTab: React.FC<CampaignTabProps> = ({ onDevelopTopic }) => {
    const [brandInfo, setBrandInfo] = React.useState('');
    const [productInfo, setProductInfo] = React.useState('');
    const [goal, setGoal] = React.useState('Build brand awareness and generate initial sales.');
    const [campaignPlan, setCampaignPlan] = React.useState<CampaignPlan | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [completedDays, setCompletedDays] = React.useState<number[]>([]);

    const handleGenerate = async () => {
        if (!brandInfo.trim() || !productInfo.trim() || !goal.trim()) {
            setError('Please fill out all fields to generate a campaign.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setCampaignPlan(null);
        try {
            const plan = await generateCampaignPlan(brandInfo, productInfo, goal);
            setCampaignPlan(plan);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDayCompletion = (dayNumber: number) => {
        setCompletedDays(prev => 
            prev.includes(dayNumber) ? prev.filter(d => d !== dayNumber) : [...prev, dayNumber]
        );
    };

    const renderInputForm = () => (
        <div className="max-w-2xl mx-auto space-y-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-gray-100">AI Campaign Planner</h2>
            <p className="text-gray-400">Describe your brand and goal to generate a 7-day social media launch plan.</p>
            <div>
                <label htmlFor="brand-info" className="block text-sm font-medium text-gray-300 mb-2">About Your Brand</label>
                <textarea id="brand-info" rows={3} value={brandInfo} onChange={(e) => setBrandInfo(e.target.value)} placeholder="e.g., 'A sustainable coffee brand that sources beans directly from farmers.'" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-400" />
            </div>
            <div>
                <label htmlFor="product-info" className="block text-sm font-medium text-gray-300 mb-2">Product/Service Details</label>
                <textarea id="product-info" rows={3} value={productInfo} onChange={(e) => setProductInfo(e.target.value)} placeholder="e.g., 'Our main product is a monthly subscription box with ethically sourced coffee beans.'" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-400" />
            </div>
            <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-2">Primary Goal</label>
                <input type="text" id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-400" />
            </div>
            <div className="pt-2">
                <button onClick={handleGenerate} disabled={isLoading} className="w-full flex justify-center items-center bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300">
                    {isLoading ? <><Spinner /><span className="ml-2">Generating...</span></> : "Generate 7-Day Launch Plan"}
                </button>
            </div>
        </div>
    );
    
    const renderCampaignView = () => (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-bold text-gray-100">Your 7-Day Launch Campaign</h2>
                <p className="mt-2 text-cyan-400 font-semibold">{campaignPlan!.objective}</p>
            </div>
            <div className="space-y-4">
                {campaignPlan!.days.map(day => (
                    <div key={day.day} className={`p-4 rounded-lg border transition-all ${completedDays.includes(day.day) ? 'bg-green-900/20 border-green-700' : 'bg-gray-800 border-gray-700'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-4">
                                     <input type="checkbox" checked={completedDays.includes(day.day)} onChange={() => toggleDayCompletion(day.day)} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500 cursor-pointer"/>
                                    <div>
                                        <h3 className={`text-lg font-bold ${completedDays.includes(day.day) ? 'text-gray-400 line-through' : 'text-gray-100'}`}>Day {day.day}: {day.topic}</h3>
                                        <p className="text-sm text-gray-400">{day.goal}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-4">
                                <button onClick={() => onDevelopTopic(day.topic)} className="w-full sm:w-auto bg-cyan-600/50 hover:bg-cyan-600/80 text-cyan-200 font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                                    Develop Content
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <button onClick={() => { setCampaignPlan(null); setCompletedDays([])}} className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition">
                Start New Campaign
            </button>
        </div>
    );

    return (
        <div>
            {!campaignPlan ? renderInputForm() : renderCampaignView()}
            {error && (
                 <div className="max-w-2xl mx-auto mt-4 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md">
                    <p className="font-bold">Operation Failed</p>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};