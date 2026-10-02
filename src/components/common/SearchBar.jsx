import { useState, useRef, useCallback } from 'react';

// SearchBar component
// Reusable search input with debouncing, clear button, loading state
// Used for: patient search, facility search, medication lookup

const sizeConfig = {
  sm: {
    input: 'text-sm px-3 py-2',
    icon: 'w-4 h-4',
  },
  md: {
    input: 'text-base px-4 py-3',
    icon: 'w-5 h-5',
  },
  lg: {
    input: 'text-lg px-5 py-4',
    icon: 'w-6 h-6',
  },
};

export const SearchBar = ({
  value = '',
  onChange = () => {},           // called on every input change
  onSearch = () => {},           // called on Enter or search button click
  onClear = () => {},            // called when clear button clicked
  placeholder = 'Search...',
  size = 'md',                   // 'sm', 'md', 'lg'
  disabled = false,
  isLoading = false,
  debounceMs = 300,              // debounce delay in milliseconds
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef(null);

  // Debounced onChange handler
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced search
    debounceTimerRef.current = setTimeout(() => {
      onSearch(newValue);
    }, debounceMs);
  }, [onChange, onSearch, debounceMs]);

  // Clear search
  const handleClear = () => {
    onChange('');
    onClear();
  };

  // Search on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onSearch(value);
    }
  };

  const config = sizeConfig[size];

  return (
    <div className="relative w-full">
      {/* Search icon (left) */}
      <svg
        className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${config.icon}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        aria-label={placeholder}
        className={`
          w-full rounded-lg border border-gray-300
          pl-10 pr-10
          ${config.input}
          bg-white text-gray-900 placeholder-gray-400
          transition-all
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${isFocused ? 'border-blue-400' : 'border-gray-300'}
        `}
      />

      {/* Right side: loading spinner or clear button */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {isLoading ? (
          <svg
            className={`${config.icon} text-gray-400 animate-spin`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Searching"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
        ) : value && !disabled ? (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            aria-label="Clear search"
          >
            <svg
              className={config.icon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
};