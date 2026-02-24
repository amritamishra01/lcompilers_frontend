import React, { useRef, useEffect } from "react";
import AceEditor from "react-ace";

// Import Ace modes and themes
import "ace-builds/src-noconflict/mode-fortran";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

const Editor = ({ sourceCode, setSourceCode, editorRef }) => {
    const aceEditorRef = useRef(null);

    // This useEffect manually attaches the jump function to the ref
    // This bypasses the {retry: f} issue caused by Next.js dynamic imports
    // Add this inside the Editor component function
    useEffect(() => {
        if (editorRef) {
            // This forcefully overwrites the {retry: f} object
            editorRef.current = {
                jumpToLine(line) {
                    if (aceEditorRef.current) {
                        const editor = aceEditorRef.current.editor;
                        
                        // 1. Move cursor and scroll (Ace is 1-based)
                        editor.gotoLine(line, 0, true);

                        // 2. Visually highlight by selecting the line
                        editor.selection.moveCursorTo(line - 1, 0); 
                        editor.selection.selectLine();

                        // 3. Focus the editor to show the highlight clearly
                        editor.focus();
                    }
                }
            };
        }
    }, [editorRef]);

    return (
        <AceEditor
            ref={aceEditorRef}
            mode="fortran"
            theme="monokai"
            onChange={(code) => setSourceCode(code)}
            name="LFORTRAN_EDITOR"
            editorProps={{ $blockScrolling: true }}
            value={sourceCode}
            width="100%"
            height="100%"
            showPrintMargin={false}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 4,
            }}
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
            }}
        />
    );
};


export default Editor;