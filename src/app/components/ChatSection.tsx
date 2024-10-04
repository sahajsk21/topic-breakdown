import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatSectionProps {
    topicTitle: string;
    messages: { role: string; content: string }[];
    userInput: string;
    setUserInput: React.Dispatch<React.SetStateAction<string>>;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, callback: () => void) => void;
    handleSendMessage: () => void;
    isSending: boolean;
    chatContainerRef: React.RefObject<HTMLDivElement>;
}

const ChatSection: React.FC<ChatSectionProps> = ({
    topicTitle,
    messages,
    userInput,
    setUserInput,
    handleKeyPress,
    handleSendMessage,
    isSending,
    chatContainerRef,
}) => (
    <div className="lg:ml-4 lg:w-1/3 flex flex-col" style={{ flexBasis: "33.33%" }}>
        <h2 className="text-2xl font-semibold mb-2">{topicTitle}</h2>

        <div ref={chatContainerRef} className="overflow-y-auto h-64 mb-4 hide-scrollbar flex-grow">
            {messages.map((msg, index) => (
                <div key={index} className={`p-2 mb-2 rounded ${msg.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
            ))}
        </div>

        <div className="flex items-center mt-auto">
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                className="border border-gray-300 p-2 rounded flex-grow mr-2"
                onKeyUp={(e) => handleKeyPress(e, handleSendMessage)}
                disabled={isSending}
            />
            <button
                onClick={handleSendMessage}
                className={`p-2 rounded bg-blue-500 text-white whitespace-nowrap w-24 ${isSending ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isSending}
            >
                {isSending ? <span className="loader mx-auto"></span> : "Send"}
            </button>
        </div>
    </div>
);

export default ChatSection;