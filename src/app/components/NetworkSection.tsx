import React from 'react';

interface NetworkSectionProps {
    networkRef: React.RefObject<HTMLDivElement>;
}

const NetworkSection: React.FC<NetworkSectionProps> = ({ networkRef }) => (
    <div
        ref={networkRef}
        className="flex-grow border border-gray-300 p-4 rounded mb-4 lg:mb-0 min-h-[30vh] lg:min-h-[80vh]"
        style={{ flexBasis: "66.67%" }}
    ></div>
);

export default NetworkSection;