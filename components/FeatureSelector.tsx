
import React from 'react';
import type { Feature } from '../types';

interface FeatureSelectorProps {
    selectedFeature: Feature;
    onSelectFeature: (feature: Feature) => void;
    loading: boolean;
    onFetchRecommendations: () => void;
    recoLoading: boolean;
    onReset: () => void;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({ selectedFeature, onSelectFeature, loading, onFetchRecommendations, recoLoading, onReset }) => {
    
    // Base styles for all buttons with improved look
    const baseButtonClasses = "text-center font-bold text-xs px-3 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-1 shadow-md transform hover:-translate-y-0.5";
    
    const unselectedClasses = "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500";
    
    // Feature specific active styles
    const keywordActive = "bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-cyan-500/30 border-transparent";
    const blogActive = "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 border-transparent";
    const competitionActive = "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30 border-transparent";
    const shoppingActive = "bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-orange-500/30 border-transparent";
    const trendsActive = "bg-gradient-to-br from-teal-500 to-green-500 text-white shadow-teal-500/30 border-transparent";
    const categoryActive = "bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-orange-500/30 border-transparent";
    
    const sustainableButtonBase = "border-2 border-purple-500 bg-transparent text-purple-400 hover:bg-purple-500 hover:text-white hover:border-purple-500 focus:ring-purple-500";
    const sustainableButtonSelected = "bg-gradient-to-br from-purple-600 to-pink-600 text-white border-transparent focus:ring-purple-500 shadow-purple-500/30";

    const recoButtonClasses = "bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 focus:ring-red-500 disabled:from-slate-700 disabled:to-slate-700 shadow-red-500/30";
    
    const resetButtonClasses = "flex-grow-0 text-center font-bold p-3 rounded-xl transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border border-slate-600";

    const anyLoading = loading || recoLoading;
    
    return (
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 backdrop-blur-sm mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                 <button
                    onClick={() => onSelectFeature('keywords')}
                    className={`${baseButtonClasses} ${selectedFeature === 'keywords' ? keywordActive : unselectedClasses}`}
                    disabled={anyLoading}
                >
                    🔍 자동완성
                </button>
                <button
                    onClick={() => onSelectFeature('related-keywords')}
                    className={`${baseButtonClasses} ${selectedFeature === 'related-keywords' ? keywordActive : unselectedClasses}`}
                    disabled={anyLoading}
                >
                    🔗 AI 연관검색
                </button>
                <button
                    onClick={() => onSelectFeature('blogs')}
                    className={`${baseButtonClasses} ${selectedFeature === 'blogs' ? blogActive : unselectedClasses}`}
                    disabled={anyLoading}
                >
                    🏆 블로그 순위
                </button>
                <button
                    onClick={() => onSelectFeature('competition')}
                    className={`${baseButtonClasses} ${selectedFeature === 'competition' ? competitionActive : unselectedClasses}`}
                    disabled={anyLoading}
                >
                    ⚔️ 경쟁력 분석
                </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 <button
                    onClick={() => onSelectFeature('trends')}
                    className={`${baseButtonClasses} ${selectedFeature === 'trends' ? trendsActive : unselectedClasses}`}
                    disabled={anyLoading}
                >
                    📊 크리에이터 어드바이저
                </button>
                 <button
                    onClick={() => onSelectFeature('category-trends')}
                    className={`${baseButtonClasses} ${selectedFeature === 'category-trends' ? categoryActive : unselectedClasses}`}
                    disabled={anyLoading}
                >
                    📑 카테고리별 키워드
                </button>
                 <button
                    onClick={() => onSelectFeature('shopping')}
                    className={`${baseButtonClasses} ${selectedFeature === 'shopping' ? shoppingActive : unselectedClasses}`}
                    disabled={anyLoading}
                >
                    🛍️ 쇼핑커넥트
                </button>
                 <button
                    onClick={() => onSelectFeature('sustainable-topics')}
                    className={`${baseButtonClasses} ${selectedFeature === 'sustainable-topics' ? sustainableButtonSelected : sustainableButtonBase}`}
                    disabled={anyLoading}
                >
                    🌱 다각도 주제 발굴
                </button>
            </div>
             <div className="mt-3 grid grid-cols-1">
                 <button
                    onClick={onFetchRecommendations}
                    disabled={anyLoading}
                    className={`${baseButtonClasses} ${recoButtonClasses} w-full`}
                >
                    {recoLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>🚀 오늘의 전략 키워드 분석 실행</span>
                        </div>
                    ) : (
                        '🚀 오늘의 전략 키워드 (실시간 트렌드 기반)'
                    )}
                </button>
            </div>
            
             <div className="mt-3 flex justify-end">
                <button
                    onClick={onReset}
                    disabled={anyLoading}
                    className={`${resetButtonClasses} w-full md:w-auto text-xs`}
                    title="모든 결과와 입력을 초기화합니다."
                >
                    🔄 초기화
                </button>
            </div>
        </div>
    );
};

export default FeatureSelector;
