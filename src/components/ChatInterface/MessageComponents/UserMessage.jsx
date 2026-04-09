import React from 'react';

const UserMessage = ({ content, images, timestamp, isGrouped }) => {
  return (
    <div className={`flex items-end justify-end space-x-0 sm:space-x-3 w-full sm:w-auto sm:max-w-[90%] md:max-w-2xl animate-in slide-in-from-right-2 duration-300`}>
      <div className="bg-blue-600 text-white rounded-[20px] rounded-br-[4px] px-4 py-3 shadow-lg flex-1 sm:flex-initial shadow-blue-500/10">
        <div className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </div>
        {images && images.length > 0 && (
          <div className={`mt-3 grid ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            {images.map((img, idx) => (
              <div key={idx} className="relative group overflow-hidden rounded-xl border border-blue-500/30">
                <img
                  src={img.data}
                  alt={img.name}
                  className="w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-500"
                  onClick={() => window.open(img.data, '_blank')}
                />
              </div>
            ))}
          </div>
        )}
        <div className="text-[10px] text-blue-100/70 mt-2 font-medium flex items-center justify-end gap-1">
          <span>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      {!isGrouped && (
        <div className="hidden sm:flex w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md border-2 border-white dark:border-gray-800">
          U
        </div>
      )}
    </div>
  );
};

export default UserMessage;
