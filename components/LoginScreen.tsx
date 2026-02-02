
import React, { useState } from 'react';

interface LoginScreenProps {
    onLogin: (apiKey: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim().length < 10) {
            setError('유효한 Gemini API Key를 입력해주세요.');
            return;
        }
        onLogin(apiKey);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
             {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1e1b4b] to-[#0f172a] z-0"></div>
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-md shadow-2xl animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                        날로먹자 키워드
                    </h1>
                    <p className="text-slate-400 text-sm">Gemini AI 기반 SEO & 트렌드 분석 도구</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            id="apiKey"
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setError('');
                            }}
                            className="w-full bg-slate-900/80 text-white placeholder-slate-600 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300"
                            placeholder="AI Studio에서 발급받은 키를 입력하세요"
                        />
                        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg transform hover:scale-[1.02]"
                    >
                        시작하기
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-500 text-xs">
                        API Key가 없으신가요?{' '}
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                        >
                            여기서 무료로 발급받으세요
                        </a>
                    </p>
                    <p className="text-slate-600 text-[10px] mt-2">
                        * 입력하신 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
