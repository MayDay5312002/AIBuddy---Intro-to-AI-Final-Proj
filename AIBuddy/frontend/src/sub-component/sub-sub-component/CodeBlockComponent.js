import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

export default ({ node, updateAttributes, extension }) => {
  const languages = extension.options.lowlight.listLanguages()

  return (
    <NodeViewWrapper className="code-block">
      <div className="select-wrapper">
        <select
          className="code-block__language-select"
          contentEditable={false}
          value={node.attrs.language || 'null'}
          onChange={(event) => {
            const value = event.target.value
            updateAttributes({ language: value === 'null' ? null : value })
          }}
        >
          <option value="null">auto</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}