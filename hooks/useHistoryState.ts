// hooks/useHistoryState.ts
import * as React from 'react';

type HistoryState<T> = {
    past: T[];
    present: T;
    future: T[];
};

type UseHistoryStateReturn<T> = [
    T,
    (newState: T) => void,
    () => void,
    () => void,
    boolean,
    boolean
];

export const useHistoryState = <T>(initialState: T): UseHistoryStateReturn<T> => {
    const [state, setState] = React.useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: [],
    });

    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    const set = React.useCallback((newState: T) => {
        setState(currentState => {
            // If the new state is the same as the present, do nothing
            if (newState === currentState.present) {
                return currentState;
            }
            // Push the current state to the past and clear the future
            return {
                past: [...currentState.past, currentState.present],
                present: newState,
                future: [],
            };
        });
    }, []);

    const undo = React.useCallback(() => {
        if (!canUndo) return;
        setState(currentState => {
            const previous = currentState.past[currentState.past.length - 1];
            const newPast = currentState.past.slice(0, currentState.past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [currentState.present, ...currentState.future],
            };
        });
    }, [canUndo]);

    const redo = React.useCallback(() => {
        if (!canRedo) return;
        setState(currentState => {
            const next = currentState.future[0];
            const newFuture = currentState.future.slice(1);
            return {
                past: [...currentState.past, currentState.present],
                present: next,
                future: newFuture,
            };
        });
    }, [canRedo]);

    return [state.present, set, undo, redo, canUndo, canRedo];
};