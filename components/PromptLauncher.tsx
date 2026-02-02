
import React, { useState } from 'react';
import PromptModal from './PromptModal';

interface PromptLauncherProps {
    onExecute: (prompt: string) => void;
}

const PromptLauncher: React.FC<PromptLauncherProps> = ({ onExecute }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleExecute = (prompt: string) => {
        onExecute(prompt);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                 <h2 className="text-lg font-bold text-cyan-400 mb-3">프롬프트 라이브러리</h2>
                <button
                    onClick={handleOpenModal}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center shrink-0"
                >
                    날로먹자 키워드 프롬프트 50
                </button>
            </div>
            {isModalOpen && (
                <PromptModal
                    onClose={handleCloseModal}
                    onExecute={handleExecute}
                />
            )}
        </>
    );
};

export default PromptLauncher;
