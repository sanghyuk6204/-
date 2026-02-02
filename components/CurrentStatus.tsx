
import React, { useState, useEffect } from 'react';
import { fetchCurrentWeather } from '../services/keywordService';
import type { WeatherData } from '../types';

const CurrentStatus: React.FC = () => {
    const [now, setNow] = useState(new Date());
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        const loadWeather = async () => {
            try {
                const data = await fetchCurrentWeather();
                setWeather(data);
            } catch (err) {
                if (err instanceof Error) {
                    setWeatherError(err.message);
                } else {
                    setWeatherError("날씨 정보를 가져올 수 없습니다.");
                }
            }
        };

        loadWeather();
        
        return () => {
            clearInterval(timer);
        };
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 mb-4 text-sm text-slate-300 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(now)}</span>
            </div>
            <div className="flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                 </svg>
                {weather ? (
                    <span className="font-mono">
                        서울: {weather.condition}, {weather.temperature}, {weather.humidity}, {weather.wind}
                    </span>
                ) : weatherError ? (
                    <span className="text-red-400">날씨 정보 로딩 실패</span>
                ) : (
                    <span>서울 날씨 로딩 중...</span>
                )}
            </div>
        </div>
    );
};

export default CurrentStatus;
