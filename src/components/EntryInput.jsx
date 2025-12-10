import { useState, useEffect } from 'react';
import { parseEntries, getDuplicateInfo } from '../utils/pickWinners';

// Default dummy entries
const DUMMY_ENTRIES = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Brown',
  'Diana Ross',
  'Edward Chen',
  'Fiona Williams',
  'George Miller',
  'Hannah Davis',
  'Ivan Petrov',
  'Julia Martinez'
];

const STORAGE_KEY = 'instantpick_entries';

export default function EntryInput({ entries, setEntries }) {
  const [text, setText] = useState(() => {
    // Load from localStorage on init, or use dummy entries
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved : DUMMY_ENTRIES.join('\n');
  });
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  
  // Save to localStorage whenever text changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, text);
  }, [text]);
  
  useEffect(() => {
    const parsed = parseEntries(text);
    setEntries(parsed);
    
    // Check for duplicates
    const { duplicates } = getDuplicateInfo(parsed);
    if (duplicates.length > 0) {
      setDuplicateWarning(`${duplicates.length} duplicate${duplicates.length > 1 ? 's' : ''} will be auto-removed`);
    } else {
      setDuplicateWarning(null);
    }
  }, [text, setEntries]);

  const uniqueCount = new Set(entries.filter(Boolean)).size;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          Entries
        </label>
        <span className="text-sm text-gray-500">
          {uniqueCount} unique {uniqueCount === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      
      <div className="relative flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter names, one per line..."
          className="entries-textarea w-full h-full min-h-[300px] p-4 text-base leading-relaxed
                     bg-white border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
                     placeholder-gray-400 resize-none
                     transition-all duration-200"
          spellCheck={false}
        />
      </div>
      
      {duplicateWarning && (
        <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {duplicateWarning}
          </p>
        </div>
      )}
      
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            const parsed = parseEntries(text);
            const shuffled = [...parsed].sort(() => Math.random() - 0.5);
            setText(shuffled.join('\n'));
          }}
          disabled={!text}
          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 
                     rounded-lg hover:bg-gray-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors duration-200
                     flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Shuffle
        </button>
        <button
          onClick={() => {
            const parsed = parseEntries(text);
            const sorted = [...parsed].sort((a, b) => a.localeCompare(b));
            setText(sorted.join('\n'));
          }}
          disabled={!text}
          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 
                     rounded-lg hover:bg-gray-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors duration-200
                     flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          Sort A-Z
        </button>
        <button
          onClick={() => {
            // Remove duplicates from text
            const unique = [...new Set(parseEntries(text))];
            setText(unique.join('\n'));
          }}
          disabled={!duplicateWarning}
          className="px-3 py-2 text-sm font-medium text-teal-600 bg-teal-50 
                     rounded-lg hover:bg-teal-100 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors duration-200"
        >
          Remove Duplicates
        </button>
        <button
          onClick={() => {
            setText('');
            localStorage.removeItem(STORAGE_KEY);
          }}
          disabled={!text}
          className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 
                     rounded-lg hover:bg-red-100 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors duration-200"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
