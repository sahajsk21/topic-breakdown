import React from 'react';

interface InputSectionProps {
    isLoading: boolean;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, callback: () => void) => void;
    handleGenerateGraph: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ isLoading, handleKeyPress, handleGenerateGraph }) => (
    <div className="flex flex-col sm:flex-row items-center mb-4">
        <input
            type="text"
            id="main-topic"
            className="border border-gray-300 p-2 rounded mb-2 sm:mb-0 sm:mr-2 w-full sm:flex-grow"
            placeholder="Enter main topic..."
            onKeyUp={(e) => handleKeyPress(e, handleGenerateGraph)}
            disabled={isLoading}
        />
        <div className="flex space-x-2">
            <button
                className={`p-2 rounded bg-blue-500 text-white whitespace-nowrap w-40 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleGenerateGraph}
                disabled={isLoading}
            >
                {isLoading ? <span className="loader mx-auto"></span> : "Generate Graph"}
            </button>
        </div>
    </div>
);

export default InputSection;