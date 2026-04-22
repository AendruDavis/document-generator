import React, { useEffect, useRef } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  RotateCcw,
  Underline,
  Unlink
} from 'lucide-react';

const hasHtmlMarkup = (value) => /<\/?[a-z][\s\S]*>/i.test(value || '');

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const normalizeRichText = (value) => {
  if (!value) {
    return '';
  }

  if (hasHtmlMarkup(value)) {
    return value;
  }

  return value
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`)
    .join('');
};

const toolbarButtons = [
  { command: 'formatBlock', value: '<p>', icon: RemoveFormatting, label: 'Paragraph' },
  { command: 'formatBlock', value: '<h1>', icon: Heading1, label: 'Heading 1' },
  { command: 'formatBlock', value: '<h2>', icon: Heading2, label: 'Heading 2' },
  { command: 'bold', icon: Bold, label: 'Bold' },
  { command: 'italic', icon: Italic, label: 'Italic' },
  { command: 'underline', icon: Underline, label: 'Underline' },
  { command: 'insertUnorderedList', icon: List, label: 'Bullets' },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
  { command: 'justifyLeft', icon: AlignLeft, label: 'Align left' },
  { command: 'justifyCenter', icon: AlignCenter, label: 'Align center' },
  { command: 'justifyRight', icon: AlignRight, label: 'Align right' },
  { command: 'justifyFull', icon: AlignJustify, label: 'Justify' },
  { command: 'undo', icon: RotateCcw, label: 'Undo' },
  { command: 'redo', icon: Redo2, label: 'Redo' }
];

const RichTextEditor = ({ label, value, onChange, placeholder, minHeight = '240px' }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const normalizedValue = normalizeRichText(value);

    if (editorRef.current && editorRef.current.innerHTML !== normalizedValue) {
      editorRef.current.innerHTML = normalizedValue;
    }
  }, [value]);

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const runCommand = (command, commandValue = null) => {
    focusEditor();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || '');
  };

  const handleLink = () => {
    focusEditor();
    const url = window.prompt('Enter the link URL');

    if (!url) {
      return;
    }

    document.execCommand('createLink', false, url);
    onChange(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="space-y-2">
      {label && <p className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">{label}</p>}

      <div className="rounded-lg border border-stone-200 bg-stone-50">
        <div className="flex flex-wrap gap-1 border-b border-stone-200 bg-white p-2">
          {toolbarButtons.map(({ command, value: commandValue, icon: Icon, label: buttonLabel }) => (
            <button
              key={`${command}-${buttonLabel}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runCommand(command, commandValue)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 transition-all hover:border-emerald-300 hover:text-emerald-700"
              title={buttonLabel}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleLink}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 transition-all hover:border-emerald-300 hover:text-emerald-700"
            title="Insert link"
          >
            <Link className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('unlink')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 transition-all hover:border-emerald-300 hover:text-emerald-700"
            title="Remove link"
          >
            <Unlink className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('removeFormat')}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all hover:border-emerald-300 hover:text-emerald-700"
            title="Clear formatting"
          >
            <RemoveFormatting className="h-4 w-4" />
            Clear
          </button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
          data-placeholder={placeholder}
          className="rich-text-editor min-h-[220px] w-full rounded-b-lg bg-white px-4 py-3 text-sm text-stone-700 focus:outline-none"
          style={{ minHeight }}
        />
      </div>

      <p className="text-xs text-stone-500">
        Supports headings, bold, italic, underline, lists, alignment, links, undo, redo, and paste from other editors.
      </p>
    </div>
  );
};

export default RichTextEditor;
