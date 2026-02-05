'use client'

import '@mdxeditor/editor/style.css'
import './mdx-editor.css'

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type MDXEditorMethods,
} from '@mdxeditor/editor'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { cn } from '@/lib/utils'

function ToolbarContents() {
  return (
    <>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <CodeToggle />
      <Separator />
      <BlockTypeSelect />
      <Separator />
      <CreateLink />
      <Separator />
      <InsertTable />
      <InsertThematicBreak />
      <Separator />
      <ListsToggle />
    </>
  )
}

interface IMdxEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const MdxEditor = forwardRef<MDXEditorMethods, IMdxEditorProps>(
  ({ value, onChange, placeholder = '내용을 입력하세요...' }, ref) => {
    const editorRef = useRef<MDXEditorMethods>(null)
    const prevValueRef = useRef<string>(value)

    // 외부 ref와 내부 ref 연결
    useImperativeHandle(ref, () => editorRef.current as MDXEditorMethods)

    // 외부에서 value가 변경되면 에디터에 반영 (탭 전환 등 대응)
    useEffect(() => {
      if (editorRef.current && value !== prevValueRef.current) {
        editorRef.current.setMarkdown(value)
        prevValueRef.current = value
      }
    }, [value])

    return (
      <div className={cn('mdx-editor-wrapper')}>
        <MDXEditor
          ref={editorRef}
          markdown={value}
          onChange={onChange}
          placeholder={placeholder}
          contentEditableClassName="mdx-prose"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                js: 'JavaScript',
                javascript: 'JavaScript',
                ts: 'TypeScript',
                typescript: 'TypeScript',
                jsx: 'JSX',
                tsx: 'TSX',
                css: 'CSS',
                html: 'HTML',
                json: 'JSON',
                python: 'Python',
                bash: 'Bash',
                sql: 'SQL',
                '': 'Plain Text',
              },
            }),
            toolbarPlugin({
              toolbarContents: ToolbarContents,
            }),
          ]}
          className={cn('mdx-editor-container')}
        />
      </div>
    )
  },
)

MdxEditor.displayName = 'MdxEditor'

export { MdxEditor }
