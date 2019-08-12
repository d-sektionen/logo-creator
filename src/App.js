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

const createGrid = (height, width, oldGrid = null) => {
  let grid = [...Array(height).fill([...Array(width)].fill(null))];

  // Rows need to be remade as all rows are a refrence to the same array
  // with the array.fill method.
  grid = grid.map(row => [...row]);
  if (oldGrid) {
    grid.forEach((row, y) => {
      if (y < oldGrid.length)
        row.forEach((cell, x) => {
          if (x < oldGrid[y].length && oldGrid[y][x] !== null)
            grid[y][x] = oldGrid[y][x];
        });
    });
  }

  return grid;
};

function App() {
  const [width, setWidth] = useState(12);
  const [height, setHeight] = useState(12);
  const [pngScale, setPngScale] = useState(5);
  const [pngWidth, setPngWidth] = useState(width * 50);
  const [pngHeight, setPngHeight] = useState(height * 50);
  const [grid, setGrid] = useState(createGrid(width, height));
  const [svg, setSvg] = useState(null);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    setPngHeight((height * 10 + height - 1) * pngScale);
    setPngWidth((width * 10 + width - 1) * pngScale);
  }, [width, height, pngScale]);

  useEffect(() => {
    if (!ctx) return;
    var img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, pngWidth, pngHeight);
      ctx.imageSmoothingEnabled = false;
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
          <label>
            Width: ({width})
            <input
              type="range"
              min={1}
              max={100}
              onChange={e => {
                const value = Number(e.target.value);
                setGrid(createGrid(height, value, grid));
                setWidth(value);
              }}
              value={width}
            />
          </label>
          <label>
            Height: ({height})
            <input
              type="range"
              min={1}
              max={100}
              onChange={e => {
                const value = Number(e.target.value);
                setGrid(createGrid(value, width, grid));
                setHeight(value);
              }}
              value={height}
            />
          </label>
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
          <label>
            PNG scale: ({pngScale}, current size is {pngWidth}x{pngHeight})
            <input
              type="range"
              min={1}
              max={20}
              onChange={e => setPngScale(Number(e.target.value))}
              value={pngScale}
            />
          </label>
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
