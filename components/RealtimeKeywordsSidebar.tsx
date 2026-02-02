
import React from 'react';
import PromptLauncher from './PromptLauncher';

const links = [
    {
        title: '실시간 인기 검색어 모음',
        description: '구글, 네이트, 줌, 다음',
        url: 'https://adsensefarm.kr/realtime/',
    },
    {
        title: '시그널 실검 (구.네이버 실검)',
        description: '실시간 검색어 순위 제공',
        url: 'https://www.signal.bz/',
    },
    {
        title: '네이버 creator-advisor',
        description: '(로그인 필요, 트렌드 탭으로 이동)',
        url: 'https://creator-advisor.naver.com/naver_blog',
        highlight: true,
    },
    {
        title: '네이버 데이터랩',
        description: '네이버의 검색 트렌드 분석 도구',
        url: 'https://datalab.naver.com/',
    },
    {
        title: '대한민국 정책포털',
        description: '전국 정책 뉴스와 브리핑',
        url: 'https://www.korea.kr/news/policyNewsList.do',
    },
    {
        title: '금융위원회',
        description: '금융정책, 금융소비자보호',
        url: 'https://www.fsc.go.kr/index',
    },
    {
        title: '기획재정부',
        description: '경제성장전략, 세제개편안',
        url: 'https://www.moef.go.kr/together.do',
    },
    {
        title: 'KDI 한국개발연구원',
        description: '경제·사회 관련 종합정책',
        url: 'https://eiec.kdi.re.kr/',
    },
];

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

interface RealtimeKeywordsSidebarProps {
    onPromptExecute: (prompt: string) => void;
}

const RealtimeKeywordsSidebar: React.FC<RealtimeKeywordsSidebarProps> = ({ onPromptExecute }) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-3">
                    🔥 실시간 트렌드 도구
                </h2>
                <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm overflow-hidden shadow-lg">
                    <ul className="divide-y divide-slate-700/50">
                        {links.map((link, index) => (
                            <li key={index} className={link.highlight ? "bg-gradient-to-r from-yellow-900/20 to-transparent border-l-4 border-yellow-500" : ""}>
                                <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors duration-200 group"
                                >
                                    <div>
                                        <h3 className={`font-bold transition-colors ${link.highlight ? 'text-yellow-300 group-hover:text-yellow-200' : 'text-slate-200 group-hover:text-cyan-300'}`}>
                                            {link.highlight ? '⭐ ' : ''}{link.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">{link.description}</p>
                                    </div>
                                    <ExternalLinkIcon />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div>
                <PromptLauncher onExecute={onPromptExecute} />
            </div>
        </div>
    );
};

export default RealtimeKeywordsSidebar;
