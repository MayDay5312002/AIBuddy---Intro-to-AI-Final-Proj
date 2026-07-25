import React, { useState } from "react";
import { Box, Typography, Link, Card, CardContent, IconButton } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { FiCopy } from "react-icons/fi";

function MarkdownRenderer({ children }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 100);
  };

  let codeBlockIndex = 0;

  return (
    <Box
      sx={{
        minWidth: 0,
        "& p": { m: 0, mb: 1 },
        "& ul, & ol": { pl: 3, mb: 1 },
        "& pre": {
          borderRadius: 1,
          // overflowX: "auto",
          mb: 1,
          "& code": {
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: "0.85rem",
            lineHeight: 1.5
          }
        },
        "& code": {
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: "0.85rem",
          background: "#f0f0f0",
          padding: "0.2em 0.3em",
          borderRadius: 0.5
        },
        fontSize: "0.9em"
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;

            if (isInline) {
              return (
                <code {...props} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85em", background: "#f0f0f0", padding: "0.2em 0.3em", borderRadius: "0.3em" }}>
                  {children}
                </code>
              );
            }

            const currentIndex = codeBlockIndex++;
            const codeText = String(children).replace(/\n$/, "");

            return (
              <Card sx={{ my: 1, bgcolor: "#1e1e1e", position: "relative", overflow: "hidden" }}>
                <CardContent sx={{ p: 1.5, pr: 6, minWidth: 0, maxWidth: "100%" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(codeText, currentIndex)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: copiedIndex === currentIndex ? "success.main" : "grey.400"
                    }}
                  >
                    <FiCopy />
                  </IconButton>
                  <pre style={{ margin: 0, overflowX: "auto", maxWidth: "100%" }}>
                    <code
                        {...props}
                        className={className}
                        style={{
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          fontSize: "0.85rem",
                          lineHeight: 1.5,
                          color: "#d4d4d4",
                          background: "transparent",
                          padding: 0,
                          whiteSpace: "pre",
                        }}
                      >
                      {children}
                    </code>
                  </pre>
                </CardContent>
              </Card>
            );
          },
          
          // pre: ({ children }) => (
          //   <div style={{ marginBottom: 8 }}>{children}</div>
          // ),

          blockquote: (props) => (
            <Typography
              variant="body1"
              sx={{
                borderLeft: 3,
                borderColor: "grey.300",
                pl: 2,
                my: 1.5,
                fontStyle: "italic",
                color: "text.secondary"
              }}
              {...props}
            />
          ),
          h1: ({ children }) => (
            <h3>
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 >
              {children}
            </h3>
          ),
          table: ({children}) => (
            <Box style={{ overflowX: "auto" }}>
              <table>{children}</table>
            </Box>
          ),
            
          p: ({ children }) => <div>{children}</div>
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
}

export default MarkdownRenderer;