import React, { useRef, useEffect, useState } from 'react';

// Main App component to render the game board
function App() {
  return (
    <div style={{ textAlign: 'center' }}>
      <GameBoard />
    </div>
  );
}

// Function to draw '1' on the canvas
function draw1(ctx, row, col, lineSpacing) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  const x = col * lineSpacing;
  const y = row * lineSpacing;
  const padding = lineSpacing / 5;
  ctx.beginPath();
  ctx.moveTo(x + padding*2.5, y + padding);
  ctx.lineTo(x + padding*2.5, y + lineSpacing - padding);
  ctx.stroke();
}

// Function to draw '2' on the canvas
function draw2(ctx, row, col, lineSpacing) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  const x = col * lineSpacing;
  const y = row * lineSpacing;
  const padding = lineSpacing / 5;
  const radius = lineSpacing / 2 - padding; 
  ctx.beginPath();
  ctx.moveTo(x + padding*2, y + padding);
  ctx.lineTo(x + padding*2, y + lineSpacing - padding);
  ctx.moveTo(x + padding*3, y + padding);
  ctx.lineTo(x + padding*3, y + lineSpacing - padding);
  ctx.stroke();
}
// Function to draw '3' on the canvas
function draw3(ctx, row, col, lineSpacing) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  const x = col * lineSpacing;
  const y = row * lineSpacing;
  const padding = lineSpacing / 5;
  const radius = lineSpacing / 2 - padding; 
  ctx.beginPath();
  ctx.moveTo(x + padding*2, y + padding);
  ctx.lineTo(x + padding*2, y + lineSpacing - padding);
  ctx.moveTo(x + padding*3, y + padding);
  ctx.lineTo(x + padding*3, y + lineSpacing - padding);
  ctx.moveTo(x + padding*4, y + padding);
  ctx.lineTo(x + padding*4, y + lineSpacing - padding);
  ctx.moveTo(x + padding*4, y + padding);
  ctx.lineTo(x + padding*4, y + lineSpacing - padding);
  ctx.stroke();
}

// Function to check for a winner
function checkValid(board, gridSize) {
  // Check rows
  for (let i = 0; i < gridSize; i++) {
    if (board[i][0] && board[i].every(cell => cell === board[i][0])) {
      return None;
    }
  }

  // Check columns
  for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (board[j][0] && board[j].every(cell => cell == board[j][0])) {
          return None;
        }
      }
  }


  return null;
}

// The main game board component
function GameBoard() {
  const canvasRef = useRef(null);
  const [gridSize, setGridSize] = useState(5);
  const [canvasSize, setCanvasSize] = useState(gridSize * 100);
  const [turn, setTurn] = useState(1);
  const [board, setBoard] = useState(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(null))
  );
  const [winner, setWinner] = useState(null);


  // Effect to handle canvas drawing whenever the board state or grid size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const lineSpacing = canvas.width / gridSize;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    for (let i = 1; i < gridSize; i++) {
      ctx.moveTo(lineSpacing * i, 0);
      ctx.lineTo(lineSpacing * i, canvas.height);
      ctx.moveTo(0, lineSpacing * i);
      ctx.lineTo(canvas.width, lineSpacing * i);
    }
    ctx.stroke();

    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === '1') {
          draw1(ctx, rowIndex, colIndex, lineSpacing);
        } else if (cell === '2') {
          draw2(ctx, rowIndex, colIndex, lineSpacing);
        } else if (cell === '3'){
          draw3(ctx, rowIndex , colIndex, lineSpacing);
        }
      });
    });
  }, [board, gridSize]);

  // Effect to reset the game when grid size changes
  useEffect(() => {
    setCanvasSize(gridSize * 100);
    setTurn(1);
    setBoard(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));
    setWinner(null);
  }, [gridSize]);



  // Handler for a canvas click
  const handleCanvasClick = (event) => {
    if (winner || turn > gridSize * gridSize) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const lineSpacing = canvas.width / gridSize;
    const col = Math.floor(x / lineSpacing);
    const row = Math.floor(y / lineSpacing);

    if (board[row][col]) return;

    let currentPlayerSymbol; 
      if (turn%3 == 0 ){
      currentPlayerSymbol = '3';
    } else if (turn%3 == 2){
      currentPlayerSymbol = '2';
    } else {
      currentPlayerSymbol = '1';
    }
    const newBoard = board.map(arr => [...arr]);
    newBoard[row][col] = currentPlayerSymbol;
    setBoard(newBoard);

    const newWinner = checkValid(newBoard, gridSize);
    if (newWinner) {
      setWinner(newWinner);
    }

    setTurn(turn + 1);
  };

  // Handler for the reset button
  const handleReset = () => {
    setTurn(1);
    setBoard(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));
    setWinner(null);
  };

  // Determine the status message to display
  let status;
  if (winner) {
    status = `Winner: Player ${winner}`;
  } else if (turn > gridSize * gridSize) {
    status = "It's a Draw!";
  } else {
    status = `Turn ${turn}: Player ${turn % 3 === 1 ? '1' : '2'}`;
  }

  // JSX to render the game UI
  return (
    <>
      <h1>Tic Tac Toe</h1>
      <div style={{ margin: '10px 0' }}>
        <button onClick={() => setGridSize(3)} style={{ marginRight: '5px' }}>3x3</button>
        <button onClick={() => setGridSize(4)} style={{ marginRight: '5px' }}>4x4</button>
        <button onClick={() => setGridSize(5)}>5x5</button>
      </div>
      <h2>{status}</h2>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{ border: '1px solid black' }}
        onClick={handleCanvasClick}
      ></canvas>
      <div>
        <button id="reset-btn" onClick={handleReset} style={{ marginTop: '10px' }}>
          Reset
        </button>
      </div>
    </>
  );
}

export default App;