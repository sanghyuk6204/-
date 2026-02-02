
import React, { useState } from 'react';
import type { TopicGroup, AgeGroupTrend, TrendRankItem } from '../types';
import CopyButton from './CopyButton';

interface CategoryTrendViewProps {
    category: string;
    topicData: TopicGroup[] | null;
    ageData: AgeGroupTrend[] | null;
    onKeywordClick: (keyword: string) => void;
    onTabChange: (tab: 'topic' | 'age') => void;
    activeTab: 'topic' | 'age';
    loading: boolean;
}

const RankChangeIndicator: React.FC<{ item: TrendRankItem }> = ({ item }) => {
    if (item.status === 'new') {
        return (
            <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full uppercase ml-auto">
                NEW
            </span>
        );
    }

    if (item.status === 'same') {
        return <span className="text-slate-500 text-xs ml-auto">-</span>;
    }

    if (item.status === 'up') {
        return (
            <div className="flex items-center text-red-400 text-xs font-bold ml-auto">
                <span className="mr-0.5">▲</span>
                {item.change}
            </div>
        );
    }

    if (item.status === 'down') {
        return (
            <div className="flex items-center text-blue-400 text-xs font-bold ml-auto">
                <span className="mr-0.5">▼</span>
                {item.change}
            </div>
        );
    }

    return null;
};

const CategoryTrendView: React.FC<CategoryTrendViewProps> = ({ 
    category, 
    topicData, 
    ageData, 
    onKeywordClick, 
    onTabChange, 
    activeTab,
    loading 
}) => {
    
    const formatForCopy = () => {
        let text = `[${category} 트렌드 리포트]\n\n`;
        if (activeTab === 'topic' && topicData) {
            topicData.forEach(group => {
                text += `== ${group.topic} ==\n`;
                group.keywords.forEach(k => {
                    text += `${k.rank}. ${k.keyword}\n`;
                });
                text += '\n';
            });
        } else if (activeTab === 'age' && ageData) {
            ageData.forEach(group => {
                text += `== ${group.ageGroup} ==\n`;
                group.keywords.forEach(k => {
                    text += `${k.rank}. ${k.keyword}\n`;
                });
                text += '\n';
            });
        }
        return text;
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-white">
                    <span className="text-orange-500">{category}</span> 트렌드
                </h3>
                <CopyButton textToCopy={formatForCopy()} />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700 mb-4">
                <button
                    onClick={() => onTabChange('topic')}
                    className={`flex-1 py-3 text-center font-bold transition-colors relative ${
                        activeTab === 'topic' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    주제별 인기유입검색어
                    {activeTab === 'topic' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"></div>
                    )}
                </button>
                <button
                    onClick={() => onTabChange('age')}
                    className={`flex-1 py-3 text-center font-bold transition-colors relative ${
                        activeTab === 'age' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    연령별 인기유입검색어
                    {activeTab === 'age' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"></div>
                    )}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTab === 'topic' && topicData?.map((group, idx) => (
                        <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                            <div className="p-3 bg-slate-700/50 border-b border-slate-700 font-bold text-slate-200">
                                {group.topic}
                            </div>
                            <ul className="divide-y divide-slate-700/50">
                                {group.keywords.map((item, kIdx) => (
                                    <li key={kIdx} className="flex items-center p-3 hover:bg-slate-700/30 transition-colors">
                                        <span className="text-slate-500 font-mono w-6 text-sm">{item.rank}</span>
                                        <button 
                                            onClick={() => onKeywordClick(item.keyword)}
                                            className="text-slate-200 font-medium hover:text-orange-400 hover:underline text-left flex-1 truncate mr-2"
                                        >
                                            {item.keyword}
                                        </button>
                                        <RankChangeIndicator item={item} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {activeTab === 'age' && ageData?.map((group, idx) => (
                        <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                            <div className="p-3 bg-slate-700/50 border-b border-slate-700 font-bold text-slate-200 text-center">
                                {group.ageGroup}
                            </div>
                            <ul className="divide-y divide-slate-700/50">
                                {group.keywords.map((item, kIdx) => (
                                    <li key={kIdx} className="flex items-center p-3 hover:bg-slate-700/30 transition-colors">
                                        <span className="text-slate-500 font-mono w-6 text-sm">{item.rank}</span>
                                        <button 
                                            onClick={() => onKeywordClick(item.keyword)}
                                            className="text-slate-200 font-medium hover:text-orange-400 hover:underline text-left flex-1 truncate mr-2"
                                        >
                                            {item.keyword}
                                        </button>
                                        <RankChangeIndicator item={item} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            
            {!loading && ((activeTab === 'topic' && !topicData) || (activeTab === 'age' && !ageData)) && (
                <div className="text-center p-8 text-slate-500">
                    데이터가 없습니다. 카테고리를 선택해주세요.
                </div>
            )}

            <p className="text-right text-xs text-slate-500 mt-2">* AI 기반 추정 데이터로 실제 순위와 차이가 있을 수 있습니다.</p>
        </div>
    );
};

export default CategoryTrendView;
