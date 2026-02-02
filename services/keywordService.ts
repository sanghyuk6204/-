
import { GoogleGenAI, Type } from "@google/genai";
import type { 
    KeywordData, 
    SearchSource, 
    BlogPostData, 
    KeywordMetrics, 
    GeneratedTopic, 
    BlogStrategyReportData, 
    RecommendedKeyword, 
    SustainableTopicCategory, 
    GoogleSerpData, 
    PaaItem, 
    SerpStrategyReportData, 
    WeatherData, 
    ShoppingProductData, 
    TrendAnalysisData, 
    TopicGroup, 
    AgeGroupTrend 
} from '../types';

interface Proxy {
    name: string;
    buildUrl: (url: string) => string;
    parseResponse: (response: Response) => Promise<string>;
}

const PROXIES: Proxy[] = [
    {
        name: 'corsproxy.io',
        buildUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        parseResponse: (response) => response.text(),
    },
    {
        name: 'allorigins.win (JSON)',
        buildUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        async parseResponse(response: Response) {
            const data = await response.json();
            if (data && data.contents) {
                return data.contents;
            }
            throw new Error('allorigins.win: Invalid JSON response structure.');
        },
    },
    {
        name: 'thingproxy.freeboard.io',
        buildUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
        parseResponse: (response) => response.text(),
    },
];

const MAX_RETRIES_PER_PROXY = 2;
const RETRY_DELAY_MS = 1000;
const FETCH_TIMEOUT_MS = 15000;

// Helper to get API Key safely
const getApiKey = (): string => {
    // Priority: 1. LocalStorage (User input), 2. Environment Variable
    const key = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
    if (!key) {
        throw new Error("API Key가 설정되지 않았습니다. 로그인 화면에서 키를 입력해주세요.");
    }
    return key;
};

function extractJsonFromText(text: string): any {
    let jsonString = text.trim();
    const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        jsonString = markdownMatch[1].trim();
    }
    const startIndex = jsonString.search(/[[{]/);
    if (startIndex === -1) throw new Error('AI 응답에서 유효한 JSON을 찾을 수 없습니다.');
    
    // Find matching bracket
    const startChar = jsonString[startIndex];
    const endChar = startChar === '[' ? ']' : '}';
    let openCount = 0;
    let endIndex = -1;
    let inString = false;
    let escapeChar = false;
    
    for (let i = startIndex; i < jsonString.length; i++) {
        const char = jsonString[i];
        if (escapeChar) { escapeChar = false; continue; }
        if (char === '\\') { escapeChar = true; continue; }
        if (char === '"') { inString = !inString; }
        if (!inString) {
            if (char === startChar) openCount++;
            else if (char === endChar) openCount--;
        }
        if (openCount === 0) {
            endIndex = i;
            break;
        }
    }
    
    if (endIndex === -1) {
         // Fallback
         const lastBrace = jsonString.lastIndexOf('}');
         const lastBracket = jsonString.lastIndexOf(']');
         endIndex = Math.max(lastBrace, lastBracket);
    }
    
    if (endIndex === -1) throw new Error('AI 응답에서 유효한 JSON의 끝을 찾을 수 없습니다.');
    const potentialJson = jsonString.substring(startIndex, endIndex + 1);
    try {
        return JSON.parse(potentialJson);
    } catch (error) {
        throw new Error('AI가 반환한 데이터의 형식이 잘못되었습니다.');
    }
}

const fetchWithTimeout = async (resource: RequestInfo, options: RequestInit & { timeout?: number } = {}): Promise<Response> => {
    const { timeout = FETCH_TIMEOUT_MS } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('Timeout'), timeout);
    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
};

const fetchWithProxies = async (targetUrl: string, responseParser: (text: string) => any) => {
    let lastKnownError: Error | null = null;
    for (const proxy of PROXIES) {
        const proxyUrl = proxy.buildUrl(targetUrl);
        for (let attempt = 1; attempt <= MAX_RETRIES_PER_PROXY; attempt++) {
            try {
                const response = await fetchWithTimeout(proxyUrl, { timeout: FETCH_TIMEOUT_MS });
                if (!response.ok) {
                    lastKnownError = new Error(`HTTP 오류! 상태: ${response.status}.`);
                    break;
                }
                const rawContent = await proxy.parseResponse(response);
                if (!rawContent) {
                    lastKnownError = new Error('프록시에서 빈 콘텐츠를 반환했습니다.');
                    continue;
                }
                return responseParser(rawContent);
            } catch (error) {
                lastKnownError = error instanceof Error ? error : new Error("알 수 없는 요청 오류");
                if (attempt < MAX_RETRIES_PER_PROXY) await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }
    }
    throw lastKnownError || new Error('데이터를 가져오지 못했습니다.');
};

// Implementations

export const fetchRelatedKeywords = async (keyword: string, source: SearchSource): Promise<KeywordData[]> => {
    const encodedKeyword = encodeURIComponent(keyword);
    let targetUrl = '';
    
    if (source === 'google') {
        targetUrl = `https://suggestqueries.google.com/complete/search?output=firefox&q=${encodedKeyword}`;
    } else {
        targetUrl = `https://ac.search.naver.com/nx/ac?q=${encodedKeyword}&con=0&frm=nv&ans=2&r_format=json&r_enc=UTF-8&r_unicode=0&t_koreng=1&run=2&rev=4&q_enc=UTF-8&st=100`;
    }

    try {
        if (source === 'google') {
            const data = await fetchWithProxies(targetUrl, (text) => JSON.parse(text));
            return data[1].map((k: string, i: number) => ({ id: i + 1, keyword: k }));
        } else {
            const data = await fetchWithProxies(targetUrl, (text) => JSON.parse(text));
            const items = data.items?.[0] || [];
            return items.map((item: any, i: number) => ({ id: i + 1, keyword: item[0] }));
        }
    } catch (e) {
        console.warn("Fetch failed, fallback to AI", e);
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `List 10 autocomplete keywords for "${keyword}" on ${source}. Return JSON array of strings.`,
            config: { responseMimeType: "application/json" }
        });
        const suggestions = JSON.parse(response.text || "[]");
        if(Array.isArray(suggestions)) {
             return suggestions.map((k: string, i: number) => ({ id: i + 1, keyword: k }));
        }
        return [];
    }
};

export const fetchNaverBlogPosts = async (keyword: string): Promise<BlogPostData[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Simulate a search for "${keyword}" on Naver Blogs. 
    Generate 5 realistic blog post titles and dummy URLs that might appear in the top results.
    Return a JSON array of objects with keys: "title", "url".
    `;
    try {
         const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const posts = JSON.parse(response.text || "[]");
        if(Array.isArray(posts)) {
            return posts.map((p: any, i: number) => ({ id: i + 1, title: p.title, url: p.url || `https://blog.naver.com/example/${i}` }));
        }
        return [];
    } catch (e) {
        throw new Error("블로그 포스트를 가져오는데 실패했습니다.");
    }
};

export const analyzeKeywordCompetition = async (keyword: string): Promise<KeywordMetrics> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Analyze the keyword "${keyword}" for SEO competition.
    Provide the following metrics and analysis in JSON format:
    - opportunityScore (0-100)
    - searchVolumeEstimate (numeric estimate)
    - competitionScore (0-100, higher means harder)
    - competitionLevel (string)
    - documentCount (numeric estimate)
    - keywordLength
    - wordCount
    - analysis object containing:
        - title (A catchy title for the analysis)
        - reason (Why this score?)
        - opportunity (Bulleted list of opportunities)
        - threat (Bulleted list of threats)
        - consumptionAndIssues (Current consumption trends and issues)
        - conclusion (Final strategy)
    - strategy object containing:
        - expandedKeywords (Array of strings)
        - blogTopics (Array of objects with title and description)
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}") as KeywordMetrics;
    } catch (e) {
        throw new Error("키워드 경쟁력 분석에 실패했습니다.");
    }
};

export const executePromptAsCompetitionAnalysis = async (promptText: string): Promise<KeywordMetrics> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Execute the following prompt and format the result to match the structure of a KeywordMetrics object.
    
    User Prompt: ${promptText}
    
    The output must be a valid JSON object with the following structure (fill in plausible data based on the prompt result):
    {
      "keyword": "Derived from prompt",
      "opportunityScore": 80,
      "searchVolumeEstimate": 1000,
      "competitionScore": 50,
      "competitionLevel": "Medium",
      "documentCount": 5000,
      "keywordLength": 2,
      "wordCount": 1,
      "analysis": {
        "title": "Analysis Result",
        "reason": "Summary of request",
        "opportunity": "Insights",
        "threat": "Challenges",
        "consumptionAndIssues": "Usage",
        "conclusion": "Detailed Answer to the Prompt"
      },
      "strategy": {
        "expandedKeywords": [],
        "blogTopics": []
      }
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}") as KeywordMetrics;
    } catch (e) {
        throw new Error("프롬프트 실행에 실패했습니다.");
    }
};

export const generateTopicsFromMainKeyword = async (keyword: string): Promise<GeneratedTopic[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Generate 10 blog topics for the keyword "${keyword}". Return JSON array of objects with: id, title, thumbnailCopy, strategy.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]") as GeneratedTopic[];
    } catch (e) {
        throw new Error("주제 생성에 실패했습니다.");
    }
};

export const generateTopicsFromAllKeywords = async (mainKeyword: string, relatedKeywords: string[]): Promise<GeneratedTopic[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Main keyword: "${mainKeyword}"
    Related keywords: ${relatedKeywords.join(', ')}
    Generate 10 blog topics combining these. Return JSON array of objects with: id, title, thumbnailCopy, strategy.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]") as GeneratedTopic[];
    } catch (e) {
        throw new Error("주제 생성에 실패했습니다.");
    }
};

export const generateBlogStrategy = async (keyword: string, topPosts: BlogPostData[]): Promise<BlogStrategyReportData> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const titles = topPosts.map(p => p.title).join('\n');
    const prompt = `
    Analyze these top blog titles for keyword "${keyword}":
    ${titles}
    
    Provide a strategy report in JSON with:
    - analysis: { structure, characteristics, commonKeywords }
    - suggestions: Array of { id, title, thumbnailCopy, strategy }
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}") as BlogStrategyReportData;
    } catch (e) {
        throw new Error("블로그 전략 생성에 실패했습니다.");
    }
};

export const generateRelatedKeywords = async (keyword: string): Promise<GoogleSerpData> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Find related searches and "People also ask" questions for "${keyword}".
    Return JSON with:
    - related_searches: string[]
    - people_also_ask: Array of { question, answer, content_gap_analysis }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                tools: [{googleSearch: {}}]
            }
        });
        
        let result = JSON.parse(response.text || "{}");
        
        // Ensure structure matches
        if (!result.related_searches) result.related_searches = [];
        if (!result.people_also_ask) result.people_also_ask = [];
        
        return result as GoogleSerpData;
    } catch (e) {
        // Fallback without tool if it fails
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}") as GoogleSerpData;
    }
};

export const generateSerpStrategy = async (keyword: string, serpData: GoogleSerpData): Promise<SerpStrategyReportData> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Based on SERP data for "${keyword}":
    Related: ${serpData.related_searches.join(', ')}
    PAA: ${serpData.people_also_ask.map(p => p.question).join(', ')}
    
    Generate a content strategy in JSON:
    - analysis: { userIntent, pillarPostSuggestion }
    - suggestions: Array of { id, title, thumbnailCopy, strategy }
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}") as SerpStrategyReportData;
    } catch (e) {
        throw new Error("SERP 전략 생성에 실패했습니다.");
    }
};

export const fetchRecommendedKeywords = async (): Promise<RecommendedKeyword[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Recommend 10 trending keywords for blog content creation today.
    Return JSON array of: { id, keyword, reason, title, thumbnailCopy, strategy }
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                tools: [{googleSearch: {}}]
             }
        });
        const result = JSON.parse(response.text || "[]");
        return Array.isArray(result) ? result : [];
    } catch (e) {
         // Fallback without tool
         const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const result = JSON.parse(response.text || "[]");
        return Array.isArray(result) ? result : [];
    }
};

export const generateSustainableTopics = async (keyword: string): Promise<SustainableTopicCategory[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Generate sustainable blog topic categories for "${keyword}".
    Return JSON array of objects: { category, suggestions: [{ title, keywords: [], strategy }] }
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const result = JSON.parse(response.text || "[]");
        return Array.isArray(result) ? result : [];
    } catch (e) {
        throw new Error("주제 생성 실패");
    }
};

export const fetchCurrentWeather = async (): Promise<WeatherData> => {
     try {
        const response = await fetch("https://wttr.in/Seoul?format=j1");
        if (!response.ok) throw new Error("Weather fetch failed");
        const data = await response.json();
        const current = data.current_condition[0];
        return {
            temperature: `${current.temp_C}°C`,
            condition: current.weatherDesc[0].value,
            wind: `${current.windspeedKmph}km/h`,
            humidity: `${current.humidity}%`
        };
    } catch (e) {
        return {
            temperature: "--",
            condition: "정보 없음",
            wind: "-",
            humidity: "-"
        };
    }
};

export const generateProductDescription = async (input: string): Promise<ShoppingProductData> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Generate a shopping product description for: "${input}".
    Return JSON: { productName, catchphrase, sellingPoints: [], description, hashtags: [] }
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}") as ShoppingProductData;
    } catch (e) {
        throw new Error("상품 설명 생성 실패");
    }
};

export const generateTrendAnalysis = async (keyword: string): Promise<TrendAnalysisData> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Analyze trends for keyword "${keyword}".
    Return JSON: { 
        keyword, 
        ageGroup: { '10s', '20s', '30s', '40s', '50s', '60s_plus' }, 
        gender: { male, female }, 
        device: { pc, mobile }, 
        relatedTopics: [], 
        seasonalTrend 
    }
    Use numbers for percentages.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}") as TrendAnalysisData;
    } catch (e) {
        throw new Error("트렌드 분석 실패");
    }
};

export const generateCategoryTrendData = async (category: string): Promise<TopicGroup[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Analyze trend keywords for category "${category}" in Korea.
    Return JSON array: [{ topic, keywords: [{ rank, keyword, change, status }] }]
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const result = JSON.parse(response.text || "[]");
        return Array.isArray(result) ? result : [];
    } catch (e) {
        throw new Error("카테고리 트렌드 생성 실패");
    }
};

export const generateAgeGroupTrends = async (category: string): Promise<AgeGroupTrend[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Analyze age group trends for category "${category}" in Korea.
    Return JSON array: [{ ageGroup, keywords: [{ rank, keyword, change, status }] }]
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const result = JSON.parse(response.text || "[]");
        return Array.isArray(result) ? result : [];
    } catch (e) {
        throw new Error("연령별 트렌드 생성 실패");
    }
};
