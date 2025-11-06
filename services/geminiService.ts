// services/geminiService.ts
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { BrainstormResult, CampaignPlan, ContentPlan, HeadshotConfig, RefinedScriptResult, VideoAnalysisResult } from "../types";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY! });

let apiErrorHandler: (() => void) | null = null;
export const registerApiErrorHandler = (handler: () => void) => {
    apiErrorHandler = handler;
};

const handleError = (error: unknown, context: string): never => {
    console.error(`Error ${context}:`, error);
    if (error instanceof Error && (error.message.includes('PERMISSION_DENIED') || error.message.includes('API key not valid'))) {
        apiErrorHandler?.();
    }
    throw new Error(`Failed to ${context}. ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`);
};


const contentPlanSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'A catchy, viral-optimized title for a short-form video (e.g., TikTok, Reels, Shorts).' },
        hook: { type: Type.STRING, description: 'An incredibly strong, scroll-stopping opening line (first 3 seconds) based on deep research of what works for the topic.' },
        introduction: { type: Type.STRING, description: 'A brief introduction that sets the stage for the video\'s topic.' },
        mainPoints: {
            type: Type.ARRAY,
            description: 'A list of 2-4 key points or segments that form the body of the video.',
            items: {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING, description: 'The main idea of the segment.' },
                    details: { type: Type.STRING, description: 'A brief elaboration on the point.' }
                },
                required: ['point', 'details'],
            }
        },
        conclusion: { type: Type.STRING, description: 'A summary that wraps up the video\'s message.' },
        cta: { type: Type.STRING, description: 'A clear call to action, like "Follow for more!" or "Comment your thoughts below!"' },
        visualSuggestions: {
            type: Type.ARRAY,
            description: 'A list of ideas for visuals, b-roll, or on-screen text to enhance engagement.',
            items: { type: Type.STRING }
        },
        script: { type: Type.STRING, description: 'A complete, ready-to-read script combining the hook, intro, main points, conclusion, and CTA into a single flowing narrative.' },
        captions: {
            type: Type.ARRAY,
            description: 'A list of 3 short, punchy caption options for the video.',
            items: { type: Type.STRING }
        },
        hashtags: {
            type: Type.ARRAY,
            description: 'A list of 3-5 relevant hashtags to improve discoverability.',
            items: { type: Type.STRING }
        },
        suggestedDuration: { type: Type.STRING, description: 'The optimal video duration (e.g., "15-20 seconds") based on platform best practices for the topic.' }
    },
    required: ['title', 'hook', 'introduction', 'mainPoints', 'conclusion', 'cta', 'visualSuggestions', 'script', 'captions', 'hashtags', 'suggestedDuration']
};

const brainstormResultSchema = {
    type: Type.OBJECT,
    properties: {
        contentIdeas: { 
            type: Type.ARRAY, 
            description: 'A list of 3-5 creative and specific content ideas.',
            items: { type: Type.STRING } 
        },
        uniqueAngles: { 
            type: Type.ARRAY, 
            description: 'A list of 2-3 unique angles or perspectives on the topic to make the content stand out.',
            items: { type: Type.STRING } 
        },
        trendingTopics: { 
            type: Type.ARRAY,
            description: 'A list of 2-3 related trending topics or keywords to increase relevance and reach.',
            items: { type: Type.STRING } 
        }
    },
    required: ['contentIdeas', 'uniqueAngles', 'trendingTopics']
};

const videoAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: {
            type: Type.OBJECT,
            properties: {
                hook: {
                    type: Type.OBJECT,
                    properties: {
                        rating: { type: Type.NUMBER, description: 'Rating from 1-100 for the video\'s hook effectiveness.' },
                        detailedFeedback: { type: Type.STRING, description: 'Provide a detailed, timestamped (e.g., **0-3s:**, **4-10s:**) analysis with specific, actionable feedback on how to improve the hook for virality.' }
                    },
                    required: ['rating', 'detailedFeedback']
                },
                storytelling: {
                    type: Type.OBJECT,
                    properties: {
                        rating: { type: Type.NUMBER, description: 'Rating from 1-100 for the video\'s storytelling and engagement.' },
                        detailedFeedback: { type: Type.STRING, description: 'Provide a detailed, timestamped analysis with feedback on the pacing, narrative, and body of the video.' }
                    },
                    required: ['rating', 'detailedFeedback']
                },
                cta: {
                    type: Type.OBJECT,
                    properties: {
                        rating: { type: Type.NUMBER, description: 'Rating from 1-100 for the effectiveness of the call to action.' },
                        detailedFeedback: { type: Type.STRING, description: 'Provide a detailed, timestamped analysis with feedback on the CTA\'s clarity and power.' }
                    },
                     required: ['rating', 'detailedFeedback']
                }
            },
            required: ['hook', 'storytelling', 'cta']
        },
        enhancedScript: {
            type: Type.OBJECT,
            properties: {
                script: { type: Type.STRING, description: 'A new, powerfully enhanced script combining the user\'s input, video analysis, and competitive research.' },
                hook: { type: Type.OBJECT, properties: { rating: { type: Type.NUMBER } }, required: ['rating']},
                storytelling: { type: Type.OBJECT, properties: { rating: { type: Type.NUMBER } }, required: ['rating']},
                cta: { type: Type.OBJECT, properties: { rating: { type: Type.NUMBER } }, required: ['rating']},
            },
            required: ['script', 'hook', 'storytelling', 'cta']
        }
    },
    required: ['analysis', 'enhancedScript']
}

const refinedScriptSchema = {
    type: Type.OBJECT,
    properties: {
        enhancedScript: { 
            type: Type.STRING, 
            description: 'A new, powerfully enhanced script that is significantly better than the original, optimized for virality on short-form video platforms.'
        },
    },
    required: ['enhancedScript']
};

const campaignPlanSchema = {
    type: Type.OBJECT,
    properties: {
        objective: { type: Type.STRING, description: 'A single, clear objective for the 7-day launch campaign.' },
        days: {
            type: Type.ARRAY,
            description: 'A list of 7 daily content plans.',
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: 'The day number (1-7).' },
                    topic: { type: Type.STRING, description: 'The specific, engaging video topic for the day.' },
                    goal: { type: Type.STRING, description: 'The primary goal for this day\'s content (e.g., "Build Awareness," "Drive Engagement," "Educate Audience").' }
                },
                required: ['day', 'topic', 'goal']
            }
        }
    },
    required: ['objective', 'days']
};

export const generateContentPlan = async (topic: string, videoStyle: string, targetAudience: string): Promise<ContentPlan> => {
     const prompt = `
        You are a viral video strategist. Create a detailed content plan for a short-form vertical video.
        The video must be hyper-optimized for virality and audience retention. Analyze social media trends for the topic to determine the absolute best video duration for maximum engagement.

        Video Topic: "${topic}"
        Desired Style/Tone: "${videoStyle}"
        Target Audience: "${targetAudience}"

        Follow these critical instructions:
        1.  **Hook**: The first 3 seconds are everything. Generate a hook that is so powerful it's impossible to scroll past. Use deep research to find what works for this niche. It MUST be specific and non-generic.
        2.  **Storytelling & Body**: Weave points into a compelling narrative. Maintain high energy.
        3.  **Call to Action (CTA)**: Make the CTA powerful and direct (e.g., "Comment 'BOOST' if you want the full guide").
        4.  **Duration**: Based on your research, state the optimal video duration for this content.
        
        Generate a complete plan based on the provided schema.
    `;
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: contentPlanSchema }
        });
        return JSON.parse(response.text.trim()) as ContentPlan;
    } catch (error) {
        handleError(error, 'generate content plan');
    }
};

export const brainstormIdeas = async (topic: string, videoStyle: string, targetAudience: string): Promise<BrainstormResult> => {
    const prompt = `
        Brainstorm viral ideas for a short-form video (TikTok, Reels).
        Topic: "${topic}", Style: "${videoStyle}", Audience: "${targetAudience}".
        Generate creative content ideas, unique angles, and related trending topics.
    `;
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: brainstormResultSchema }
        });
        return JSON.parse(response.text.trim()) as BrainstormResult;
    } catch (error) {
        handleError(error, 'brainstorm ideas');
    }
};

export const analyzeAndEnhanceScript = async (video: { data: string, mimeType: string }, userScript: string): Promise<VideoAnalysisResult> => {
    const prompt = `
        You are an expert viral video analyst.
        1.  **Analyze the provided video**: Provide a detailed, almost frame-by-frame analysis. Break down your feedback by timestamps (e.g., **0-3s:**, **4-10s:**). Identify the most powerful 3-second hook within the video. Rate the hook, storytelling, and CTA from 1-100.
        2.  **Research**: Based on the video's topic, perform a quick mental search of what makes similar videos go viral on platforms like TikTok and Reels.
        3.  **Enhance**: Take the user's raw script notes: "${userScript}".
        4.  **Synthesize**: Combine your analysis, research, and the user's notes into a new, powerful, complete video script. This new script should be significantly better.
        5.  **Rate the New Script**: Rate the hook, storytelling, and CTA of your new script from 1-100.
        
        Provide the full output in the specified JSON format.
    `;
     try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { inlineData: { mimeType: video.mimeType, data: video.data }},
                    { text: prompt }
                ]
            },
            config: { responseMimeType: 'application/json', responseSchema: videoAnalysisSchema }
        });
        return JSON.parse(response.text.trim()) as VideoAnalysisResult;
    } catch (error) {
        handleError(error, 'analyze video and enhance script');
    }
}

export const refineScript = async (script: string): Promise<RefinedScriptResult> => {
    const prompt = `
        You are an expert viral video scriptwriter for platforms like TikTok and Instagram Reels.
        Your task is to take the user's raw script and enhance it to be more engaging, punchy, and optimized for high audience retention.

        Here is the script you need to improve:
        ---
        ${script}
        ---

        Follow these instructions:
        1.  **Strengthen the Hook:** Rewrite the first 3 seconds to be absolutely scroll-stopping.
        2.  **Improve Flow & Pacing:** Make sure the script flows well and maintains energy. Cut any fluff.
        3.  **Punch Up the Language:** Use stronger verbs, more vivid language, and a conversational tone.
        4.  **Add a Powerful CTA:** Ensure the script ends with a clear and compelling call to action.
        5.  **Return Only the Script:** Provide only the full, enhanced script text in the response.

        Generate the enhanced script based on the provided schema.
    `;
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: refinedScriptSchema }
        });
        return JSON.parse(response.text.trim()) as RefinedScriptResult;
    } catch (error) {
        handleError(error, 'refine script');
    }
};

export const generateCampaignPlan = async (brandInfo: string, productInfo: string, goal: string): Promise<CampaignPlan> => {
    const prompt = `
        You are a professional social media launch strategist. The user is launching a new brand/product for the first time on social media (Instagram, TikTok).
        Create a 7-day content plan to build hype, educate the audience, and drive initial engagement.

        **Brand Information:** ${brandInfo}
        **Product/Service Information:** ${productInfo}
        **Primary Goal:** ${goal}

        For each of the 7 days, provide a specific video topic and the goal for that day's content. The topics should be creative, engaging, and build on each other to tell a story over the week.
        The overall objective should summarize the entire 7-day strategy.
        Generate the plan based on the provided JSON schema.
    `;
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: campaignPlanSchema }
        });
        return JSON.parse(response.text.trim()) as CampaignPlan;
    } catch (error) {
        handleError(error, 'generate campaign plan');
    }
};


const getBlurDescription = (blurValue: number): string => {
    if (blurValue <= 0.1) return 'The background should be sharp and in focus.';
    if (blurValue <= 0.4) return 'The background should be subtly blurred to keep the focus on the person.';
    if (blurValue <= 0.7) return 'The background should be moderately blurred (bokeh effect).';
    return 'The background should be heavily blurred, making it abstract.';
};

export const generateHeadshot = async (
    base64Image: string,
    config: HeadshotConfig
): Promise<string> => {
    const blurInstruction = getBlurDescription(config.backgroundBlur);
    let prompt = '';
    // FIX: Corrected the type of `parts` to be a union of image and text part objects.
    const parts: ({ inlineData: { mimeType: string, data: string } } | { text: string })[] = [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
    ];

    const commonInstructions = `
        **CRITICAL INSTRUCTIONS:**
        1.  **Preserve Identity:** Do NOT alter the user's facial features, structure, or unique characteristics. The result must look exactly like the person in the photo.
        2.  **Lighting:** Adjust the lighting to be flattering and professional, matching a '${config.lighting}' style. The lighting should look realistic and high-quality.
        3.  **Composition:** Crop the image to a standard headshot (head and shoulders). The output image should be a square (1:1 aspect ratio).
        4.  **Quality:** The final image must be high-resolution and sharp.
    `;

    if (config.background === 'Custom' && config.customBackground) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: config.customBackground } });
        prompt = `
            You are a professional photo editor. Take the person from the first image and place them seamlessly into the background from the second image. The final result should be a high-quality, professional headshot.
            ${commonInstructions}
            5.  **Background:** Use the background from the second image. ${blurInstruction}
        `;
    } else {
        prompt = `
            Analyze the user's photo and transform it into a high-quality, professional headshot suitable for LinkedIn, Twitter, or a professional profile.
            ${commonInstructions}
            5.  **Background:** Replace the original background with a '${config.background}' background. ${blurInstruction}
        `;
    }

    if (config.clothing.enabled) {
        prompt += `
        6.  **Virtual Clothing:** Replace the user's current attire with a '${config.clothing.style}' in a '${config.clothing.color}' color. The clothing must look realistic, fit well, and be appropriate for a professional headshot.
        `;
    }

    if (config.highQuality) {
        prompt += `
        7.  **High Quality:** The final image must be very high-resolution, sharp, and detailed, suitable for professional use. Produce a photorealistic, studio-quality image.
        `;
    }

    parts.push({ text: prompt });

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error('No image was generated in the response.');
    } catch (error) {
        console.error('Error generating headshot:', error);
        if (error instanceof Error && (error.message.includes('PERMISSION_DENIED') || error.message.includes('API key not valid'))) {
            apiErrorHandler?.();
        }
        throw new Error('Failed to generate headshot. The AI may have refused the request due to safety policies. Please try a different photo.');
    }
};