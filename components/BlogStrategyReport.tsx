import React, { useState } from 'react';
import type { BlogStrategyReportData } from '../types';
import CopyButton from './CopyButton';

const AnalysisCard: React.FC<{ title: string; content: string; icon: React.ReactNode }> = ({ title, content, icon }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 h-full">
        <h4 className="flex items-center text-md font-bold text-cyan-300 mb-2">
            {icon}
            <span className="ml-2">{title}</span>
        </h4>
        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{content}</p>
    </div>
);

const BlogStrategyReport: React.FC<{ data: BlogStrategyReportData }> = ({ data }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const formatAllDataForCopy = () => {
        let text = `[상위 블로그 분석 및 1위 공략 제안]\n\n`;
        text += `== 상위 포스트 분석 결과 ==\n`;
        text += `구조적 특징: ${data.analysis.structure}\n`;
        text += `감성적 특징 및 소구점: ${data.analysis.characteristics}\n`;
        text += `공통 핵심 단어: ${data.analysis.commonKeywords}\n\n`;
        
        text += `== 1위 공략을 위한 콘텐츠 제안 (${data.suggestions.length}개) ==\n\n`;
        data.suggestions.forEach((suggestion, index) => {
            text += `${index + 1}. 제목: ${suggestion.title}\n`;
            text += `   - 썸네일 문구: ${suggestion.thumbnailCopy}\n`;
            text += `   - 공략법: ${suggestion.strategy}\n\n`;
        });
        
        return text.trim();
    };

    return (
        <div className="bg-slate-800 rounded-lg p-4 sm:p-6 shadow-lg border border-slate-700 animate-fade-in space-y-6">
            <h3 className="flex items-center justify-between text-lg font-bold text-yellow-400">
                <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <span className="ml-2">상위 블로그 분석 및 1위 공략 제안</span>
                </span>
                <CopyButton textToCopy={formatAllDataForCopy()} />
            </h3>

            <div className="space-y-4">
                 <h4 className="text-slate-300 font-bold">상위 포스트 분석 결과</h4>
                 <div className="grid md:grid-cols-3 gap-4">
                    <AnalysisCard 
                        title="구조적 특징" 
                        content={data.analysis.structure}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                    />
                    <AnalysisCard 
                        title="감성적 특징 및 소구점" 
                        content={data.analysis.characteristics}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <AnalysisCard 
                        title="공통 핵심 단어" 
                        content={data.analysis.commonKeywords}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>}
                    />
                 </div>
            </div>

            <div>
                 <h4 className="text-slate-300 font-bold mb-3">1위 공략을 위한 콘텐츠 제안 (10개)</h4>
                 <div className="space-y-2">
                     {data.suggestions.map((suggestion, index) => (
                        <div key={suggestion.id} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-700/50 transition-colors"
                                aria-expanded={openIndex === index}
                                aria-controls={`suggestion-content-${index}`}
                            >
                                <span className="font-bold text-cyan-300 flex-1 pr-4">{index + 1}. {suggestion.title}</span>
                                <svg
                                    className={`w-5 h-5 text-slate-400 transform transition-transform shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            {openIndex === index && (
                                <div id={`suggestion-content-${index}`} className="p-4 border-t border-slate-700 bg-slate-900/50 animate-fade-in space-y-4">
                                    <div className="flex justify-end -mb-2">
                                        <CopyButton textToCopy={`제목: ${suggestion.title}\n썸네일 문구: ${suggestion.thumbnailCopy}\n공략법: ${suggestion.strategy}`} />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm font-bold mb-1">썸네일 문구:</p>
                                        <p className="text-yellow-300 whitespace-pre-wrap text-sm font-semibold bg-slate-800 p-2 rounded-md">{suggestion.thumbnailCopy}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm font-bold mb-1">공략법:</p>
                                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{suggestion.strategy}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

export default BlogStrategyReport;