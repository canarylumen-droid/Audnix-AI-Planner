// App.tsx
import * as React from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/layout/Tabs';
import { PlannerTab } from './components/tabs/PlannerTab';
import { StudioTab } from './components/tabs/StudioTab';
import { ExportsTab } from './components/tabs/ExportsTab';
import { CampaignTab } from './components/tabs/CampaignTab';
import { HeadshotTab } from './components/tabs/HeadshotTab';
import { BrandKitTab } from './components/tabs/BrandKitTab';
import { PerformanceTab } from './components/tabs/PerformanceTab';
import { CompetitorAnalysisTab } from './components/tabs/CompetitorAnalysisTab';
import { LandingPage } from './components/LandingPage';

import { PlanIcon } from './components/icons/PlanIcon';
import { CameraIcon } from './components/icons/CameraIcon';
import { ExportIcon } from './components/icons/ExportIcon';
import { CampaignIcon } from './components/icons/CampaignIcon';
import { PersonIcon } from './components/icons/PersonIcon';
import { BrandIcon } from './components/icons/BrandIcon';
import { AnalyticsIcon } from './components/icons/AnalyticsIcon';
import { SpyIcon } from './components/icons/SpyIcon';

import { ContentPlan, Recording, BrandKit, CompetitorAnalysisResult } from './types';

const App: React.FC = () => {
    const [hasStarted, setHasStarted] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState(0);
    const [activePlan, setActivePlan] = React.useState<ContentPlan | null>(null);
    const [recordings, setRecordings] = React.useState<Recording[]>([]);
    const [campaignTopic, setCampaignTopic] = React.useState<string | null>(null);
    const [analysisRecording, setAnalysisRecording] = React.useState<Recording | null>(null);
    const [spyTopic, setSpyTopic] = React.useState<string | null>(null); // NEW for Planner-to-Spy
    
    // Brand Kit State
    const [brandKit, setBrandKit] = React.useState<BrandKit>(() => {
        try {
            const saved = localStorage.getItem('audnixBrandKit');
            return saved ? JSON.parse(saved) : {
                logo: null,
                primaryColor: '#06b6d4', // cyan-500
                secondaryColor: '#a855f7', // violet-500
                bio: ''
            };
        } catch (error) {
            return { logo: null, primaryColor: '#06b6d4', secondaryColor: '#a855f7', bio: '' };
        }
    });

    React.useEffect(() => {
        try {
            localStorage.setItem('audnixBrandKit', JSON.stringify(brandKit));
        } catch (error) {
            console.error("Failed to save brand kit to local storage", error);
        }
    }, [brandKit]);

    const handlePlanGenerated = (plan: ContentPlan) => {
        setActivePlan(plan);
        setActiveTab(2); // Switch to Studio Tab
    };
    
    const handleScriptGeneratedFromSpy = (result: CompetitorAnalysisResult) => {
        const plan: ContentPlan = {
            title: `Inspired by: ${result.hookAnalysis.hook}`,
            script: result.enhancedScript,
            hook: '', introduction: '', mainPoints: [], conclusion: '', cta: '', visualSuggestions: [], captions: [], hashtags: [], suggestedDuration: '',
        }
        setActivePlan(plan);
        setActiveTab(2); // Switch to Studio Tab
    };

    const handleSaveRecording = (recording: Recording) => {
        setRecordings(prev => [recording, ...prev]);
        setActiveTab(3); // Switch to Exports Tab
    };
    
    const handleDevelopTopic = (topic: string) => {
        setCampaignTopic(topic);
        setActiveTab(1); // Switch to Planner Tab
    };

    const handleTopicUsed = () => {
        setCampaignTopic(null);
    };
    
    const handleAnalyzePerformance = (recording: Recording) => {
        setAnalysisRecording(recording);
        setActiveTab(5); // Switch to Performance Tab
    };

    const handleSpyOnTopic = (topic: string) => {
        setSpyTopic(topic);
        setActiveTab(0); // Switch to Spy Tab
    };

    const handleSpyTopicUsed = () => {
        setSpyTopic(null);
    };

    if (!hasStarted) {
        return <LandingPage onGetStarted={() => setHasStarted(true)} />;
    }

    const TABS = [
        { name: 'Competitor Spy', icon: <SpyIcon />, content: <CompetitorAnalysisTab onScriptGenerated={handleScriptGeneratedFromSpy} initialTopic={spyTopic} onTopicUsed={handleSpyTopicUsed} /> },
        { name: 'Planner', icon: <PlanIcon />, content: <PlannerTab onPlanGenerated={handlePlanGenerated} initialTopic={campaignTopic} onTopicUsed={handleTopicUsed} brandKit={brandKit} onSpy={handleSpyOnTopic} /> },
        { name: 'Studio', icon: <CameraIcon />, content: <StudioTab activePlan={activePlan} onSaveRecording={handleSaveRecording} brandKit={brandKit} /> },
        { name: 'Exports', icon: <ExportIcon />, content: <ExportsTab recordings={recordings} onAnalyzePerformance={handleAnalyzePerformance} /> },
        { name: 'Campaign', icon: <CampaignIcon />, content: <CampaignTab onDevelopTopic={handleDevelopTopic} /> },
        { name: 'Performance', icon: <AnalyticsIcon />, content: <PerformanceTab recording={analysisRecording} onAnalysisComplete={() => setAnalysisRecording(null)} /> },
        { name: 'Headshot AI', icon: <PersonIcon />, content: <HeadshotTab /> },
        { name: 'Brand Kit', icon: <BrandIcon />, content: <BrandKitTab brandKit={brandKit} onBrandKitChange={setBrandKit} /> },
    ];

    return (
        <div className="bg-gray-950 min-h-screen text-gray-200 font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <Header />
                <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
        </div>
    );
};

export default App;