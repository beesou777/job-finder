"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Customize heading styles
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-lg font-semibold mt-3 mb-2 text-gray-900" {...props} />
        ),
        // Customize paragraph
        p: ({ node, ...props }) => (
          <p className="mb-4 text-gray-700 leading-relaxed" {...props} />
        ),
        // Customize links
        a: ({ node, href, ...props }) => {
          // Check if it's an internal link
          if (href && (href.startsWith("/") || href.startsWith("#"))) {
            return (
              <Link
                href={href}
                className="text-blue-600 hover:text-blue-700 hover:underline"
                {...props}
              />
            );
          }
          // External links
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline"
              {...props}
            />
          );
        },
        // Customize lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="ml-4" {...props} />
        ),
        // Customize code blocks
        code: ({ node, className, ...props }: any) => {
          const isInline = !className;
          return isInline ? (
            <code
              className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
              {...props}
            />
          ) : (
            <code
              className="block bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4"
              {...props}
            />
          );
        },
        // Customize blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4"
            {...props}
          />
        ),
        // Customize horizontal rule
        hr: ({ node, ...props }) => (
          <hr className="my-6 border-gray-300" {...props} />
        ),
        // Customize strong/bold
        strong: ({ node, ...props }) => (
          <strong className="font-bold text-gray-900" {...props} />
        ),
        // Customize emphasis/italic
        em: ({ node, ...props }) => (
          <em className="italic text-gray-700" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

