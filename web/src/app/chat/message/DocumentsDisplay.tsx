import React, { useState } from "react";
import { OnyxDocument } from "@/lib/search/interfaces";
import { FiChevronDown, FiChevronUp, FiFile } from "react-icons/fi";

import { openDocument } from "@/lib/search/utils";

interface DocumentsDisplayProps {
  documents: OnyxDocument[];
  updatePresentingDocument: (document: OnyxDocument) => void;
}

const DocumentsDisplay: React.FC<DocumentsDisplayProps> = ({ documents, updatePresentingDocument }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="w-full border border-background-200 rounded-lg overflow-hidden">
      <div
        className="flex justify-between items-center p-4 bg-background-50 cursor-pointer"
        onClick={toggleExpand}
      >
        <h3 className="text-lg font-semibold">Sources</h3>
        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
      </div>
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <button
              key={index}
              onClick={() => openDocument(doc, updatePresentingDocument)}
              className="bg-white p-4 rounded-lg shadow-sm border border-background-100 text-left cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-start space-x-3">
                <FiFile className="text-text-400 mt-1" />
                <div>
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">
                    {doc.semantic_identifier || "Unknown Source"}
                  </h4>
                  <p className="text-xs text-text-600 line-clamp-3">
                    {doc.blurb}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsDisplay;
