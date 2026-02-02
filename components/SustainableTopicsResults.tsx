
import React, { useState } from 'react';
import type { SustainableTopicCategory } from '../types';
import CopyButton from './CopyButton';

const SustainableTopicsResults: React.FC<{ data: SustainableTopicCategory[] }> = ({ data }) => {
    const [openCategory, setOpenCategory] = useState<string | null>(data.length > 0 ? data[0].category : null);

    const toggleCategory = (category: string) => {
        setOpenCategory(openCategory === category ? null : category);
    };

    const formatAllDataForCopy = () => {
        let text = `[다각도 블로그 주제 발굴]\n\n`;
        data.forEach(categoryItem => {
            text += `== ${categoryItem.category} ==\n\n`;
            categoryItem.suggestions.forEach((suggestion, index) => {
                text += `${index + 1}. 제목: ${suggestion.title}\n`;
                text += `   - 핵심 키워드: ${suggestion.keywords.join(', ')}\n`;
                text += `   - SEO 전략: ${suggestion.strategy}\n\n`;
            });
        });
        return text.trim();
    };

    return (
        <div className="bg-slate-800 rounded-lg p-4 sm:p-6 shadow-lg border border-slate-700 animate-fade-in space-y-4">
            <h3 className="flex items-center justify-between text-lg font-bold text-yellow-400">
                <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="ml-2">다각도 블로그 주제 발굴</span>
                </span>
                <CopyButton textToCopy={formatAllDataForCopy()} />
            </h3>
            <div className="space-y-2">
                {data.map((categoryItem) => (
                    <div key={categoryItem.category} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleCategory(categoryItem.category)}
                            className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-700/50 transition-colors"
                            aria-expanded={openCategory === categoryItem.category}
                        >
                            <span className="font-bold text-slate-200 text-md">{categoryItem.category}</span>
                            <svg
                                className={`w-5 h-5 text-slate-400 transform transition-transform ${openCategory === categoryItem.category ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        {openCategory === categoryItem.category && (
                            <div className="p-4 border-t border-slate-700 bg-slate-900/50 animate-fade-in space-y-6">
                                {categoryItem.suggestions.map((suggestion, sIndex) => (
                                    <div key={sIndex} className="border-b border-slate-700/50 pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-cyan-300 mb-2 flex-1 pr-2">{sIndex + 1}. {suggestion.title}</p>
                                            <CopyButton textToCopy={`제목: ${suggestion.title}\n핵심 키워드: ${suggestion.keywords.join(', ')}\nSEO 전략: ${suggestion.strategy}`} />
                                        </div>
                                        <div className="pl-4">
                                            <div className="mt-2">
                                                <p className="text-slate-400 text-sm font-bold mb-1">핵심 키워드:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestion.keywords.map((kw, kwIndex) => (
                                                        <span key={kwIndex} className="bg-slate-700 text-cyan-300 text-xs font-medium px-2 py-1 rounded-full">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <p className="text-slate-400 text-sm font-bold mb-1">SEO 전략:</p>
                                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{suggestion.strategy}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SustainableTopicsResults;
