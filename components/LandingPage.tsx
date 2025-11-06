// components/LandingPage.tsx
import * as React from 'react';
import { RocketIcon } from './icons/RocketIcon';
import { PlanIcon } from './icons/PlanIcon';
import { CameraIcon } from './icons/CameraIcon';
import { ExportIcon } from './icons/ExportIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { SpyIcon } from './icons/SpyIcon';
import { BrandIcon } from './icons/BrandIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { FilmIcon } from './icons/FilmIcon'; // NEW
import { LightbulbIcon } from './icons/LightbulbIcon'; // NEW

// Custom hook to trigger animations on scroll
const useScrollAnimation = () => {
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach((el) => observer.observe(el));

        return () => elements.forEach((el) => observer.unobserve(el));
    }, []);
};

interface LandingPageProps {
    onGetStarted: () => void;
}

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    details: { icon: React.ReactNode; text: string }[];
}> = ({ icon, title, description, details }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const cardRef = React.useRef<HTMLDivElement>(null);
    
    return (
        <div ref={cardRef} className="glow-card rounded-lg">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left p-6 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-gray-800 p-3 rounded-md">{icon}</div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-100">{title}</h3>
                        <p className="text-gray-400 text-sm">{description}</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div
                className="grid transition-all duration-500 ease-in-out"
                style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
            >
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-gray-800">
                        <ul className="mt-4 space-y-3">
                            {details.map((detail, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="mt-1 text-teal-400">{detail.icon}</div>
                                    <span className="text-gray-300 text-sm">{detail.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    useScrollAnimation();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
            <main className="text-center max-w-5xl w-full">
                <section id="hero" className="my-16 sm:my-24 scroll-animate is-visible">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-violet-400 to-pink-400">
                        Audnix AI Planner
                    </h1>
                     <p className="mt-4 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                        The complete, data-driven growth platform for creators. Go from initial idea to viral-ready video with a suite of AI tools designed for market domination.
                    </p>
                    <div className="mt-8">
                        <button
                            onClick={onGetStarted}
                            className="saas-button-primary text-lg font-bold py-4 px-10 flex items-center justify-center gap-3 mx-auto"
                        >
                            <RocketIcon className="w-6 h-6" />
                            Launch Planner
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Generous free tier. Upgrade as you grow.</p>
                    </div>
                </section>

                <section id="how-it-works" className="my-24 sm:my-32">
                     <h2 className="text-4xl font-bold text-center mb-12 scroll-animate">How It Works in 4 Steps</h2>
                     <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                         {/* Connecting line */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gray-800"></div>
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 via-violet-500 to-pink-500 animate-pulse"></div>

                        <div className="scroll-animate" style={{transitionDelay: '100ms'}}>
                            <div className="relative z-10 p-6 glow-card rounded-lg h-full">
                                <h3 className="font-bold text-xl mb-2"><span className="text-teal-400">1.</span> Analyze & Strategize</h3>
                                <p className="text-sm text-gray-400">Spy on competitors with live data, validate your ideas with a virality score, and generate a full campaign plan.</p>
                            </div>
                        </div>
                         <div className="scroll-animate" style={{transitionDelay: '200ms'}}>
                            <div className="relative z-10 p-6 glow-card rounded-lg h-full">
                                <h3 className="font-bold text-xl mb-2"><span className="text-violet-400">2.</span> Create & Refine</h3>
                                <p className="text-sm text-gray-400">Generate a complete script, get thumbnail ideas, and define your brand voice in your personal Brand Kit.</p>
                            </div>
                        </div>
                         <div className="scroll-animate" style={{transitionDelay: '300ms'}}>
                            <div className="relative z-10 p-6 glow-card rounded-lg h-full">
                                <h3 className="font-bold text-xl mb-2"><span className="text-pink-400">3.</span> Record & Coach</h3>
                                <p className="text-sm text-gray-400">Record in the AI Studio with a voice-activated teleprompter and get real-time feedback on your delivery.</p>
                            </div>
                        </div>
                         <div className="scroll-animate" style={{transitionDelay: '400ms'}}>
                            <div className="relative z-10 p-6 glow-card rounded-lg h-full">
                                <h3 className="font-bold text-xl mb-2"><span className="text-teal-400">4.</span> Export & Grow</h3>
                                <p className="text-sm text-gray-400">Download your video, professional captions (.SRT), and get AI-generated social copy and performance analysis.</p>
                            </div>
                        </div>
                    </div>
                </section>


                <section id="features" className="space-y-6 my-24 sm:my-32">
                     <h2 className="text-4xl font-bold text-center mb-12 scroll-animate">An All-in-One Growth Platform</h2>
                     <div className="space-y-6">
                        <div className="scroll-animate" style={{transitionDelay: '100ms'}}>
                          <FeatureCard 
                              icon={<SpyIcon className="w-8 h-8 text-violet-400" />} 
                              title="Dual-Mode AI Competitor Spy"
                              description="Deconstruct any competitor's success formula."
                              details={[
                                  { icon: <CheckIcon />, text: "Analyze by URL: Fast, zero-setup AI Search analysis of any YouTube or Instagram video's script and public data." },
                                  { icon: '📺', text: "Analyze by File Upload: A deep, frame-by-frame visual analysis using a powerful multimodal AI that 'watches' the video." },
                                  { icon: <CheckIcon />, text: "Get a data-driven breakdown of their 'secret formula' and a new, superior script synthesized for you." }
                              ]}
                          />
                        </div>
                        <div className="scroll-animate" style={{transitionDelay: '200ms'}}>
                           <FeatureCard 
                              icon={<PlanIcon className="w-8 h-8 text-violet-400" />} 
                              title="AI Content & Campaign Planner"
                              description="Generate complete, strategy-driven content plans."
                              details={[
                                  { icon: <CheckIcon />, text: "Validate your topic with a 'Virality Score' and SWOT analysis before you start." },
                                  { icon: <CheckIcon />, text: "Generate a full 7-day launch campaign from a single goal." },
                                  { icon: <CheckIcon />, text: "Receive a complete script, title, captions, hashtags, and a B-Roll shot list." },
                                  { icon: <CheckIcon />, text: "Get AI-generated concepts for high-impact thumbnails." }
                              ]}
                          />
                        </div>
                         <div className="scroll-animate" style={{transitionDelay: '300ms'}}>
                           <FeatureCard 
                              icon={<CameraIcon className="w-8 h-8 text-violet-400" />} 
                              title="The AI Studio"
                              description="A professional recording studio in your browser."
                              details={[
                                  { icon: <CheckIcon />, text: "A smart, voice-activated teleprompter that scrolls as you speak." },
                                  { icon: '🤖', text: "Real-time delivery coaching on your pace (WPM) and filler words." },
                                  { icon: <CheckIcon />, text: "A full suite of AI enhancements: lighting, color grading, skin smoothing, and noise reduction." },
                                  { icon: <CheckIcon />, text: "Your Brand Kit logo is automatically applied as a watermark." }
                              ]}
                          />
                        </div>
                        <div className="scroll-animate" style={{transitionDelay: '400ms'}}>
                           <FeatureCard 
                              icon={<ExportIcon className="w-8 h-8 text-violet-400" />} 
                              title="Professional Export & Handoff"
                              description="Go from recording to publishing, faster."
                              details={[
                                  { icon: <CheckIcon />, text: "Download professional, timed caption files (.SRT, .VTT, .TXT)." },
                                  { icon: <CheckIcon />, text: "Generate fresh, context-aware social media captions and hashtags from your final video." },
                                  { icon: <CheckIcon />, text: "Provide your editor with a 'perfect package' to save hours in post-production." }
                              ]}
                          />
                        </div>
                         <div className="scroll-animate" style={{transitionDelay: '500ms'}}>
                           <FeatureCard 
                              icon={<AnalyticsIcon className="w-8 h-8 text-violet-400" />} 
                              title="AI Growth Consultant"
                              description="Get data-driven feedback on your published content."
                              details={[
                                  { icon: <CheckIcon />, text: "Provide a video URL, title, and sample comments." },
                                  { icon: <CheckIcon />, text: "Receive a dashboard-style report with scores for virality potential and hook effectiveness." },
                                  { icon: <CheckIcon />, text: "Get an AI analysis of audience sentiment and actionable improvement suggestions." }
                              ]}
                          />
                        </div>
                        <div className="scroll-animate" style={{transitionDelay: '600ms'}}>
                           <FeatureCard 
                              icon={<BrandIcon className="w-8 h-8 text-violet-400" />} 
                              title="Personalized Brand Kit"
                              description="Train the AI to generate content in your unique voice."
                              details={[
                                  { icon: <CheckIcon />, text: "Upload your logo, define brand colors, and write a bio describing your tone and style." },
                                  { icon: <CheckIcon />, text: "The AI uses your Brand Bio to tailor all generated scripts to match your voice." },
                                  { icon: <CheckIcon />, text: "Your logo is automatically applied as a watermark in the Studio." }
                              ]}
                          />
                        </div>
                    </div>
                </section>

                 <section id="who-is-it-for" className="my-24 sm:my-32">
                    <h2 className="text-4xl font-bold text-center mb-12 scroll-animate">Built for Ambitious Creators</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="glow-card p-6 rounded-lg text-center bg-gray-900/50 h-full scroll-animate" style={{transitionDelay: '100ms'}}>
                            <LightbulbIcon className="w-12 h-12 text-teal-300 mx-auto mb-4" />
                            <h3 className="font-bold text-xl text-gray-100 mb-3">Expert Creators</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Business coaches, course creators, and consultants. Your time is valuable. Audnix streamlines your entire content workflow from strategy to a polished take, saving you hours on every single video.</p>
                        </div>
                        <div className="glow-card p-6 rounded-lg text-center bg-gray-900/50 h-full scroll-animate" style={{transitionDelay: '200ms'}}>
                            <RocketIcon className="w-12 h-12 text-teal-300 mx-auto mb-4" />
                            <h3 className="font-bold text-xl text-gray-100 mb-3">Founders & Marketers</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Building a brand on LinkedIn, Instagram, or TikTok? Get a professional look without a production team. Analyze your market, generate high-quality scripts, and record polished videos that drive real leads.</p>
                        </div>
                         <div className="glow-card p-6 rounded-lg text-center bg-gray-900/50 h-full scroll-animate" style={{transitionDelay: '300ms'}}>
                            <FilmIcon className="w-12 h-12 text-teal-300 mx-auto mb-4" />
                            <h3 className="font-bold text-xl text-gray-100 mb-3">Video Editors</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Receive a "perfect package" from your clients. A polished take with clean audio, a full timed transcript (.SRT), and an AI-generated shot list for B-roll. Dramatically speed up your post-production workflow.</p>
                        </div>
                    </div>
                </section>
                
                <section id="final-cta" className="my-24 sm:my-32 scroll-animate">
                    <div className="p-10 glow-card rounded-lg">
                        <h2 className="text-4xl font-bold">Ready to Dominate Your Niche?</h2>
                        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Stop guessing and start creating with a data-driven AI growth partner. Go from idea to income, faster than ever.</p>
                        <button
                            onClick={onGetStarted}
                            className="saas-button-primary text-lg font-bold py-4 px-10 flex items-center justify-center gap-3 mx-auto mt-8"
                        >
                            <RocketIcon className="w-6 h-6" />
                            Launch Your Growth Platform
                        </button>
                    </div>
                </section>


                 <footer className="text-center py-8 border-t border-gray-800 scroll-animate">
                    <p className="text-gray-500">
                        &copy; {new Date().getFullYear()} Audnix AI. The Audnix AI Planner is a Core Part of the <a href="https://audnixai.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Audnix AI Platform</a>.
                    </p>
                </footer>
            </main>
        </div>
    );
};
