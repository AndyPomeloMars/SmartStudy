import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface LatexRendererProps {
  children: string;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ children, className = '' }) => {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({node, ...props}) => <p className="mb-2 last:mb-0 inline-block" {...props} />
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};