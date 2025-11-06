import * as React from 'react';
import { Dashboard } from '../Dashboard';
import { ContentPlan, BrandKit } from '../../types';

interface PlannerTabProps {
    onPlanGenerated: (plan: ContentPlan) => void;
    initialTopic: string | null;
    onTopicUsed: () => void;
    brandKit: BrandKit;
    onSpy: (topic: string) => void; // NEW
}

export const PlannerTab: React.FC<PlannerTabProps> = ({ onPlanGenerated, initialTopic, onTopicUsed, brandKit, onSpy }) => {
    return (
        <div>
            <Dashboard 
                onPlanGenerated={onPlanGenerated} 
                initialTopic={initialTopic} 
                onTopicUsed={onTopicUsed} 
                brandKit={brandKit}
                onSpy={onSpy}
            />
        </div>
    );
};