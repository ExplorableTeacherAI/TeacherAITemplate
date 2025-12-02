import { useState } from "react";
import { LessonView } from "@/components/LessonView";

const Index = () => {
  const [content] = useState(`flowchart TD
  A[Christmas] -->|Get money| B(Go shopping)
  B --> C{Let me think}
  C -->|One| D[Laptop]
  C -->|Two| E[iPhone]
  C -->|Three| F[Car]`);




  const _handlePreview = () => {
    // Open preview in new tab or modal
    const previewWindow = window.open('', '_blank');
    if (previewWindow && content) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Preview - Explorable Explanation AI</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
            </style>
            <script>
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\\(', '\\\)']],
                  displayMath: [['$$', '$$'], ['\\\[', '\\\]']],
                  processEscapes: true,
                },
                startup: { typeset: true }
              };
            </script>
            <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  const _handleSave = () => {
    // Save to localStorage for now
    localStorage.setItem('webcanvas-project', JSON.stringify({
      content,
      timestamp: new Date().toISOString()
    }));
  };

  const _handleShare = () => {
    // Copy share URL to clipboard
    const shareData = btoa(JSON.stringify({ content }));
    const shareUrl = `${window.location.origin}?shared=${shareData}`;
    navigator.clipboard.writeText(shareUrl);
  };

  const _handleExport = () => {
    // Export as HTML file
    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Explorable Explanation AI</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
    </style>
    <script>
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\\(', '\\\)']],
          displayMath: [['$$', '$$'], ['\\\[', '\\\]']],
          processEscapes: true,
        },
        startup: { typeset: true }
      };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
  </head>
  <body>
    ${content}
  </body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webcanvas-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  return (
    <div className="h-screen">
      <LessonView content={content} />
    </div>
  );
};

export default Index;
