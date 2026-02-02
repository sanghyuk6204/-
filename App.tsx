
import React, { useState, useEffect } from 'react';
import { useSearch } from './hooks/useKeywordSearch';
import KeywordInputForm from './components/KeywordInputForm';
import ResultsTable from './components/ResultsTable';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import SearchEngineSelector from './components/SearchEngineSelector';
import FeatureSelector from './components/FeatureSelector';
import BlogResultsTable from './components/BlogResultsTable';
import CompetitionAnalysisResults from './components/CompetitionAnalysisResults';
import PromptResultDisplay from './components/PromptResultDisplay';
import BlogTopicSuggestions from './components/BlogTopicSuggestions';
import BlogStrategyReport from './components/BlogStrategyReport';
import RealtimeKeywordsSidebar from './components/RealtimeKeywordsSidebar';
import RecommendedKeywordsDisplay from './components/RecommendedKeywordsDisplay';
import SustainableTopicsResults from './components/SustainableTopicsResults';
import HelpModal from './components/HelpModal';
import PeopleAlsoAsk from './components/PeopleAlsoAsk';
import SerpStrategyReport from './components/SerpStrategyReport';
import CurrentStatus from './components/CurrentStatus';
import ShoppingProductGenerator from './components/ShoppingProductGenerator';
import TrendDataViewer from './components/TrendDataViewer';
import CategoryTrendSelector from './components/CategoryTrendSelector';
import CategoryTrendView from './components/CategoryTrendTable'; // Updated import
import { generateTopicsFromMainKeyword, generateTopicsFromAllKeywords, generateBlogStrategy, fetchRecommendedKeywords, generateSustainableTopics, generateSerpStrategy, executePromptAsCompetitionAnalysis, generateCategoryTrendData, generateAgeGroupTrends } from './services/keywordService';
import type { SearchSource, Feature, KeywordData, BlogPostData, KeywordMetrics, GeneratedTopic, BlogStrategyReportData, RecommendedKeyword, SustainableTopicCategory, GoogleSerpData, SerpStrategyReportData, TopicGroup, AgeGroupTrend } from './types';

const App: React.FC = () => {
    const { results, loading, error, search, initialLoad, setResults, setError, setInitialLoad, setLoading } = useSearch();
    const [source, setSource] = useState<SearchSource>('google');
    const [feature, setFeature] = useState<Feature>('competition');

    const [keyword, setKeyword] = useState<string>('');
    const [mainKeyword, setMainKeyword] = useState<string>('');
    const [blogTopics, setBlogTopics] = useState<GeneratedTopic[] | null>(null);
    const [topicTitle, setTopicTitle] = useState<string>('');
    const [topicLoading, setTopicLoading] = useState<boolean>(false);
    const [topicError, setTopicError] = useState<string | null>(null);

    const [blogStrategy, setBlogStrategy] = useState<BlogStrategyReportData | null>(null);
    const [strategyLoading, setStrategyLoading] = useState<boolean>(false);
    const [strategyError, setStrategyError] = useState<string | null>(null);
    
    const [serpStrategy, setSerpStrategy] = useState<SerpStrategyReportData | null>(null);
    const [serpStrategyLoading, setSerpStrategyLoading] = useState<boolean>(false);
    const [serpStrategyError, setSerpStrategyError] = useState<string | null>(null);

    const [recommendedKeywords, setRecommendedKeywords] = useState<RecommendedKeyword[] | null>(null);
    const [recoLoading, setRecoLoading] = useState<boolean>(false);
    const [recoError, setRecoError] = useState<string | null>(null);

    const [sustainableTopics, setSustainableTopics] = useState<SustainableTopicCategory[] | null>(null);
    const [sustainableTopicsLoading, setSustainableTopicsLoading] = useState<boolean>(false);
    const [sustainableTopicsError, setSustainableTopicsError] = useState<string | null>(null);
    
    // Category Trend States
    const [categoryTopicData, setCategoryTopicData] = useState<TopicGroup[] | null>(null);
    const [categoryAgeData, setCategoryAgeData] = useState<AgeGroupTrend[] | null>(null);
    const [categoryTrendLoading, setCategoryTrendLoading] = useState<boolean>(false);
    const [categoryTrendError, setCategoryTrendError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('비즈니스경제');
    const [trendTab, setTrendTab] = useState<'topic' | 'age'>('topic');

    const [promptResult, setPromptResult] = useState<KeywordMetrics | null>(null);
    const [promptResultLoading, setPromptResultLoading] = useState<boolean>(false);
    const [promptResultError, setPromptResultError] = useState<string | null>(null);

    const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

    const handleFeatureSelect = (newFeature: Feature) => {
        if (feature === newFeature) return;

        setResults([]);
        setError(null);
        setInitialLoad(true);
        setKeyword('');
        setMainKeyword('');
        setBlogTopics(null);
        setTopicTitle('');
        setTopicLoading(false);
        setTopicError(null);
        setBlogStrategy(null);
        setStrategyLoading(false);
        setStrategyError(null);
        setSerpStrategy(null);
        setSerpStrategyLoading(false);
        setSerpStrategyError(null);
        setRecommendedKeywords(null);
        setRecoLoading(false);
        setRecoError(null);
        setSustainableTopics(null);
        setSustainableTopicsError(null);
        setSustainableTopicsLoading(false);
        
        // Reset category trend data
        setCategoryTopicData(null);
        setCategoryAgeData(null);
        setCategoryTrendError(null);
        setCategoryTrendLoading(false);
        setTrendTab('topic');
        
        setPromptResult(null);
        setPromptResultError(null);
        
        setFeature(newFeature);
    };

    const handleSearch = async (searchKeyword: string) => {
        if (!searchKeyword.trim()) return;

        // Reset all states
        setInitialLoad(false);
        setMainKeyword(searchKeyword);
        setResults([]);
        setError(null);
        setBlogTopics(null);
        setTopicError(null);
        setBlogStrategy(null);
        setStrategyError(null);
        setSerpStrategy(null);
        setSerpStrategyError(null);
        setRecommendedKeywords(null);
        setRecoError(null);
        setSustainableTopics(null);
        setSustainableTopicsError(null);
        setCategoryTopicData(null);
        setCategoryAgeData(null);
        setCategoryTrendError(null);

        setPromptResult(null);
        setPromptResultError(null);

        if (feature === 'sustainable-topics') {
            setSustainableTopicsLoading(true);
            try {
                const data = await generateSustainableTopics(searchKeyword);
                setSustainableTopics(data);
            } catch (err) {
                if (err instanceof Error) {
                    setSustainableTopicsError(err.message);
                } else {
                    setSustainableTopicsError('지속 가능 주제를 생성하는 중 알 수 없는 오류가 발생했습니다.');
                }
            } finally {
                setSustainableTopicsLoading(false);
            }
        } else if (feature !== 'shopping' && feature !== 'trends' && feature !== 'category-trends') {
             // Shopping, trends, category-trends handled in their components or skipped here
            search(searchKeyword, feature, source);
        }
    };

    const handleKeywordClick = (clickedKeyword: string) => {
        setKeyword(clickedKeyword);
        // If we are in category trends, clicking a keyword acts as a competition search
        if (feature === 'category-trends') {
             setFeature('competition');
             setMainKeyword(clickedKeyword);
             setInitialLoad(false);
             setResults([]);
             setError(null);
             handleSearch(clickedKeyword);
        } else {
             handleSearch(clickedKeyword);
        }
    };
    
    const isBlogResults = (data: (KeywordData | BlogPostData | KeywordMetrics | GoogleSerpData)[]): data is BlogPostData[] => {
        return data.length > 0 && 'url' in data[0];
    }
    
    const isCompetitionResult = (data: (KeywordData | BlogPostData | KeywordMetrics | GoogleSerpData)[]): data is KeywordMetrics[] => {
        return data.length > 0 && 'analysis' in data[0];
    }

    const isKeywordResults = (data: (KeywordData | BlogPostData | KeywordMetrics | GoogleSerpData)[]): data is KeywordData[] => {
        return data.length > 0 && 'keyword' in data[0] && !('url' in data[0]) && !('analysis' in data[0]);
    }

    const isGoogleSerpResult = (data: (KeywordData | BlogPostData | KeywordMetrics | GoogleSerpData)[]): data is GoogleSerpData[] => {
        return data.length > 0 && 'related_searches' in data[0] && 'people_also_ask' in data[0];
    }
    
    const handleCategorySelect = async (category: string) => {
        setSelectedCategory(category);
        setCategoryTrendLoading(true);
        setCategoryTrendError(null);
        // Clear both data when category changes to avoid stale data display
        setCategoryTopicData(null);
        setCategoryAgeData(null);
        
        try {
            // Load based on current tab
            if (trendTab === 'topic') {
                const data = await generateCategoryTrendData(category);
                setCategoryTopicData(data);
            } else {
                const data = await generateAgeGroupTrends(category);
                setCategoryAgeData(data);
            }
        } catch(err) {
             if (err instanceof Error) {
                setCategoryTrendError(err.message);
            } else {
                setCategoryTrendError('트렌드 데이터를 가져오는 중 오류가 발생했습니다.');
            }
        } finally {
            setCategoryTrendLoading(false);
        }
    };

    // Handle tab change for category trends
    const handleTrendTabChange = async (tab: 'topic' | 'age') => {
        setTrendTab(tab);
        // Don't re-fetch if data already exists for this category
        if (tab === 'topic' && categoryTopicData) return;
        if (tab === 'age' && categoryAgeData) return;

        setCategoryTrendLoading(true);
        setCategoryTrendError(null);
        try {
            if (tab === 'topic') {
                const data = await generateCategoryTrendData(selectedCategory);
                setCategoryTopicData(data);
            } else {
                const data = await generateAgeGroupTrends(selectedCategory);
                setCategoryAgeData(data);
            }
        } catch(err) {
             if (err instanceof Error) {
                setCategoryTrendError(err.message);
            } else {
                setCategoryTrendError('데이터를 가져오는 중 오류가 발생했습니다.');
            }
        } finally {
            setCategoryTrendLoading(false);
        }
    };

    const handleGenerateTopics = async (type: 'main' | 'all') => {
        setTopicLoading(true);
        setTopicError(null);
        setBlogTopics(null);

        try {
            let topics;
            if (type === 'main') {
                setTopicTitle(`'${mainKeyword}' 키워드 블로그 주제 추천`);
                topics = await generateTopicsFromMainKeyword(mainKeyword);
            } else {
                const relatedKeywords = (results as KeywordData[]).map(r => r.keyword);
                setTopicTitle(`'${mainKeyword}' 및 자동완성 키워드 조합 블로그 주제 추천`);
                topics = await generateTopicsFromAllKeywords(mainKeyword, relatedKeywords);
            }
            setBlogTopics(topics);
        } catch (err) {
            if (err instanceof Error) {
                setTopicError(err.message);
            } else {
                setTopicError('알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setTopicLoading(false);
        }
    };
    
    const analyzeBlogStrategy = async () => {
        if (!loading && !error && feature === 'blogs' && isBlogResults(results) && results.length > 0) {
            setStrategyLoading(true);
            setStrategyError(null);
            try {
                const strategyData = await generateBlogStrategy(mainKeyword, results);
                setBlogStrategy(strategyData);
            } catch (err) {
                if (err instanceof Error) {
                    setStrategyError(err.message);
                } else {
                    setStrategyError('블로그 공략법을 생성하는 중 알 수 없는 오류가 발생했습니다.');
                }
            } finally {
                setStrategyLoading(false);
            }
        }
    };

    const analyzeSerpStrategy = async () => {
        if (!loading && !error && feature === 'related-keywords' && isGoogleSerpResult(results) && results.length > 0) {
            setSerpStrategyLoading(true);
            setSerpStrategyError(null);
            try {
                const strategyData = await generateSerpStrategy(mainKeyword, results[0]);
                setSerpStrategy(strategyData);
            } catch (err) {
                if (err instanceof Error) {
                    setSerpStrategyError(err.message);
                } else {
                    setSerpStrategyError('SERP 분석 리포트를 생성하는 중 알 수 없는 오류가 발생했습니다.');
                }
            } finally {
                setSerpStrategyLoading(false);
            }
        }
    };


    React.useEffect(() => {
        if (feature === 'blogs') {
            analyzeBlogStrategy();
        } else {
            setBlogStrategy(null);
            setStrategyError(null);
        }
        
        if (feature === 'related-keywords' && results.length > 0 && isGoogleSerpResult(results)) {
            analyzeSerpStrategy();
        } else {
            setSerpStrategy(null);
            setSerpStrategyError(null);
        }

    }, [results, feature]);


    const handleFetchRecommendations = async () => {
        setRecoLoading(true);
        setRecoError(null);
        setRecommendedKeywords(null);

        // Clear all other states
        setResults([]);
        setError(null);
        setMainKeyword('');
        setBlogTopics(null);
        setTopicError(null);
        setBlogStrategy(null);
        setStrategyError(null);
        setSerpStrategy(null);
        setSerpStrategyError(null);
        setSustainableTopics(null);
        setSustainableTopicsError(null);
        setCategoryTopicData(null);
        setCategoryAgeData(null);
        setCategoryTrendError(null);
        setInitialLoad(false);

        setPromptResult(null);
        setPromptResultError(null);

        try {
            const recommendations = await fetchRecommendedKeywords();
            setRecommendedKeywords(recommendations);
        } catch (err) {
            if (err instanceof Error) {
                setRecoError(err.message);
            } else {
                setRecoError('전략 키워드를 분석하는 중 알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setRecoLoading(false);
        }
    };

    const handlePromptExecute = async (promptText: string) => {
        setResults([]);
        setRecommendedKeywords(null);
        setSustainableTopics(null);
        setCategoryTopicData(null);
        setCategoryAgeData(null);
        setBlogTopics(null);
        setBlogStrategy(null);
        setSerpStrategy(null);
        setInitialLoad(false);

        setError(null);
        setTopicError(null);
        setStrategyError(null);
        setSerpStrategyError(null);
        setRecoError(null);
        setSustainableTopicsError(null);
        setCategoryTrendError(null);
        
        setPromptResult(null);
        setPromptResultError(null);
    
        setPromptResultLoading(true);
    
        try {
            const data = await executePromptAsCompetitionAnalysis(promptText);
            setPromptResult(data);
            setKeyword(data.keyword);
        } catch (err) {
            if (err instanceof Error) {
                setPromptResultError(err.message);
            } else {
                setPromptResultError('프롬프트 실행 중 알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setPromptResultLoading(false);
        }
    };

    const handleReset = () => {
        setResults([]);
        setError(null);
        setInitialLoad(true);
        setSource('google');
        setFeature('competition');
        setKeyword('');
        setMainKeyword('');
        setBlogTopics(null);
        setTopicTitle('');
        setTopicLoading(false);
        setTopicError(null);
        setBlogStrategy(null);
        setStrategyLoading(false);
        setStrategyError(null);
        setSerpStrategy(null);
        setSerpStrategyLoading(false);
        setSerpStrategyError(null);
        setRecommendedKeywords(null);
        setRecoLoading(false);
        setRecoError(null);
        setSustainableTopics(null);
        setSustainableTopicsError(null);
        setSustainableTopicsLoading(false);
        setCategoryTopicData(null);
        setCategoryAgeData(null);
        setCategoryTrendError(null);
        setCategoryTrendLoading(false);

        setPromptResult(null);
        setPromptResultError(null);
    };

    const getWelcomeMessage = () => {
        if (feature === 'keywords') return "분석할 키워드를 입력하고 '키워드 검색' 버튼을 눌러주세요.";
        if (feature === 'related-keywords') return "Google SERP를 분석하고 콘텐츠 전략을 수립할 기준 키워드를 입력해주세요.";
        if (feature === 'blogs') return "상위 10개 포스트를 조회할 키워드를 입력해주세요.";
        if (feature === 'sustainable-topics') return "하나의 키워드를 다양한 관점으로 확장할 '다각도 블로그 주제'를 발굴할 키워드를 입력해주세요.";
        if (feature === 'shopping') return "네이버 스마트스토어 등 상품 링크를 입력하면 상세 설명과 카피라이팅을 생성합니다.";
        if (feature === 'trends') return "키워드를 입력하면 연령별, 성별 인구통계 데이터와 관련 주제를 시각화합니다.";
        if (feature === 'category-trends') return "카테고리를 선택하여 현재 가장 인기있는 키워드 트렌드를 확인하세요.";
        return "경쟁력을 분석할 키워드를 입력하고 '키워드 검색' 버튼을 눌러주세요.";
    }
    
    const getNoResultsMessage = () => {
        if (feature === 'keywords') return "해당 키워드에 대한 자동완성검색어를 찾을 수 없습니다.";
        if (feature === 'related-keywords') return "해당 키워드에 대한 SERP 데이터(관련 검색어, PAA)를 찾을 수 없습니다.";
        if (feature === 'blogs') return "해당 키워드에 대한 블로그 포스트를 찾을 수 없습니다.";
        if (feature === 'sustainable-topics') return "해당 키워드에 대한 '다각도 블로그 주제'를 발굴할 수 없습니다.";
        return "분석 결과를 가져올 수 없습니다. 다른 키워드로 시도해보세요.";
    }

    const anyLoading = loading || recoLoading || sustainableTopicsLoading || promptResultLoading || categoryTrendLoading;

    return (
        <div className="bg-[#0f172a] text-white font-sans h-screen flex flex-col relative overflow-hidden">
            {/* Flashy Background with lighter/brighter accents */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1e1b4b] to-[#0f172a] z-0 pointer-events-none"></div>
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col flex-grow p-4 sm:p-8 min-h-0">
                <header className="relative text-center mb-8 shrink-0 bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
                    <h1 className="text-4xl sm:text-6xl font-extrabold mb-3 title-effect tracking-tight">
                        <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                            날로먹자 키워드
                        </span>
                        <span className="text-yellow-400 text-2xl sm:text-4xl ml-2 font-serif italic">for Gemini</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-light">
                        자동완성검색어, 경쟁력 분석, 쇼핑커넥트, 트렌드 분석을 한번에
                    </p>
                    <div className="absolute top-4 right-4">
                        <button 
                            onClick={() => setIsHelpModalOpen(true)}
                            className="p-2 rounded-full bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-cyan-300 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 flex items-center justify-center h-10 w-10 shadow-lg border border-slate-700/50"
                            aria-label="사용법 보기"
                            title="사용법 보기"
                        >
                           <span className="text-xl" role="img" aria-label="노트 아이콘">📝</span>
                        </button>
                    </div>
                </header>
                
                <div className="flex flex-col lg:flex-row gap-8 flex-grow min-h-0">
                    <main className="flex-grow lg:w-2/3 overflow-y-auto custom-scrollbar pr-2">
                        <CurrentStatus />
                        <FeatureSelector 
                            selectedFeature={feature} 
                            onSelectFeature={handleFeatureSelect} 
                            loading={anyLoading}
                            onFetchRecommendations={handleFetchRecommendations}
                            recoLoading={recoLoading}
                            onReset={handleReset}
                        />
                        {feature === 'keywords' && (
                           <SearchEngineSelector selectedSource={source} onSelectSource={setSource} loading={anyLoading} />
                        )}
                        
                        <KeywordInputForm onSearch={handleSearch} loading={anyLoading} keyword={keyword} setKeyword={setKeyword} feature={feature} />
                        
                        <div className="mt-8 min-h-[300px]">
                            {/* New Feature Components */}
                            {feature === 'shopping' && <ShoppingProductGenerator />}
                            {feature === 'trends' && <TrendDataViewer />}
                            {feature === 'category-trends' && (
                                <>
                                    <CategoryTrendSelector 
                                        selectedCategory={selectedCategory} 
                                        onSelectCategory={handleCategorySelect}
                                        loading={categoryTrendLoading}
                                    />
                                    {categoryTrendLoading && <LoadingSpinner />}
                                    {categoryTrendError && <ErrorMessage message={categoryTrendError} />}
                                    
                                    {!categoryTrendLoading && (categoryTopicData || categoryAgeData) && (
                                        <CategoryTrendView 
                                            category={selectedCategory} 
                                            topicData={categoryTopicData}
                                            ageData={categoryAgeData}
                                            activeTab={trendTab}
                                            onTabChange={handleTrendTabChange}
                                            onKeywordClick={handleKeywordClick}
                                            loading={categoryTrendLoading}
                                        />
                                    )}
                                    
                                     {!categoryTopicData && !categoryAgeData && !categoryTrendLoading && !categoryTrendError && (
                                        <div className="text-center p-8 bg-slate-800/50 rounded-lg shadow-md border border-slate-700">
                                            <p className="text-slate-400">카테고리를 선택하여 트렌드 키워드를 확인해보세요.</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Existing Features */}
                            {promptResultLoading && <LoadingSpinner />}
                            {promptResultError && <ErrorMessage message={promptResultError} />}
                            {promptResult && <PromptResultDisplay data={promptResult} />}
                            
                            {!promptResultLoading && !promptResultError && !promptResult && (
                                <>
                                    {recoLoading && <LoadingSpinner />}
                                    {recoError && <ErrorMessage message={recoError} />}
                                    {recommendedKeywords && <RecommendedKeywordsDisplay data={recommendedKeywords} />}

                                    {!recoLoading && !recoError && !recommendedKeywords && (
                                        <>
                                            {(loading || sustainableTopicsLoading) && <LoadingSpinner />}
                                            {error && <ErrorMessage message={error} />}
                                            {sustainableTopicsError && <ErrorMessage message={sustainableTopicsError} />}
                                            
                                            {!loading && !error && !sustainableTopicsLoading && !sustainableTopicsError && feature !== 'shopping' && feature !== 'trends' && feature !== 'category-trends' &&(
                                                <>
                                                    {isCompetitionResult(results) && <CompetitionAnalysisResults data={results[0]} />}
                                                    {isBlogResults(results) && (
                                                        <div className="space-y-6">
                                                            <BlogResultsTable data={results} />
                                                            {strategyLoading && <LoadingSpinner />}
                                                            {strategyError && <ErrorMessage message={strategyError} />}
                                                            {blogStrategy && <BlogStrategyReport data={blogStrategy} />}
                                                        </div>
                                                    )}
                                                    {isGoogleSerpResult(results) && (
                                                        <div className="space-y-6">
                                                            <ResultsTable
                                                                data={results[0].related_searches.map((kw, i) => ({ id: i + 1, keyword: kw }))}
                                                                onKeywordClick={handleKeywordClick}
                                                                onGenerateTopicsFromMain={() => {}}
                                                                onGenerateTopicsFromAll={() => {}}
                                                                loading={false}
                                                                feature={feature}
                                                            />
                                                            <PeopleAlsoAsk data={results[0].people_also_ask} />
                                                            {serpStrategyLoading && <LoadingSpinner />}
                                                            {serpStrategyError && <ErrorMessage message={serpStrategyError} />}
                                                            {serpStrategy && <SerpStrategyReport data={serpStrategy} />}
                                                        </div>
                                                    )}
                                                    {isKeywordResults(results) && (
                                                        <div className="space-y-6">
                                                            <ResultsTable 
                                                                data={results}
                                                                onKeywordClick={handleKeywordClick}
                                                                onGenerateTopicsFromMain={() => handleGenerateTopics('main')}
                                                                onGenerateTopicsFromAll={() => handleGenerateTopics('all')}
                                                                loading={topicLoading}
                                                                feature={feature}
                                                            />
                                                            {topicLoading && <LoadingSpinner />}
                                                            {topicError && <ErrorMessage message={topicError} />}
                                                            {blogTopics && <BlogTopicSuggestions title={topicTitle} data={blogTopics} />}
                                                        </div>
                                                    )}
                                                    {sustainableTopics && <SustainableTopicsResults data={sustainableTopics} />}
                                                </>
                                            )}
                                        
                                            {initialLoad && !anyLoading && !error && !recommendedKeywords && !sustainableTopicsError && feature !== 'shopping' && feature !== 'trends' && feature !== 'category-trends' && (
                                                <div className="text-center p-12 bg-slate-800/30 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center h-64">
                                                    <div className="text-6xl mb-4 opacity-50">🚀</div>
                                                    <p className="text-slate-300 text-lg font-medium">{getWelcomeMessage()}</p>
                                                </div>
                                            )}
                                            {!initialLoad && results.length === 0 && !sustainableTopics && !anyLoading && !error && !recommendedKeywords && !sustainableTopicsError && feature !== 'shopping' && feature !== 'trends' && feature !== 'category-trends' && (
                                                <div className="text-center p-8 bg-slate-800/50 rounded-lg shadow-md border border-slate-700">
                                                    <p className="text-slate-400">{getNoResultsMessage()}</p>
                                                </div>
                                            )}
                                        </>
                                     )}
                                </>
                            )}
                        </div>
                    </main>

                    <aside className="lg:w-1/3 overflow-y-auto custom-scrollbar pr-2">
                        <RealtimeKeywordsSidebar onPromptExecute={handlePromptExecute} />
                    </aside>
                </div>
            </div>
            {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
        </div>
    );
};

export default App;
