// extensions.js
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CodeBlockComponent from './sub-sub-component/CodeBlockComponent'
import { all, createLowlight } from 'lowlight';

const lowlight = createLowlight(all);



export const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent)
  },
}).configure({ 
    lowlight, 
    enableTabIndentation: true,
    languageClassPrefix: 'language-',
})