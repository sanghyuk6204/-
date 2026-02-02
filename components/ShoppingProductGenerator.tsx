
import React, { useState } from 'react';
import type { ShoppingProductData } from '../types';
import CopyButton from './CopyButton';
import { generateProductDescription } from '../services/keywordService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const ShoppingProductGenerator: React.FC = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<ShoppingProductData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await generateProductDescription(input);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '생성 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    const formatForCopy = () => {
        if (!result) return '';
        return `상품명: ${result.productName}\n\n"${result.catchphrase}"\n\n[핵심 포인트]\n${result.sellingPoints.map(p => `- ${p}`).join('\n')}\n\n[상세 설명]\n${result.description}\n\n${result.hashtags.join(' ')}`;
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-md shadow-xl">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400 mb-4">
                    🛍️ 쇼핑·상품 콘텐츠 생성 (쇼핑커넥트)
                </h3>
                <p className="text-slate-400 mb-4 text-sm">
                    네이버 스마트스토어, 쿠팡 등 상품 링크나 상품명을 입력하면<br/>
                    구매 전환율을 높이는 <strong>매력적인 상품 설명과 카피라이팅</strong>을 생성해드립니다.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="상품 URL 또는 상품명을 입력하세요"
                        className="flex-grow bg-slate-900/80 text-white placeholder-slate-500 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 shadow-lg transform hover:scale-105"
                    >
                        {loading ? '생성 중...' : '콘텐츠 생성'}
                    </button>
                </form>
            </div>

            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}

            {result && (
                <div className="bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 z-10">
                        <CopyButton textToCopy={formatForCopy()} />
                    </div>
                    
                    <div className="space-y-6 relative z-0">
                        <div className="border-b border-slate-700 pb-4">
                            <span className="text-xs font-bold text-orange-400 tracking-wider uppercase">Product Name</span>
                            <h2 className="text-2xl font-bold text-white mt-1">{result.productName}</h2>
                        </div>

                        <div className="bg-gradient-to-r from-orange-900/30 to-pink-900/30 p-4 rounded-lg border border-orange-500/30">
                            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-pink-300 text-center">
                                "{result.catchphrase}"
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-slate-300 mb-3 flex items-center">
                                    <span className="text-xl mr-2">✨</span> 핵심 구매 포인트
                                </h4>
                                <ul className="space-y-2">
                                    {result.sellingPoints.map((point, i) => (
                                        <li key={i} className="flex items-start text-slate-300 bg-slate-900/50 p-2 rounded">
                                            <span className="text-green-400 mr-2">✔</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-300 mb-3 flex items-center">
                                    <span className="text-xl mr-2">📝</span> 상세 설명
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-900/50 p-3 rounded h-full">
                                    {result.description}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-300 mb-2">추천 해시태그</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.hashtags.map((tag, i) => (
                                    <span key={i} className="text-blue-400 bg-blue-900/20 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-900/40 transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingProductGenerator;
