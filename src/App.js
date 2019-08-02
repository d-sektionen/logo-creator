import React, { useState, useEffect } from "react";
import "./App.css";

const dColors = {
  blue: "#20407C",
  yellow: "#F7E623",
  cerise: "#E5398D",
  brown: "#754022",
  green: "#70BD44"
};

const randomColor = () => {
  const colorKeys = Object.keys(dColors);
  const randomNumber = Math.floor(Math.random() * colorKeys.length);
  const key = colorKeys[randomNumber];
  return dColors[key];
};

function App() {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [pngWidth, setPngWidth] = useState(width * 50);
  const [pngHeight, setPngHeight] = useState(height * 50);
  const [grid, setGrid] = useState([
    ...Array(height).fill([...Array(width)].fill(null))
  ]);
  const [svg, setSvg] = useState(null);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    if (!ctx) return;
    var img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, pngWidth, pngHeight);
      ctx.drawImage(img, 0, 0, pngWidth, pngHeight);
    };
    img.src = svg;
  }, [svg, pngHeight, pngWidth, ctx]);

  const getCellColor = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return grid[y][x];
  };
  const assignCellColor = (x, y, empty = false) => {
    // ugly deep copy solution but it works lol.
    const gridCopy = JSON.parse(JSON.stringify(grid));

    let rc = randomColor();
    while (
      [
        getCellColor(x, y - 1),
        getCellColor(x, y + 1),
        getCellColor(x - 1, y),
        getCellColor(x + 1, y)
      ].includes(rc)
    ) {
      rc = randomColor();
    }

    if (empty) rc = null;

    gridCopy[y][x] = rc;
    setGrid(gridCopy);
  };

  const Logo = ({ placeholders, setSvg }) => (
    <svg
      ref={elem => {
        if (setSvg && elem) {
          setSvg(
            "data:image/svg+xml," +
              encodeURIComponent(new XMLSerializer().serializeToString(elem))
          );
        }
      }}
      viewBox={`0 0 ${width * 10 + width - 1} ${height * 10 + height - 1}`}
      xmlns="http://www.w3.org/2000/svg"
      className={placeholders && "with-placeholders"}
    >
      {grid.map((column, y) =>
        column.map((cell, x) =>
          placeholders || getCellColor(x, y) ? (
            <rect
              key={`x${x}y${y}`}
              x={x + x * 10}
              y={y + y * 10}
              onClick={e => placeholders && assignCellColor(x, y, e.shiftKey)}
              width="10"
              height="10"
              fill={cell ? cell : "#f8f8f8"}
            />
          ) : (
            <></>
          )
        )
      )}
    </svg>
  );

  return (
    <div className="app">
      <div className="editor">
        <div>
          <h2>Editor</h2>
          <p>Hold shift to remove square.</p>
        </div>
        <div>
          <Logo placeholders />
        </div>
      </div>
      <div className="svg-preview">
        <div>
          <h2>SVG-preview</h2>
          {svg && (
            <p>
              <a href={svg} download="logo.svg">
                Download
              </a>
            </p>
          )}
        </div>
        <div>
          <Logo setSvg={setSvg} />
        </div>
      </div>
      <div className="png-preview">
        <div>
          <h2>PNG-preview</h2>
          <p>Right click to download.</p>
        </div>
        <div>
          <canvas
            ref={elem => elem && setCtx(elem.getContext("2d"))}
            width={pngWidth}
            height={pngHeight}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
