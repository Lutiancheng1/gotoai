import React, { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { langs } from '@uiw/codemirror-extensions-langs'
const CodeMirrorIndex = () => {
  const [value, setValue] = useState("console.log('hello world!');")

  return (
    <CodeMirror
      value={value}
      basicSetup={{
        tabSize: 4,
        foldGutter: true,
        highlightActiveLineGutter: true,
        highlightSpecialChars: true,
        lineNumbers: true,
        dropCursor: true,
        history: true,
        drawSelection: true,
        allowMultipleSelections: true,
        syntaxHighlighting: true,
        bracketMatching: true,
        autocompletion: true,
        closeBrackets: true,
        rectangularSelection: true,
        defaultKeymap: true,
        foldKeymap: true,
        completionKeymap: true,
        lintKeymap: true,
        historyKeymap: true
      }}
      onChange={setValue}
      extensions={[langs.markdown()]}
    />
  )
}
export default CodeMirrorIndex
