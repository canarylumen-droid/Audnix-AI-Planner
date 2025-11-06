// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { 
    ContentPlan, 
    BrainstormResult, 
    VideoAnalysisResult, 
    InlineDataPart, 
    SocialContentResult, 
    HeadshotConfig, 
    CampaignPlan,
    PerformanceAnalysis,
    TopicValidationResult,
    CompetitorAnalysisResult,
    StudioSettings
} from '../types';

let ai: GoogleGenAI;

// Initialize the AI client
const getAiClient = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API key is not configured. Please add it to your environment variables.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

async function callGeminiAndParseJson<T>(model: 'gemini-2.5-pro' | 'gemini-2.5-flash', prompt: string, schema?: any, useSearch: boolean = false): Promise<T> {
    const aiClient = getAiClient();
    try {
        const config: any = {};
        let finalPrompt = prompt;
        
        // FIX: Conditionally set the config. The API does not allow `tools` and `responseMimeType: 'application/json'` together.
        if (useSearch) {
            config.tools = [{ googleSearch: {} }];
            // The prompt must instruct the model to return JSON when using search.
            finalPrompt += "\n\nCRITICAL: Your final output must be ONLY the JSON object described in the prompt, with no extra text or markdown formatting."
        } else {
            config.responseMimeType = 'application/json';
            config.responseSchema = schema;
        }

        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: finalPrompt }] }],
            config: config,
        });

        let jsonText = response.text.trim();
        
        // Clean up markdown code block if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7);
            if (jsonText.endsWith('```')) {
                jsonText = jsonText.substring(0, jsonText.length - 3);
            }
        }
        
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                 throw new Error(`Invalid API Key: Please ensure your API key is correctly configured.`);
            }
            if (error.message.toLowerCase().includes('json')) {
                console.error("Gemini response was likely not valid JSON");
                throw new Error(`Gemini API Error: Failed to parse JSON response. The model may have returned improperly formatted text.`);
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}


export const generateContentPlan = async (topic: string, videoStyle: string, targetAudience: string, brandBio: string): Promise<ContentPlan> => {
    const prompt = `
        You are an expert viral video content strategist. Create a complete content plan for a short-form video (like TikTok, Reels, YouTube Shorts).

        **Video Topic:** "${topic}"
        **Video Style/Tone:** ${videoStyle}
        **Target Audience:** ${targetAudience}
        **Brand Bio/Voice:** "${brandBio}"

        Your output must be a JSON object that strictly follows this schema, providing rich and detailed content for every field.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            introduction: { type: Type.STRING },
            mainPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            conclusion: { type: Type.STRING },
            cta: { type: Type.STRING },
            script: { type: Type.STRING },
            visualSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            captions: { type: Type.ARRAY, items: { type: Type.STRING } },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedDuration: { type: Type.STRING },
            thumbnailSuggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        concept: { type: Type.STRING },
                        reason: { type: Type.STRING }
                    },
                    required: ['concept', 'reason']
                }
            },
            bRollSuggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        timestamp: { type: Type.STRING },
                        suggestion: { type: Type.STRING }
                    },
                    required: ['timestamp', 'suggestion']
                }
            }
        },
        required: ['title', 'hook', 'script', 'captions', 'hashtags', 'thumbnailSuggestions', 'bRollSuggestions']
    };

    return callGeminiAndParseJson<ContentPlan>('gemini-2.5-pro', prompt, schema);
};


export const spyOnCompetitor = async (videoUrl: string, userIdea: string): Promise<CompetitorAnalysisResult> => {
    const prompt = `
        You are a world-class viral video analyst. Your task is to analyze a competitor's video from a public URL and synthesize a superior script for the user.

        **CRITICAL INSTRUCTIONS:**
        1.  **Use your search tool** to find information about the video at this URL: **${videoUrl}**
        2.  Find the video's title, description, and, most importantly, **its full transcript or captions**.
        3.  Analyze the transcript to understand the video's structure, pacing, and message.
        4.  Based on your analysis, provide a strategic breakdown.
        5.  The user has provided their own idea or angle: "${userIdea || 'No specific idea provided. Base your script purely on outperforming the competitor.'}"
        6.  Finally, create a new, superior 'enhancedScript' that combines the competitor's successful formula with the user's unique angle.

        Your output must be a single JSON object with the following structure:
        {
          "reconstructedScript": "<The full transcript of the competitor's video you found>",
          "hookAnalysis": {
            "hook": "<The first 3-5 seconds of their script>",
            "score": <A score from 1-100 on the hook's effectiveness>,
            "explanation": "<Why the hook is effective or not>"
          },
          "secretFormula": [
            {"title": "<Strategic Element 1, e.g., 'Fast Pacing'>", "description": "<Explanation of how they used it>"},
            {"title": "<Strategic Element 2, e.g., 'Relatable Problem'>", "description": "<Explanation>"}
          ],
          "enhancedScript": "<The new, superior script you've written for the user>"
        }
    `;
    
    // We pass null for schema because we are using search and can't use responseSchema together. The prompt itself defines the JSON.
    return callGeminiAndParseJson<CompetitorAnalysisResult>('gemini-2.5-pro', prompt, null, true);
};


export const brainstormIdeas = async (topic: string, videoStyle: string, targetAudience: string): Promise<BrainstormResult> => {
    const prompt = `
        You are a viral content ideator. Brainstorm ideas related to the central topic.

        **Central Topic:** "${topic}"
        **Video Style/Tone:** ${videoStyle}
        **Target Audience:** ${targetAudience}

        Provide your output as a JSON object with three keys: "contentIdeas", "uniqueAngles", "trendingTopics".
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
            uniqueAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
            trendingTopics: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['contentIdeas', 'uniqueAngles', 'trendingTopics']
    };

    return callGeminiAndParseJson<BrainstormResult>('gemini-2.5-flash', prompt, schema);
};

export const analyzeAndEnhanceScript = async (video: InlineDataPart, userScript: string): Promise<VideoAnalysisResult> => {
    const aiClient = getAiClient();
    const prompt = `
        As a world-class video analyst and scriptwriter, analyze the provided video and enhance the user's script notes.
        The user wants to create a better, more viral video inspired by the one provided.

        **User's Script Notes/Ideas:**
        "${userScript}"

        First, analyze the provided video across several metrics. Provide a rating from 1-100 and detailed feedback for each.
        - **Hook:** How well does it grab attention in the first 3 seconds?
        - **Pacing:** Is the video well-paced? Too fast, too slow?
        - **Engagement:** How well does it hold attention? Are there lulls?
        - **Clarity:** Is the message clear and easy to understand?
        - **Visuals:** How effective are the visuals and on-screen elements?

        Second, based on your analysis and the user's notes, write a new, superior script. This script should incorporate the user's ideas but be optimized for maximum engagement and virality. Also, provide ratings (1-100) and brief feedback on the new script's hook, storytelling, and CTA.

        Your output must be a single JSON object with the specified "analysis" and "enhancedScript" structure.
    `;

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [video, { text: prompt }] }],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as VideoAnalysisResult;
    } catch (error) {
        console.error("Error in analyzeAndEnhanceScript:", error);
        throw new Error("Failed to analyze the video and enhance the script.");
    }
};

export const generateFinalPlan = async (brainstorm: BrainstormResult, analysis: VideoAnalysisResult, userScript: string): Promise<ContentPlan> => {
    const prompt = `
        You are an expert content strategist. A user has performed brainstorming and competitive analysis. Your task is to synthesize all this information into a single, ultimate content plan.

        **Initial Brainstorming Ideas:**
        - Content Ideas: ${brainstorm.contentIdeas.join(', ')}
        - Unique Angles: ${brainstorm.uniqueAngles.join(', ')}

        **Competitive Analysis & Enhanced Script:**
        - First draft of enhanced script: "${analysis.enhancedScript.script}"
        - User's original notes: "${userScript}"

        Synthesize all of the above to create the best possible content plan. Produce a JSON object matching the ContentPlan schema (title, hook, script, captions, etc.).
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            introduction: { type: Type.STRING },
            mainPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            conclusion: { type: Type.STRING },
            cta: { type: Type.STRING },
            script: { type: Type.STRING },
            visualSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            captions: { type: Type.ARRAY, items: { type: Type.STRING } },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedDuration: { type: Type.STRING },
        },
        required: ['title', 'hook', 'script', 'captions', 'hashtags']
    };
    return callGeminiAndParseJson<ContentPlan>('gemini-2.5-pro', prompt, schema);
};

export const refineScript = async (script: string): Promise<{ enhancedScript: string }> => {
    const prompt = `
        You are a master script editor. Refine this video script to be more concise, impactful, and engaging for a short-form video audience.

        **Original Script:**
        "${script}"

        Return a JSON object with a single key "enhancedScript" containing the refined script.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            enhancedScript: { type: Type.STRING }
        },
        required: ['enhancedScript']
    };
    return callGeminiAndParseJson<{ enhancedScript: string }>('gemini-2.5-flash', prompt, schema);
};

export const generateSocialContent = async (transcript: string, title: string): Promise<SocialContentResult> => {
    const prompt = `
        Based on the transcript and title of a finished video, generate 3 engaging captions and 15 relevant hashtags.

        **Video Title:** "${title}"
        **Video Transcript:** "${transcript}"

        Generate a JSON object with two keys: "captions" (an array of strings) and "hashtags" (an array of strings).
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            captions: { type: Type.ARRAY, items: { type: Type.STRING } },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['captions', 'hashtags']
    };
    return callGeminiAndParseJson<SocialContentResult>('gemini-2.5-flash', prompt, schema);
};

export const generateHeadshot = async (base64Image: string, config: HeadshotConfig): Promise<string> => {
    const aiClient = getAiClient();
    const clothingPrompt = config.clothing.enabled
        ? `The person should be wearing a ${config.clothing.style} in the color ${config.clothing.color}.`
        : "Keep the person's clothing as it is in the original photo.";

    const backgroundPrompt = config.background === 'Custom' && config.customBackground
        ? "Use the provided background image."
        : `Place the person in a professional '${config.background}' setting.`;

    const promptParts: (object)[] = [
        { text: "You are an expert headshot photographer. Transform the provided image into a professional-grade headshot based on the following instructions." },
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `
            **Instructions:**
            1.  **Background:** ${backgroundPrompt} The background should have a blur effect with an intensity of approximately ${config.backgroundBlur * 100}%.
            2.  **Lighting:** The lighting should be flattering, in the style of '${config.lighting}'.
            3.  **Clothing:** ${clothingPrompt}
            4.  **Composition:** Crop to a standard head-and-shoulders portrait.
        `},
    ];

    if (config.background === 'Custom' && config.customBackground) {
        promptParts.push({
            inlineData: {
                data: config.customBackground.data,
                mimeType: config.customBackground.mimeType
            }
        });
    }
    
    const model = 'gemini-2.5-flash-image';

    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: { parts: promptParts },
            config: {
                responseModalities: ['IMAGE'],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image was generated by the model.");
    } catch (error) {
        console.error("Error in generateHeadshot:", error);
        throw new Error("Failed to generate the headshot.");
    }
};

export const generateEffectsPreview = async (base64Image: string, settings: Pick<StudioSettings, 'colorGrade' | 'lighting' | 'skinTone' | 'skinSmoothingLevel'>): Promise<string> => {
    const aiClient = getAiClient();
    const prompt = `
        You are an expert photo editor applying real-time effects. Transform the provided image based on these settings.
        Your output must only be the edited image. Do not add text or borders.

        **Instructions:**
        1. **Color Grade:** Apply a '${settings.colorGrade}' color grade. If 'none', make subtle, professional adjustments.
        2. **Lighting:** Re-light the subject with a '${settings.lighting}' style.
        3. **Skin Tone:** Adjust the skin tone to be more '${settings.skinTone}'. If 'none', keep it natural.
        4. **Skin Smoothing:** Apply a skin smoothing effect of about ${Math.round(settings.skinSmoothingLevel * 100)}%.
    `;

    const model = 'gemini-2.5-flash-image';

    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: { parts: [
                { text: prompt },
                { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
            ] },
            config: {
                responseModalities: ['IMAGE'],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No preview image was generated by the model.");
    } catch (error) {
        console.error("Error in generateEffectsPreview:", error);
        throw new Error("Failed to generate the effects preview.");
    }
};


export const generateCampaignPlan = async (brandInfo: string, productInfo: string, goal: string): Promise<CampaignPlan> => {
     const prompt = `
        You are a social media campaign strategist. Create a 7-day launch campaign plan.

        **Brand Info:** ${brandInfo}
        **Product/Service:** ${productInfo}
        **Primary Goal:** ${goal}

        The output should be a JSON object with "objective" and "days".
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            objective: { type: Type.STRING },
            days: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.INTEGER },
                        topic: { type: Type.STRING },
                        goal: { type: Type.STRING }
                    },
                    required: ['day', 'topic', 'goal']
                }
            }
        },
        required: ['objective', 'days']
    };
    return callGeminiAndParseJson<CampaignPlan>('gemini-2.5-flash', prompt, schema);
};

export const analyzeVideoPerformance = async (title: string, transcript: string, comments: string): Promise<PerformanceAnalysis> => {
    const prompt = `
        You are a data-driven video growth consultant. Analyze the performance of a video based on its details.

        **Video Title:** "${title}"
        **Transcript:** "${transcript}"
        **Sample Audience Comments:** "${comments || 'No comments provided.'}"

        Provide a detailed analysis as a JSON object with the specified structure.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            viralityPotential: { type: Type.INTEGER },
            scores: {
                type: Type.OBJECT,
                properties: {
                    hookEffectiveness: { type: Type.INTEGER },
                    clarity: { type: Type.INTEGER },
                    engagement: { type: Type.INTEGER },
                    ctaStrength: { type: Type.INTEGER },
                },
                required: ['hookEffectiveness', 'clarity', 'engagement', 'ctaStrength']
            },
            audienceSentiment: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    commonThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['summary', 'commonThemes']
            },
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextVideoIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['viralityPotential', 'scores', 'audienceSentiment', 'keyTakeaways', 'improvementSuggestions', 'nextVideoIdeas']
    };

    // This is a complex task, use Pro
    return callGeminiAndParseJson<PerformanceAnalysis>('gemini-2.5-pro', prompt, schema);
};


export const validateTopic = async (topic: string): Promise<TopicValidationResult> => {
    const prompt = `
        As a viral content analyst, evaluate the potential of a video topic.

        **Topic:** "${topic}"

        Provide your analysis as a JSON object with "viralityScore", "swotAnalysis", and "suggestedTopics".
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            viralityScore: { type: Type.INTEGER },
            swotAnalysis: {
                type: Type.OBJECT,
                properties: {
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['strengths', 'weaknesses', 'opportunities', 'threats']
            },
            suggestedTopics: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['viralityScore', 'swotAnalysis', 'suggestedTopics']
    };
    return callGeminiAndParseJson<TopicValidationResult>('gemini-2.5-flash', prompt, schema);
};