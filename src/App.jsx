import React, { useRef, useEffect, useState } from 'react';

// Main App component to render the game board
function App() {
  return (
    <div style={{ textAlign: 'center' }}>
      <GameBoard />
    </div>
  );
}

// Function to draw 'X' on the canvas
function drawX(ctx, row, col, lineSpacing) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  const x = col * lineSpacing;
  const y = row * lineSpacing;
  const padding = lineSpacing / 5;
  ctx.beginPath();
  ctx.moveTo(x + padding, y + padding);
  ctx.lineTo(x + lineSpacing - padding, y + lineSpacing - padding);
  ctx.moveTo(x + lineSpacing - padding, y + padding);
  ctx.lineTo(x + padding, y + lineSpacing - padding);
  ctx.stroke();
}

// Function to draw 'O' on the canvas
function drawO(ctx, row, col, lineSpacing) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  const x = col * lineSpacing;
  const y = row * lineSpacing;
  const padding = lineSpacing / 5;
  const radius = lineSpacing / 2 - padding; 
  ctx.beginPath();
  ctx.moveTo(x + padding, y + padding);
  ctx.lineTo(x + lineSpacing - padding, y + padding);
  ctx.moveTo(x + lineSpacing - padding, y + padding);
  ctx.lineTo(x + lineSpacing - padding, y + lineSpacing - padding);
  ctx.moveTo(x + lineSpacing - padding, y + lineSpacing - padding);
  ctx.lineTo(x + padding, y + lineSpacing - padding);
  ctx.moveTo(x + padding, y + lineSpacing - padding);
  ctx.lineTo(x + padding, y + padding);
  ctx.stroke();
}

// Function to check for a winner
function calculateWinner(board, gridSize) {
  // Check rows
  for (let i = 0; i < gridSize; i++) {
    if (board[i][0] && board[i].every(cell => cell === board[i][0])) {
      return board[i][0];
    }
  }

  // Check columns
  for (let i = 0; i < gridSize; i++) {
    if (board[0][i]) {
      let isWin = true;
      for (let j = 1; j < gridSize; j++) {
        if (board[j][i] !== board[0][i]) {
          isWin = false;
          break;
        }
      }
      if (isWin) {
        return board[0][i];
      }
    }
  }

  // Check diagonal (top-left to bottom-right)
  if (board[0][0]) {
    let isWin = true;
    for (let i = 1; i < gridSize; i++) {
      if (board[i][i] !== board[0][0]) {
        isWin = false;
        break;
      }
    }
    if (isWin) {
      return board[0][0];
    }
  }

  // Check diagonal (top-right to bottom-left)
  if (board[0][gridSize - 1]) {
    let isWin = true;
    for (let i = 1; i < gridSize; i++) {
      if (board[i][gridSize - 1 - i] !== board[0][gridSize - 1]) {
        isWin = false;
        break;
      }
    }
    if (isWin) {
      return board[0][gridSize - 1];
    }
  }

  return null;
}

// The main game board component
function GameBoard() {
  const canvasRef = useRef(null);
  const [gridSize, setGridSize] = useState(3);
  const [canvasSize, setCanvasSize] = useState(gridSize * 100);
  const fileInputRef = useRef(null);
  const [turn, setTurn] = useState(1);
  const [board, setBoard] = useState(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(null))
  );
  const [winner, setWinner] = useState(null);

  // Helper to determine game status for JSON saving
  const getJsonStatus = (winner, turn, gridSize) => {
    if (winner) {
      return `${winner}_wins`;
    } else if (turn > gridSize * gridSize) {
      return "draw";
    } else {
      return `in_progress`;
    }
  }

  // Function to prepare game state for saving to a JSON file
  const saveGame = () => {
    const gameState = {
      board: board,
      turn: (winner) ? null : (turn % 2 === 1 ? 'X' : 'O'),
      status: getJsonStatus(winner, turn, gridSize)
    };
    const jsonString = JSON.stringify(gameState, null, 2); // Use null, 2 for formatted JSON

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `tictactoe_game_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        if (cell === 'X') {
          drawX(ctx, rowIndex, colIndex, lineSpacing);
        } else if (cell === 'O') {
          drawO(ctx, rowIndex, colIndex, lineSpacing);
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

  // Handler for the "Load Game" button click
  const handleLoadButtonClick = () => {
    // This will programmatically click the hidden file input
    fileInputRef.current.click();
  };

  // Handler for when a file is selected
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      // This event fires when the file has been successfully read
      reader.onload = (e) => {
        const fileContent = e.target.result;
        try {
          // Parse the JSON string into a JavaScript object
          const loadedGameState = JSON.parse(fileContent);

          // We check if the loaded board has valid dimensions
          if (!loadedGameState.board || loadedGameState.board.length !== loadedGameState.board[0].length) {
            alert("Invalid board dimensions in the file.");
            return;
          }

          // A good practice is to normalize the loaded board state.
          // In case the JSON file uses "" instead of null for empty cells.
          const normalizedBoard = loadedGameState.board.map(row => 
            row.map(cell => cell === "" ? null : cell)
          );

          // Update all the state variables
          setGridSize(normalizedBoard.length);
          setBoard(normalizedBoard);
          setTurn(loadedGameState.turn === 'X' ? 1 : 2);

          // Recalculate the winner based on the new board
          const newWinner = calculateWinner(normalizedBoard, normalizedBoard.length);
          if (newWinner) {
            setWinner(newWinner);
          } else {
            setWinner(null);
          }
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          // In a real app, you would use a custom modal instead of alert
          alert("Invalid game file. Please select a valid JSON file.");
        }
      };

      // Start reading the file as text
      reader.readAsText(file);
    }
  };

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

    const currentPlayerSymbol = turn % 2 === 1 ? 'X' : 'O';
    const newBoard = board.map(arr => [...arr]);
    newBoard[row][col] = currentPlayerSymbol;
    setBoard(newBoard);

    const newWinner = calculateWinner(newBoard, gridSize);
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
    status = `Turn ${turn}: Player ${turn % 2 === 1 ? 'X' : 'O'}`;
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
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleLoadButtonClick} style={{ marginRight: '5px' }}>
          Load Game
        </button>
        <button onClick={saveGame}>
          Save Game
        </button>
        <input
          type="file"
          id="file-input"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </>
  );
}

export default App;