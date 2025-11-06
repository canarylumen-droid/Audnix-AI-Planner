// types.ts

export interface ContentPlan {
    title: string;
    hook: string;
    introduction: string;
    mainPoints: { point: string; details: string }[];
    conclusion: string;
    cta: string;
    visualSuggestions: string[];
    script: string;
    captions: string[];
    hashtags: string[];
    suggestedDuration: string;
}

export interface BrainstormResult {
    contentIdeas: string[];
    uniqueAngles: string[];
    trendingTopics: string[];
}

export interface VideoAnalysis {
    rating: number;
    detailedFeedback: string;
}

export interface VideoAnalysisResult {
    analysis: {
        hook: VideoAnalysis;
        storytelling: VideoAnalysis;
        cta: VideoAnalysis;
    };
    enhancedScript: {
        script: string;
        hook: { rating: number };
        storytelling: { rating: number };
        cta: { rating: number };
    };
}


export interface Recording {
    id: string;
    title: string;
    date: string;
    blob: Blob;
    url: string;
    captions: string[];
    hashtags: string[];
}


export interface StudioSettings {
    skinTone: 'none' | 'warm' | 'cool' | 'glow';
    skinSmoothingLevel: number;
    noiseReduction: boolean;
    autoLeveling: boolean;
    background: {
        mode: 'none' | 'vignette';
    };
    watermark: string;
    showFrameGuide: boolean;
    exportQuality: '720p' | '1080p' | '4K';
    lighting: 'default' | 'ring' | 'golden' | 'dramatic';
    autoCutFillers: boolean;
    colorGrade: 'none' | 'cinematic' | 'vintage' | 'noir' | 'vibrant';
}

export interface SpeechAnalysis {
    wpm: number;
    fillerWords: number;
    stammers: number;
    coachingHint: string | null;
    isListening: boolean;
}

export interface HeadshotConfig {
    background: 'Office' | 'Outdoor Cafe' | 'Studio Gray' | 'Modern Tech' | 'Bookshelf' | 'Beach' | 'Cityscape' | 'Abstract Gradient' | 'Abstract Geometric' | 'Minimalist Studio' | 'Nature Landscape' | 'Custom';
    customBackground?: string; // base64 string
    lighting: 'Professional Studio' | 'Golden Hour' | 'Dramatic' | 'Natural Daylight' | 'Rim Lighting' | 'Softbox Lighting';
    clothing: {
        enabled: boolean;
        style: 'Business Suit' | 'Casual Blazer' | 'Simple T-Shirt' | 'Turtleneck' | 'Formal Dress' | 'Casual Sweater' | 'Athletic Wear';
        color: string;
    };
    highQuality: boolean;
    backgroundBlur: number;
}

export interface RefinedScriptResult {
    enhancedScript: string;
}

// NEW: Interfaces for the Campaign Planner feature
export interface CampaignDay {
    day: number;
    topic: string;
    goal: string;
}

export interface CampaignPlan {
    objective: string;
    days: CampaignDay[];
}

// NEW: Interface for the real-time technical coach
export interface TechnicalAnalysis {
    audioLevel: 'good' | 'low' | 'clipping';
    lightingLevel: 'good' | 'dark' | 'bright';
}

export interface VideoDevice {
    deviceId: string;
    label: string;
}