// types.ts

export interface ContentPlan {
    title: string;
    hook: string;
    introduction: string;
    mainPoints: string[];
    conclusion: string;
    cta: string;
    script: string;
    visualSuggestions: string[];
    captions: string[];
    hashtags: string[];
    suggestedDuration: string;
    thumbnailSuggestions?: { concept: string; reason: string }[];
    bRollSuggestions?: { timestamp: string; suggestion: string }[];
}

export interface BrainstormResult {
    contentIdeas: string[];
    uniqueAngles: string[];
    trendingTopics: string[];
}

export interface AnalysisMetric {
    rating: number;
    detailedFeedback: string;
}

export interface EnhancedScriptMetric {
    rating: number;
    feedback: string;
}

export interface VideoAnalysisResult {
    analysis: {
        hook: AnalysisMetric;
        pacing: AnalysisMetric;
        engagement: AnalysisMetric;
        clarity: AnalysisMetric;
        visuals: AnalysisMetric;
    };
    enhancedScript: {
        script: string;
        hook: EnhancedScriptMetric;
        storytelling: EnhancedScriptMetric;
        cta: EnhancedScriptMetric;
    };
}

export interface TopicValidationResult {
    viralityScore: number;
    swotAnalysis: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
    };
    suggestedTopics: string[];
}

export interface SocialContentResult {
    captions: string[];
    hashtags: string[];
}

export interface CampaignPlan {
    objective: string;
    days: {
        day: number;
        topic: string;
        goal: string;
    }[];
}

export interface PerformanceAnalysis {
    viralityPotential: number;
    scores: {
        hookEffectiveness: number;
        clarity: number;
        engagement: number;
        ctaStrength: number;
    };
    audienceSentiment: {
        summary: string;
        commonThemes: string[];
    };
    keyTakeaways: string[];
    improvementSuggestions: string[];
    nextVideoIdeas: string[];
}

export interface HeadshotConfig {
    background: 'Studio White' | 'Studio Gray' | 'Studio Black' | 'Studio Blue' | 'Studio Dark Blue' | 'Studio Green' | 'Studio Orange' | 'Office' | 'Outdoor Cafe' | 'Modern Tech' | 'Bookshelf' | 'Beach' | 'Cityscape' | 'Nature Landscape' | 'Minimalist Studio' | 'Abstract Gradient' | 'Abstract Geometric' | 'Custom';
    lighting: 'Professional Studio' | 'Golden Hour' | 'Dramatic' | 'Natural Daylight' | 'Rim Lighting' | 'Softbox Lighting';
    clothing: {
        enabled: boolean;
        style: 'Business Suit' | 'Casual Blazer' | 'Simple T-Shirt' | 'Turtleneck' | 'Formal Dress' | 'Casual Sweater' | 'Athletic Wear';
        color: string;
    };
    highQuality: boolean;
    backgroundBlur: number;
    customBackground?: {
        data: string; // base64
        mimeType: string;
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
    quality: '720p' | '1080p' | '4K';
    transcriptLog: { text: string, timestamp: number }[];
}

export interface StudioSettings {
    skinTone: 'none' | 'warm' | 'cool' | 'glow';
    skinSmoothingLevel: number; // 0 to 1
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
    livePreviewEnabled: boolean;
    performanceMode: boolean;
    teleprompter: {
        fontSize: number;
        isMirrored: boolean;
        opacity: number;
        textColor: string;
        lookahead: number;
    };
    countdownDuration: 3 | 5 | 10;
}

export interface VideoDevice {
    deviceId: string;
    label: string;
}

export interface TechnicalAnalysis {
    audioLevel: 'good' | 'low' | 'clipping';
    lightingLevel: 'good' | 'dark' | 'bright';
}

export interface SpeechAnalysis {
    wpm: number;
    fillerWords: number;
    stammers: number;
    coachingHint: string | null;
    isListening: boolean;
    liveTranscript: string;
    transcriptLog: { text: string, timestamp: number }[];
}

export interface BrandKit {
    logo: string | null; // base64 data URL
    primaryColor: string;
    secondaryColor: string;
    bio: string;
}

export interface InlineDataPart {
    inlineData: {
        data: string; // base64 encoded string
        mimeType: string;
    };
}

// NEW: Competitor Analysis type for the "Spy" feature
export interface CompetitorAnalysisResult {
    reconstructedScript: string;
    hookAnalysis: {
        hook: string;
        score: number;
        explanation: string;
    };
    secretFormula: {
        title: string;
        description: string;
    }[];
    liveStats?: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
        tags: string[];
    };
    enhancedScript: string;
}