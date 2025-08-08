'use client';

import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent, Editor, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { suggestion } from '../MentionSuggestion';
import { Bold, Italic, Heading2, Heading3 } from 'lucide-react';

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
  const buttonClass = (type: string, options?: Record<string, unknown>) => `p-2 rounded transition-colors ${editor.isActive(type, options) ? 'bg-gray-200' : 'hover:bg-gray-100'}`;
  return (
    <div className="flex items-center gap-1 p-1 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass('bold')}><Bold className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass('italic')}><Italic className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass('heading', { level: 2 })}><Heading2 className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={buttonClass('heading', { level: 3 })}><Heading3 className="w-4 h-4" /></button>
    </div>
  );
};

export const RichTextEditor = ({ content, onChange, onMentionClick }: { 
  content: JSONContent, 
  onChange: (newContent: JSONContent) => void,
  onMentionClick?: (mentionId: string, mentionType: string) => void 
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add notes, context, or hypotheses here... Use @ to mention related items.',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none w-full max-w-none p-4',
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('mention') && onMentionClick) {
          const mentionId = target.getAttribute('data-id');
          const mentionType = target.getAttribute('data-type');
          if (mentionId && mentionType) {
            onMentionClick(mentionId, mentionType);
          }
        }
        return false;
      },
    },
  });
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-inner">
      <EditorToolbar editor={editor} />
      <div className="min-h-[200px]">
        <EditorContent editor={editor} />
      </div>
      
      {/* Mention styles */}
      <style jsx global>{`
        .mention {
          display: inline-block;
          padding: 2px 6px;
          margin: 0 1px;
          background-color: #dbeafe;
          border: 1px solid #93c5fd;
          border-radius: 4px;
          color: #1e40af;
          font-weight: 500;
          font-size: 0.9em;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        
        .mention:hover {
          background-color: #bfdbfe;
          border-color: #60a5fa;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        
        /* Type-specific mention colors */
        .mention[data-mention-type="interview"] {
          background-color: #dbeafe !important;
          border-color: #93c5fd !important;
          color: #1e40af !important;
        }
        
        .mention[data-mention-type="evidence"] {
          background-color: #fef3c7 !important;
          border-color: #fbbf24 !important;
          color: #92400e !important;
        }
        
        .mention[data-mention-type="opportunity"] {
          background-color: #d1fae5 !important;
          border-color: #6ee7b7 !important;
          color: #065f46 !important;
        }
        
        .mention[data-mention-type="solution"] {
          background-color: #fce7f3 !important;
          border-color: #f9a8d4 !important;
          color: #9d174d !important;
        }
        
        .mention[data-mention-type="outcome"] {
          background-color: #e0e7ff !important;
          border-color: #a5b4fc !important;
          color: #3730a3 !important;
        }
        
        .mention[data-mention-type="assumption"] {
          background-color: #f3e8ff !important;
          border-color: #c4b5fd !important;
          color: #5b21b6 !important;
        }
        
        .mention[data-mention-type="experiment"] {
          background-color: #fef7ff !important;
          border-color: #e9d5ff !important;
          color: #7c2d12 !important;
        }
      `}</style>
    </div>
  );
};
