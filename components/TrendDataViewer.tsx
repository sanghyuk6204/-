
import React, { useState, useEffect } from 'react';
import type { TrendAnalysisData } from '../types';
import { generateTrendAnalysis } from '../services/keywordService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import CopyButton from './CopyButton';

const ProgressBar: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">{label}</span>
            <span className="text-slate-400">{value}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
                className={`h-2.5 rounded-full ${colorClass}`} 
                style={{ width: `${value}%`, transition: 'width 1s ease-in-out' }}
            ></div>
        </div>
    </div>
);

const TrendDataViewer: React.FC = () => {
    const [keyword, setKeyword] = useState('');
    const [data, setData] = useState<TrendAnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await generateTrendAnalysis(keyword);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : '분석 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };
    
    const formatForCopy = () => {
        if (!data) return '';
        return `키워드: ${data.keyword} 트렌드 분석\n\n[연령별 인기]\n10대: ${data.ageGroup['10s']}%, 20대: ${data.ageGroup['20s']}%, 30대: ${data.ageGroup['30s']}%, 40대: ${data.ageGroup['40s']}%, 50대: ${data.ageGroup['50s']}%, 60대+: ${data.ageGroup['60s_plus']}%\n\n[성별]\n남성: ${data.gender.male}%, 여성: ${data.gender.female}%\n\n[기기]\nPC: ${data.device.pc}%, 모바일: ${data.device.mobile}%\n\n[관련 주제]\n${data.relatedTopics.join(', ')}`;
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-md shadow-xl">
                 <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400 mb-4">
                    📊 크리에이터 어드바이저 (트렌드 분석)
                </h3>
                 <p className="text-slate-400 mb-4 text-sm">
                    키워드를 입력하면 연령별, 성별, 기기별 검색 분포와 관련 주제를<br/>
                    한눈에 볼 수 있도록 시각화하여 제공합니다.
                </p>
                <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="분석할 키워드를 입력하세요 (예: 캠핑용품)"
                        className="flex-grow bg-slate-900/80 text-white placeholder-slate-500 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300"
                    />
                    <button
                        type="submit"
                        disabled={loading || !keyword.trim()}
                        className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-500 hover:to-green-500 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 shadow-lg transform hover:scale-105"
                    >
                        {loading ? '분석 중...' : '트렌드 분석'}
                    </button>
                </form>
            </div>

            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}

            {data && (
                <div className="bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700 animate-fade-in relative">
                    <div className="absolute top-0 right-0 p-4">
                        <CopyButton textToCopy={formatForCopy()} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">
                        <span className="text-teal-400">'{data.keyword}'</span> 분석 리포트
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Age Groups */}
                        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                            <h4 className="font-bold text-slate-300 mb-4 flex items-center">
                                👥 연령별 검색 비율
                            </h4>
                            <div className="space-y-3">
                                <ProgressBar label="10대" value={data.ageGroup['10s']} colorClass="bg-red-400" />
                                <ProgressBar label="20대" value={data.ageGroup['20s']} colorClass="bg-orange-400" />
                                <ProgressBar label="30대" value={data.ageGroup['30s']} colorClass="bg-yellow-400" />
                                <ProgressBar label="40대" value={data.ageGroup['40s']} colorClass="bg-green-400" />
                                <ProgressBar label="50대" value={data.ageGroup['50s']} colorClass="bg-blue-400" />
                                <ProgressBar label="60대 이상" value={data.ageGroup['60s_plus']} colorClass="bg-purple-400" />
                            </div>
                        </div>

                        {/* Gender & Device */}
                        <div className="space-y-6">
                             <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 h-[48%]">
                                <h4 className="font-bold text-slate-300 mb-4">👫 성별 비중</h4>
                                <div className="flex h-8 rounded-full overflow-hidden">
                                    <div style={{ width: `${data.gender.male}%` }} className="bg-blue-500 flex items-center justify-center text-xs text-white font-bold">남 {data.gender.male}%</div>
                                    <div style={{ width: `${data.gender.female}%` }} className="bg-pink-500 flex items-center justify-center text-xs text-white font-bold">여 {data.gender.female}%</div>
                                </div>
                            </div>
                             <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 h-[48%]">
                                <h4 className="font-bold text-slate-300 mb-4">📱 기기별 비중</h4>
                                <div className="flex h-8 rounded-full overflow-hidden">
                                    <div style={{ width: `${data.device.pc}%` }} className="bg-indigo-500 flex items-center justify-center text-xs text-white font-bold">PC {data.device.pc}%</div>
                                    <div style={{ width: `${data.device.mobile}%` }} className="bg-teal-500 flex items-center justify-center text-xs text-white font-bold">MO {data.device.mobile}%</div>
                                </div>
                            </div>
                        </div>

                        {/* Topics & Seasonality */}
                        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                            <h4 className="font-bold text-slate-300 mb-4">🔥 관련 주제 및 시즌</h4>
                            <div className="mb-4">
                                <span className="text-xs text-slate-400 block mb-2">계절성 트렌드</span>
                                <div className="bg-slate-800 px-3 py-2 rounded text-center text-cyan-300 font-bold border border-cyan-500/30">
                                    {data.seasonalTrend}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block mb-2">연관 주제 태그</span>
                                <div className="flex flex-wrap gap-2">
                                    {data.relatedTopics.map((topic, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-xs hover:bg-slate-600 transition-colors cursor-default">
                                            #{topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrendDataViewer;
