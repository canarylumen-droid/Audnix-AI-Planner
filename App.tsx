import * as React from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/layout/Tabs';
import { PlannerTab } from './components/tabs/PlannerTab';
import { StudioTab } from './components/tabs/StudioTab';
import { ExportsTab } from './components/tabs/ExportsTab';
import { CameraIcon } from './components/icons/CameraIcon';
import { PlanIcon } from './components/icons/PlanIcon';
import { ExportIcon } from './components/icons/ExportIcon';
import { ContentPlan, Recording } from './types';
import { PersonIcon } from './components/icons/PersonIcon';
import { HeadshotTab } from './components/tabs/HeadshotTab';
import { CampaignIcon } from './components/icons/CampaignIcon';
import { CampaignTab } from './components/tabs/CampaignTab';
import { LandingPage } from './components/LandingPage';
import { registerApiErrorHandler } from './services/geminiService';
import { Spinner } from './components/common/Spinner';

// FIX: Removed the conflicting `declare global` for `window.aistudio`. The error message
// indicates that a global type for this property already exists in the project's
// build environment. This local declaration was causing a TypeScript type conflict.
// By removing it, the component will use the correct, pre-defined global type.

const App: React.FC = () => {
    const [apiKeyReady, setApiKeyReady] = React.useState(false);
    const [isCheckingKey, setIsCheckingKey] = React.useState(true);
    const [showLandingPage, setShowLandingPage] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState(0);
    const [recordings, setRecordings] = React.useState<Recording[]>([]);
    const [activePlanForStudio, setActivePlanForStudio] = React.useState<ContentPlan | null>(null);
    const [topicFromCampaign, setTopicFromCampaign] = React.useState<string | null>(null);

     React.useEffect(() => {
        const checkApiKey = async () => {
            try {
                if (await window.aistudio.hasSelectedApiKey()) {
                    setApiKeyReady(true);
                }
            } catch (e) {
                console.error("Error checking for API key:", e);
            } finally {
                setIsCheckingKey(false);
            }
        };
        checkApiKey();

        registerApiErrorHandler(() => {
            setApiKeyReady(false);
        });
    }, []);

    const handleSelectKey = async () => {
        try {
            await window.aistudio.openSelectKey();
            setApiKeyReady(true); // Assume success to avoid race condition
        } catch(e) {
            console.error("Could not open API key selection:", e);
        }
    };


    const handlePlanGenerated = (plan: ContentPlan) => {
        setActivePlanForStudio(plan);
        setActiveTab(2); // Switch to Studio tab
    };
    
    const handleSaveRecording = (recording: Recording) => {
        setRecordings(prev => [recording, ...prev]);
        setActiveTab(4); // Switch to Exports tab
    };

    const handleDevelopFromCampaign = (topic: string) => {
        setTopicFromCampaign(topic);
        setActiveTab(1); // Switch to Planner tab
    };

    const tabs = [
        {
            name: 'Campaign',
            icon: <CampaignIcon />,
            content: <CampaignTab onDevelopTopic={handleDevelopFromCampaign} />,
        },
        {
            name: 'Planner',
            icon: <PlanIcon />,
            content: <PlannerTab onPlanGenerated={handlePlanGenerated} initialTopic={topicFromCampaign} onTopicUsed={() => setTopicFromCampaign(null)} />,
        },
        {
            name: 'Studio',
            icon: <CameraIcon />,
            content: <StudioTab activePlan={activePlanForStudio} onSaveRecording={handleSaveRecording} />,
        },
        {
            name: 'AI Headshot',
            icon: <PersonIcon />,
            content: <HeadshotTab />,
        },
        {
            name: 'Exports',
            icon: <ExportIcon />,
            content: <ExportsTab recordings={recordings} />,
        },
    ];
    
    if (isCheckingKey) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Spinner />
            </div>
        );
    }
    
    if (!apiKeyReady) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-100">
                <div className="text-center max-w-lg">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                        Welcome to Audnix AI Planner
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        To get started, please select a Gemini API key. Your key is stored securely and is only used for the duration of your session.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Using the Gemini API may incur costs. Please review the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">billing information</a>.
                    </p>
                    <button
                        onClick={handleSelectKey}
                        className="mt-8 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105 text-lg"
                    >
                        Select API Key
                    </button>
                </div>
            </div>
        );
    }


    if (showLandingPage) {
        return <LandingPage onGetStarted={() => setShowLandingPage(false)} />;
    }

    return (
        <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <Header />
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
        </div>
    );
};

export default App;