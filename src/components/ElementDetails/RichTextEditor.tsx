'use client';

import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, Heading3 } from 'lucide-react';

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
  const buttonClass = (type: string, options?: any) => `p-2 rounded transition-colors ${editor.isActive(type, options) ? 'bg-gray-200' : 'hover:bg-gray-100'}`;
  return (
    <div className="flex items-center gap-1 p-1 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass('bold')}><Bold className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass('italic')}><Italic className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass('heading', { level: 2 })}><Heading2 className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={buttonClass('heading', { level: 3 })}><Heading3 className="w-4 h-4" /></button>
    </div>
  );
};

export const RichTextEditor = ({ content, onChange }: { content: any, onChange: (newContent: any) => void }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add notes, context, or hypotheses here...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none w-full max-w-none p-4',
      },
    },
  });
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-inner">
      <EditorToolbar editor={editor} />
      <div className="min-h-[200px]"><EditorContent editor={editor} /></div>
    </div>
  );
};
