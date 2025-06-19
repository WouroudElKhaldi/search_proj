import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    removeHighlight();
    if (searchKeyword.trim() === "") return;
    const regex = new RegExp(
      `(${searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );

    addHighlight(contentRef.current, regex);
  }, [searchKeyword]);

  const addHighlight = (node: HTMLElement, regex: RegExp) => {
    const docWalker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null
    );
    const textNodes: Text[] = [];
    while (docWalker.nextNode()) {
      const currentNode = docWalker.currentNode as Text;
      if (currentNode.textContent && currentNode.textContent.trim() !== "") {
        textNodes.push(currentNode);
      }
    }

    textNodes.forEach((textNode) => {
      const { textContent } = textNode;
      if (!textContent) return;

      const newRegex = new RegExp(regex.source, regex.flags);
      if (newRegex.test(textContent)) {
        const parent = textNode.parentNode;
        if (!parent) return;

        const newContent = textContent.replace(
          newRegex,
          '<mark class="highlight">$1</mark>'
        );

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = newContent;

        parent.replaceChild(tempDiv, textNode);

        while (tempDiv.firstChild) {
          parent.insertBefore(tempDiv.firstChild, tempDiv);
        }
        parent.removeChild(tempDiv);
      }
    });
  };

  const removeHighlight = () => {
    if (!contentRef.current) return;
    const highlights = contentRef.current.querySelectorAll("mark.highlight");
    highlights.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(mark.textContent || ""),
          mark
        );
        parent.normalize();
      }
    });
  };

  return (
    <div
      className="App"
      style={{
        padding: "20px",
        width: "80%",
        display: "flex",
        flexDirection: "column",
        margin: "auto",
      }}
    >
      <h1>Text Highlighting Example</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{ padding: "10px", fontSize: "16px", marginBottom: "20px" }}
      />
      <div ref={contentRef} className="content">
        <p style={{ fontSize: "18px", lineHeight: "1.6" }}>
          This is a sample text to demonstrate the highlighting feature. You can
          type in the search box above to highlight matching words in this text.
          Try searching for "highlight", "text", or any other word to see how it
          works.
        </p>
      </div>
    </div>
  );
}

export default App;
