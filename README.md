# Audnix AI Planner: The Ultimate AI Growth Platform for Creators

The Audnix AI Planner is a comprehensive, on-device application designed to be the ultimate growth partner for content creators, marketers, and entrepreneurs. It provides a seamless, data-driven workflow that takes you from initial idea to a viral-ready, professionally recorded video, complete with post-production assets and strategic performance analysis.

This platform is not just a content planner; it's a complete ecosystem for market domination.

## The Audnix AI Platform: A Freemium Model

The Audnix AI Planner is the powerful, free-to-start entry point into the larger **Audnix AI Platform**. Our business model is designed for your growth:

*   **Generous Free Tier (The Planner):** Get started immediately with the industry's most powerful content planner, studio, and analysis tools. We cover the initial AI costs to help you build momentum and create amazing content.
*   **Usage-Based Upgrades:** As your brand grows and your usage increases, you can seamlessly upgrade to a paid plan. This sustainable model ensures the platform remains powerful, profitable, and continuously improving.
*   **The Audnix AI Automation Suite (The Future):** The Planner helps you create content that generates leads. Our upcoming premium suite will automatically follow up on those leads, turning your content into revenue 24/7.

## Core Features: An All-in-One Growth Engine

### 1. 🕵️‍♂️ AI Competitor Spy (Zero-Setup)
Deconstruct any competitor's success formula on YouTube or Instagram without needing any complex setup or API keys.
- **URL-Based Analysis:** Simply paste a video link.
- **It "Watches" the Video:** The AI uses Google Search grounding to find and analyze the video's full transcript, description, and public data.
- **Data-Driven Insights:** Get a strategic breakdown of the competitor's hook, structure, and "secret formula."
- **Script Synthesis:** The AI generates a brand new, superior script for you that combines their winning strategy with your unique angle.

### 2. 🧠 AI Content & Campaign Planner
Generate complete, strategy-driven content plans from a single idea.
- **AI Topic Validator:** Get a "Virality Score" and SWOT analysis for your topic *before* you record.
- **Full Script Generation:** Receive a complete script, title, captions, hashtags, and a B-Roll shot list.
- **AI Thumbnail Sketcher:** Get 3-5 written concepts for high-impact thumbnails.

### 3. 🎥 The AI Studio
A professional recording studio in your browser.
- **Voice-Activated Teleprompter:** A smart teleprompter that scrolls as you speak, with customizable lookahead.
- **Real-Time Coaching:** Get live feedback on your delivery (Words Per Minute, filler words) and technicals (lighting, audio levels).
- **AI Enhancements:** A full suite of effects including lighting, color grading, skin smoothing, and audio noise reduction.
- **Brand Kit Integration:** Your logo is automatically applied as a watermark.

### 4. 🚀 Professional Export & Handoff
Go from recording to publishing, faster.
- **Timed Captions:** Download professional, timed caption files in multiple formats (.SRT, .VTT, .TXT).
- **AI Social Content:** Generate fresh, context-aware social media captions and hashtags from your final video on demand.
- **Editor-Ready:** Provide your editor with a "perfect package" to save hours in post-production.

### 5. 📈 AI Growth Consultant
Get data-driven feedback on your published content.
- **Simulated Performance Review:** Input your video's URL, title, and sample comments.
- **Dashboard-Style Report:** Receive scores for virality potential, hook effectiveness, and an AI analysis of audience sentiment.
- **Actionable Insights:** Get concrete improvement suggestions and ideas for your next video.

### 6. 🎨 Personalized Brand Kit
Train the AI to generate content in your unique voice.
- **Define Your Brand:** Upload your logo, define brand colors, and write a bio describing your tone and style.
- **Tailored Content:** The AI uses your Brand Bio to tailor all generated scripts to match your voice.

## Getting Started & Deployment

This application is a modern frontend built with React, TypeScript, and Vite. It is designed to be deployed on a platform like Vercel.

### Prerequisites
- Node.js (v18 or later)
- A Google Gemini API Key

### Local Development
1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up your API Key:**
    - Create a file named `.env` in the root of the project.
    - Add your Google Gemini API key to this file:
      ```
      API_KEY=YOUR_GEMINI_API_KEY_HERE
      ```
    - **IMPORTANT:** The `.env` file is listed in `.gitignore` and should **never** be committed to version control.
4.  **Run the application:**
    ```bash
    npm run dev
    ```

### Deployment to Vercel (Recommended)
1.  **Push to GitHub:** Push your project code to a new GitHub repository.
2.  **Create a Vercel Project:** In your Vercel dashboard, create a new project and import the GitHub repository you just created.
3.  **Configure Environment Variables:**
    - In your Vercel project settings, go to the "Environment Variables" section.
    - Add a new variable with the name `API_KEY`.
    - Paste your Google Gemini API key as the value.
    - **DO NOT** expose this variable to the browser. Vercel handles this securely.
4.  **Deploy:** Vercel will automatically detect the project type and deploy it. Your Audnix AI Planner will be live!

## Future Roadmap: Building an Unbeatable Moat

- **Deeper Personalization (Brand Voice Models):** Allow Pro users to train a custom AI model on their own successful content to generate scripts in their unique voice.
- **Performance Analytics Loop:** Integrate with official platform APIs (YouTube, TikTok) to feed real performance data back into the AI, turning it into a true data-driven growth partner.
- **Community & Script Marketplace:** Create a space for creators to share and sell their most successful script templates.
