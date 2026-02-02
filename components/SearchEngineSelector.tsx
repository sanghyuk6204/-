import React from 'react';
import type { SearchSource } from '../types';

interface SearchEngineSelectorProps {
    selectedSource: SearchSource;
    onSelectSource: (source: SearchSource) => void;
    loading: boolean;
}

const SearchEngineSelector: React.FC<SearchEngineSelectorProps> = ({ selectedSource, onSelectSource, loading }) => {
    const commonClasses = "w-full sm:w-auto flex-1 sm:flex-none text-center font-bold py-2 px-6 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed";
    const selectedClasses = "bg-cyan-600 text-white shadow-lg";
    const unselectedClasses = "bg-slate-700 text-slate-300 hover:bg-slate-600";
    
    return (
        <div className="flex flex-col sm:flex-row gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700 mb-4">
            <button
                onClick={() => onSelectSource('google')}
                className={`${commonClasses} ${selectedSource === 'google' ? selectedClasses : unselectedClasses}`}
                disabled={loading}
                aria-pressed={selectedSource === 'google'}
            >
                Google
            </button>
            <button
                onClick={() => onSelectSource('naver')}
                className={`${commonClasses} ${selectedSource === 'naver' ? selectedClasses : unselectedClasses}`}
                disabled={loading}
                aria-pressed={selectedSource === 'naver'}
            >
                Naver
            </button>
        </div>
    );
};

export default SearchEngineSelector;
