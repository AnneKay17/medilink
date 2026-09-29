// Card component - reusable container for content
// Used throughout the app to wrap medical information, forms, etc.

export const Card = ({ children, className = '' }) => {
  return (
    <article 
      className={`
        bg-white 
        border border-gray-200 
        rounded-lg 
        shadow-sm 
        p-6
        ${className}
      `}
    >
      {children}
    </article>
  );
};