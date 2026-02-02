
import React from 'react';

const categories = [
    "비즈니스경제", "패션미용", "IT컴퓨터", "요리레시피", "영화", "게임", "국내여행", "해외여행", 
    "문학책", "미술디자인", "공연전시", "음악", "만화애니", "방송", "드라마", "스타연예인", 
    "일상생각", "인테리어DIY", "사진", "사회정치", "육아교육", "종교이미지", "심층리뷰", 
    "반려동물", "환경재배", "스포츠", "저축학", "취미", "맛집", "건강의학", "어학외국어", "교육학문", "자동차"
];

interface CategoryTrendSelectorProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    loading: boolean;
}

const CategoryTrendSelector: React.FC<CategoryTrendSelectorProps> = ({ selectedCategory, onSelectCategory, loading }) => {
    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-md shadow-xl mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-orange-500 mr-2">📂</span> 카테고리 선택
            </h3>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onSelectCategory(cat)}
                        disabled={loading}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border 
                            ${selectedCategory === cat 
                                ? 'bg-orange-600 border-orange-500 text-white shadow-lg scale-105' 
                                : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryTrendSelector;
