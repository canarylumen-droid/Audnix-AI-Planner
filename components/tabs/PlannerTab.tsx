import * as React from 'react';
import { Dashboard } from '../Dashboard';
import { ContentPlan } from '../../types';

interface PlannerTabProps {
    onPlanGenerated: (plan: ContentPlan) => void;
    initialTopic: string | null;
    onTopicUsed: () => void;
}

export const PlannerTab: React.FC<PlannerTabProps> = ({ onPlanGenerated, initialTopic, onTopicUsed }) => {
    return (
        <div>
            <Dashboard onPlanGenerated={onPlanGenerated} initialTopic={initialTopic} onTopicUsed={onTopicUsed} />
        </div>
    );
};