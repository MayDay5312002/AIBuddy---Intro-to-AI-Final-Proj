// import './styles.scss'
import { Button, Typography, Paper, Box} from '@mui/material';


import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
// import CodeBlock from '@tiptap/extension-code-block'

import 'highlight.js/styles/github.css'; // in your app entry or the editor component
// import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
// import { all, createLowlight } from 'lowlight';

import { TableKit } from '@tiptap/extension-table';

import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import { Placeholder } from '@tiptap/extensions'

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';


import { marked } from 'marked';

import axios from "axios";

import React from 'react';
import {useState, useEffect, useRef} from 'react';

import { useReactToPrint } from "react-to-print";
import { CustomCodeBlock } from './CustomCodeBlock.js';

// import { useCallback } from 'react'
// const lowlight = createLowlight(all)

const MenuBar = ({ editor, handlePrint}) => {
  if (!editor) {
    return null
  }
  const addImage = () => {
    const url = window.prompt('URL')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }


  const saveMDfile = async () => {
    const fileName =window.prompt("Enter the file name");
    const savedFile = editor.getHTML();
    await axios.post("http://127.0.0.1:4192/api/saveDocument/", {
      content: savedFile,
      filename: fileName
    });
  }

  const loadMDfile = async () => {
    const fileName = window.prompt("Enter the file name");
    const url = "http://127.0.0.1:4192/api/loadDocument/?filename=" +
      (fileName.slice(-3) === ".md" ? fileName : fileName + ".md");
    
    await axios.get(url)
      .then((response) => {
        editor.commands.setContent(response.data.content);
      });
  }


  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          Strike
        </button>
        <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
          >
            Underline
          </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'is-active' : ''}
        >
          Highlight
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        >
          Left
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        >
          Center
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        >
          Right
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
        >
          Justify
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
        >
          Code
        </button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</button>
        <button onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
        >
          Paragraph
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
        >
          H4
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
        >
          H5
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          Ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
        >
          Code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          Blockquote
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          Horizontal rule
        </button>
        <button onClick={() => editor.chain().focus().setHardBreak().run()}>Hard break</button>
        <button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          Insert table
        </button>
        <button onClick={() => editor.chain().focus().addColumnBefore().run()}>
          Add column before
        </button>
        <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
          Add column after
        </button>
        <button onClick={() => editor.chain().focus().deleteColumn().run()}>Delete column</button>
        <button onClick={() => editor.chain().focus().addRowBefore().run()}>
          Add row before
        </button>
        <button onClick={() => editor.chain().focus().addRowAfter().run()}>Add row after</button>
        <button onClick={() => editor.chain().focus().deleteRow().run()}>Delete row</button>
        <button onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</button>
        <button onClick={() => editor.chain().focus().mergeCells().run()}>Merge cells</button>
        <button onClick={() => editor.chain().focus().splitCell().run()}>Split cell</button>
        <button onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
          Toggle header column
        </button>
        <button onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
          Toggle header row
        </button>
        <button onClick={() => editor.chain().focus().toggleHeaderCell().run()}>
          Toggle header cell
        </button>
        <button onClick={() => editor.chain().focus().mergeOrSplit().run()}>
          Merge or split
        </button>
        <button onClick={() => editor.chain().focus().setCellAttribute('colspan', 2).run()}>
          Set cell attribute
        </button>
        <button onClick={() => editor.chain().focus().fixTables().run()}>Fix tables</button>
        <button onClick={() => editor.chain().focus().goToNextCell().run()}>
          Go to next cell
        </button>
        <button onClick={() => editor.chain().focus().goToPreviousCell().run()}>
          Go to previous cell
        </button>
        <button
          onClick={() => editor.chain().focus().setDetails().run()}
          disabled={!editor.can().setDetails()}
        >
          Set details
        </button>
        <button
          onClick={() => editor.chain().focus().unsetDetails().run()}
          disabled={!editor.can().unsetDetails()}
        >
          Unset details
        </button>
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .command(({ tr }) => {
                tr.setNodeAttribute(23, 'open', true)
                return true
              })
              .run()
          }
        >
          Force open first details
        </button>
        <button onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button onClick={() => editor.chain().focus().redo().run()}>Redo</button>
        <button onClick={addImage}>Add image from URL</button>
        <button onClick={()=> handlePrint()}>Print</button>
        <button onClick={()=> loadMDfile()}>Load</button>
        <button onClick={()=> saveMDfile()}>Save</button>
      </div>
    </div>
  )
}

export default function TiptapEditor({newContent, isTipTapOpen}) {
  // const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  const editorRef = useRef();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,     // ← CodeBlockLowlight replaces this
      }),
                   // ← has Paragraph, Text, Dropcursor, Code, History, etc.
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Image.configure({
        resize:{
          enabled: true,
          alwaysPreserveAspectRatio: true,
        },
        inline: true,
      }),
      // CodeBlockLowlight.configure({
      //   lowlight,
      //   enableTabIndentation: true,
      //   languageClassPrefix: 'language-',
        
      // }),
      CustomCodeBlock,
      // Gapcursor,
      TableKit.configure({
        table: { resizable: true },
      }),
      Details.configure({
        persist: true,
        HTMLAttributes: {
          class: 'details',
        },
      }),
      DetailsSummary,
      DetailsContent,
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node }) => {
          if (node.type.name === 'detailsSummary') {
            return 'Summary'
          }

          return null
        },
      }),
    ],    
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
  })

  useEffect(() => {
    if (newContent === null) {
      setHtmlContent('');
    } else if (typeof newContent === 'string') {
      Promise.resolve(marked.parse(newContent)).then(res => setHtmlContent(res));
    } else {
      setHtmlContent(newContent);
    }
  }, [newContent]);


  useEffect(() => {
    if (editor && isTipTapOpen && htmlContent) {
      editor
        .chain()
        .focus('end')
        .insertContent(htmlContent)
        .run();
    }
  }, [editor, htmlContent, isTipTapOpen]);//add anoter state to control this when inline highlight import happens in the future



  const handlePrint = useReactToPrint({
    contentRef: editorRef,
  });


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 , width: "100%"}} id="outerDivTipTap">
      <div >
        <MenuBar editor={editor} handlePrint={handlePrint} />
      </div>
      <Box
        sx={{
          backgroundColor: '#f9fafb',
          borderRadius: "1em",
          border: '1px solid #e0e0e0',
          overflow: "auto",
          flex: 1, // is height: 100%,
          width: "100%",
          minHeight: 0,
          '& .ProseMirror': {
            padding: '1em',
            outline: 'none',
            // boxShadow: '0',
            // height: '100%',
            minHeight: '100%',     // ← fill the available space
            // height: '1px',         // ← forces it to respect the parent's height constraint
            
          }
        }}
        
      >
        <div ref={editorRef} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <EditorContent editor={editor} style={{ flex: 1 }} />
        </div>
      </Box>
    </div>
  );
}