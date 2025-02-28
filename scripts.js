// Main script for Monopoly Deal
console.log('Scripts.js loading...');

// Ensure MonopolyDeal namespace exists
window.MonopolyDeal = window.MonopolyDeal || {};

// Keep track of current perspective (which player's view we're looking at)
window.MonopolyDeal.currentPerspective = 1;

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded. Initializing game...');
  
  // Set up all game elements and event listeners
  window.MonopolyDeal.setupGame();
  
  // Add keyboard shortcuts for perspective switching
  window.MonopolyDeal.setupKeyboardShortcuts();
});

// Add keyboard shortcuts for perspective switching
window.MonopolyDeal.setupKeyboardShortcuts = function() {
  console.log('Setting up keyboard shortcuts for perspective switching');
  
  document.addEventListener('keydown', function(event) {
    // Only process if game has started
    if (!window.MonopolyDeal.gameState.gameStarted) {
      console.log('Game has not started yet, keyboard shortcuts disabled');
      return;
    }
    
    // If payment is pending, only allow switching to the paying player's perspective
    if (window.MonopolyDeal.gameState.paymentPending) {
      const payingPlayer = window.MonopolyDeal.gameState.paymentRequest?.fromPlayer;
      
      // Allow switching to paying player's perspective
      if (event.key === String(payingPlayer) && window.MonopolyDeal.currentPerspective !== payingPlayer) {
        console.log(`Key "${payingPlayer}" pressed - switching to paying player's perspective`);
        window.MonopolyDeal.currentPerspective = payingPlayer;
        window.MonopolyDeal.updateAllPlayerUIs();
        window.MonopolyDeal.updateGameStatus(`Switched to Player ${payingPlayer}'s perspective to make payment`);
        return;
      }
      
      console.log('Payment is pending, perspective switching limited');
      return;
    }
    
    // Check which key was pressed
    switch (event.key) {
      case '1':
        // Switch to Player 1's perspective
        console.log('Key "1" pressed - attempting to switch to Player 1 perspective');
        if (window.MonopolyDeal.currentPerspective !== 1) {
          window.MonopolyDeal.currentPerspective = 1;
          
          // Update UI elements
          window.MonopolyDeal.updateAllPlayerUIs();
          
          // Remove any existing indicators
          document.querySelectorAll('.perspective-indicator').forEach(el => el.remove());
          
          // Add perspective indicator
          const indicatorP1 = document.createElement('div');
          indicatorP1.className = 'perspective-indicator';
          indicatorP1.textContent = 'PLAYER 1 VIEW';
          indicatorP1.style.position = 'fixed';
          indicatorP1.style.top = '10px';
          indicatorP1.style.left = '50%';
          indicatorP1.style.transform = 'translateX(-50%)';
          indicatorP1.style.backgroundColor = 'rgba(0, 128, 0, 0.7)'; // Green for P1
          indicatorP1.style.color = 'white';
          indicatorP1.style.padding = '5px 15px';
          indicatorP1.style.borderRadius = '15px';
          indicatorP1.style.fontWeight = 'bold';
          indicatorP1.style.fontSize = '16px';
          indicatorP1.style.zIndex = '1000';
          document.body.appendChild(indicatorP1);
          
          // Update player area titles
          const playerAreaTitle = document.querySelector('.player-area h2');
          const opponentAreaTitle = document.querySelector('.opponent-area h2');
          if (playerAreaTitle && opponentAreaTitle) {
            playerAreaTitle.textContent = "Player 1's Hand";
            opponentAreaTitle.textContent = "Player 2's Hand";
          }
          
          // Update button text
          const switchButton = window.MonopolyDeal.elements.switchPerspectiveButton;
          if (switchButton) {
            switchButton.textContent = 'Switch to Player 2';
          }
          
          window.MonopolyDeal.updateGameStatus(`Switched to Player 1's perspective`);
          window.MonopolyDeal.addToHistory(`Switched to Player 1's perspective via keyboard shortcut`);
          console.log('Successfully switched to Player 1 perspective via keyboard shortcut');
        } else {
          console.log('Already in Player 1 perspective');
        }
        break;
        
      case '2':
        // Switch to Player 2's perspective
        console.log('Key "2" pressed - attempting to switch to Player 2 perspective');
        if (window.MonopolyDeal.currentPerspective !== 2) {
          window.MonopolyDeal.currentPerspective = 2;
          
          // Update UI elements
          window.MonopolyDeal.updateAllPlayerUIs();
          
          // Remove any existing indicators
          document.querySelectorAll('.perspective-indicator').forEach(el => el.remove());
          
          // Add perspective indicator
          const indicatorP2 = document.createElement('div');
          indicatorP2.className = 'perspective-indicator';
          indicatorP2.textContent = 'PLAYER 2 VIEW';
          indicatorP2.style.position = 'fixed';
          indicatorP2.style.top = '10px';
          indicatorP2.style.left = '50%';
          indicatorP2.style.transform = 'translateX(-50%)';
          indicatorP2.style.backgroundColor = 'rgba(0, 0, 128, 0.7)'; // Blue for P2
          indicatorP2.style.color = 'white';
          indicatorP2.style.padding = '5px 15px';
          indicatorP2.style.borderRadius = '15px';
          indicatorP2.style.fontWeight = 'bold';
          indicatorP2.style.fontSize = '16px';
          indicatorP2.style.zIndex = '1000';
          document.body.appendChild(indicatorP2);
          
          // Update player area titles
          const playerAreaTitle = document.querySelector('.player-area h2');
          const opponentAreaTitle = document.querySelector('.opponent-area h2');
          if (playerAreaTitle && opponentAreaTitle) {
            playerAreaTitle.textContent = "Player 2's Hand";
            opponentAreaTitle.textContent = "Player 1's Hand";
          }
          
          // Update button text
          const switchButton = window.MonopolyDeal.elements.switchPerspectiveButton;
          if (switchButton) {
            switchButton.textContent = 'Switch to Spectator';
          }
          
          window.MonopolyDeal.updateGameStatus(`Switched to Player 2's perspective`);
          window.MonopolyDeal.addToHistory(`Switched to Player 2's perspective via keyboard shortcut`);
          console.log('Successfully switched to Player 2 perspective via keyboard shortcut');
        } else {
          console.log('Already in Player 2 perspective');
        }
        break;
        
      case '3':
        // Switch to Spectator perspective (can't see cards or interact)
        console.log('Key "3" pressed - attempting to switch to Spectator perspective');
        if (window.MonopolyDeal.currentPerspective !== 3) {
          window.MonopolyDeal.currentPerspective = 3;
          
          // Update UI elements
          window.MonopolyDeal.updateAllPlayerUIs();
          
          // Add spectator indicator
          window.MonopolyDeal.addSpectatorIndicator();
          
          // Update player area titles
          const playerAreaTitle = document.querySelector('.player-area h2');
          const opponentAreaTitle = document.querySelector('.opponent-area h2');
          if (playerAreaTitle && opponentAreaTitle) {
            playerAreaTitle.textContent = "Player 1's Hand";
            opponentAreaTitle.textContent = "Player 2's Hand";
          }
          
          // Update button text
          const switchButton = window.MonopolyDeal.elements.switchPerspectiveButton;
          if (switchButton) {
            switchButton.textContent = 'Switch to Player 1';
          }
          
          window.MonopolyDeal.updateGameStatus(`Switched to Spectator mode - no interactions allowed`);
          window.MonopolyDeal.addToHistory(`Switched to Spectator mode via keyboard shortcut`);
          console.log('Successfully switched to Spectator perspective via keyboard shortcut');
        } else {
          console.log('Already in Spectator perspective');
        }
        break;
        
      default:
        console.log(`Key "${event.key}" pressed - not a perspective shortcut`);
        break;
    }
  });
  
  console.log('Keyboard shortcuts setup complete');
};

// Helper function to update all player UIs
window.MonopolyDeal.updateAllPlayerUIs = function() {
  // Update UI for both players
  window.MonopolyDeal.updatePlayerHandUI(1);
  window.MonopolyDeal.updatePlayerHandUI(2);
  window.MonopolyDeal.updatePlayerMoneyUI(1);
  window.MonopolyDeal.updatePlayerMoneyUI(2);
  window.MonopolyDeal.updatePlayerPropertiesUI(1);
  window.MonopolyDeal.updatePlayerPropertiesUI(2);
  
  // Handle spectator mode
  if (window.MonopolyDeal.currentPerspective === 3) {
    window.MonopolyDeal.disableGameControls();
  } else {
    window.MonopolyDeal.enableGameControls();
  }
};

// Add spectator indicator
window.MonopolyDeal.addSpectatorIndicator = function() {
  // Remove existing indicator if any
  window.MonopolyDeal.removeSpectatorIndicator();
  
  // Create new indicator
  const indicator = document.createElement('div');
  indicator.id = 'spectator-indicator';
  indicator.textContent = 'SPECTATOR MODE';
  indicator.style.position = 'fixed';
  indicator.style.top = '10px';
  indicator.style.left = '50%';
  indicator.style.transform = 'translateX(-50%)';
  indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  indicator.style.color = 'white';
  indicator.style.padding = '5px 15px';
  indicator.style.borderRadius = '15px';
  indicator.style.fontWeight = 'bold';
  indicator.style.fontSize = '16px';
  indicator.style.zIndex = '1000';
  
  document.body.appendChild(indicator);
};

// Remove spectator indicator
window.MonopolyDeal.removeSpectatorIndicator = function() {
  const existingIndicator = document.getElementById('spectator-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }
};

// Disable game controls for spectator mode
window.MonopolyDeal.disableGameControls = function() {
  console.log('Disabling game controls for spectator mode');
  
  // Disable draw pile
  const drawPile = document.getElementById('draw-pile');
  if (drawPile) {
    drawPile.style.cursor = 'not-allowed';
    drawPile.style.opacity = '0.7';
  }
  
  // Disable draw cards button
  if (window.MonopolyDeal.elements.drawButton) {
    window.MonopolyDeal.elements.drawButton.disabled = true;
  }
  
  // Disable end turn button
  if (window.MonopolyDeal.elements.endTurnButton) {
    window.MonopolyDeal.elements.endTurnButton.disabled = true;
  }
  
  // Disable any clickable cards
  document.querySelectorAll('.card').forEach(card => {
    card.style.cursor = 'not-allowed';
  });
};

// Re-enable game controls
window.MonopolyDeal.enableGameControls = function() {
  console.log('Re-enabling game controls');
  
  // Re-enable draw pile
  const drawPile = document.getElementById('draw-pile');
  if (drawPile) {
    drawPile.style.cursor = 'pointer';
    drawPile.style.opacity = '1';
  }
  
  // Update button states
  window.MonopolyDeal.updateButtonStates();
  
  // Remove spectator indicator
  window.MonopolyDeal.removeSpectatorIndicator();
};

// Update button states based on game state
window.MonopolyDeal.updateButtonStates = function() {
  const gameState = window.MonopolyDeal.gameState;
  
  // If payment is pending, disable all buttons except for the switch perspective
  if (gameState.paymentPending) {
    // If we're the paying player, buttons are determined by payment handler
    // For all other perspectives, disable action buttons
    if (gameState.paymentRequest && window.MonopolyDeal.currentPerspective !== gameState.paymentRequest.fromPlayer) {
      if (window.MonopolyDeal.elements.drawButton) {
        window.MonopolyDeal.elements.drawButton.disabled = true;
      }
      if (window.MonopolyDeal.elements.endTurnButton) {
        window.MonopolyDeal.elements.endTurnButton.disabled = true;
      }
      return;
    }
  }
  
  // Draw cards button
  if (window.MonopolyDeal.elements.drawButton) {
    window.MonopolyDeal.elements.drawButton.disabled = !(
      gameState.gameStarted && 
      gameState.currentPlayer === window.MonopolyDeal.currentPerspective && 
      !gameState.hasDrawnCards &&
      !gameState.paymentPending
    );
  }
  
  // End turn button
  if (window.MonopolyDeal.elements.endTurnButton) {
    window.MonopolyDeal.elements.endTurnButton.disabled = !(
      gameState.gameStarted && 
      gameState.currentPlayer === window.MonopolyDeal.currentPerspective && 
      gameState.hasDrawnCards &&
      !gameState.paymentPending
    );
  }
};

// Set up the game board and all event listeners
window.MonopolyDeal.setupGame = function() {
  console.log('Setting up game...');
  try {
    // Set up UI elements
    if (!window.MonopolyDeal.setupElements()) {
      console.error('Failed to set up UI elements');
      return;
    }
    
    // Add event listeners to game controls
    window.MonopolyDeal.setupEventListeners();
    
    // Display initial game status
    window.MonopolyDeal.updateGameStatus('Welcome to Monopoly Deal! Click "Start New Game" to begin.');
    
    console.log('Game setup complete. Ready to play!');
  } catch (error) {
    console.error('Error setting up game:', error);
    alert('Error setting up game: ' + error.message);
  }
};

// Set up event listeners for game controls
window.MonopolyDeal.setupEventListeners = function() {
  console.log('Setting up event listeners...');
  
  // Direct button event listeners
  window.MonopolyDeal.setupDirectEventListeners();
  
  // Draw pile event listener
  if (window.MonopolyDeal.elements.drawPile) {
    window.MonopolyDeal.elements.drawPile.addEventListener('click', function() {
      console.log('Draw pile clicked');
      
      // Only allow draw if current perspective matches current player and not in spectator mode
      if (window.MonopolyDeal.currentPerspective === window.MonopolyDeal.gameState.currentPlayer &&
          window.MonopolyDeal.currentPerspective !== 3) {
        window.MonopolyDeal.drawCardsForTurn();
      } else if (window.MonopolyDeal.currentPerspective === 3) {
        window.MonopolyDeal.updateGameStatus('Spectator mode: Cannot interact with the game');
      } else {
        window.MonopolyDeal.updateGameStatus(`It's Player ${window.MonopolyDeal.gameState.currentPlayer}'s turn to draw cards`);
      }
    });
  } else {
    console.error('Draw pile element not found');
  }
  
  console.log('Event listeners setup complete');
};

// Set up direct event listeners for buttons
window.MonopolyDeal.setupDirectEventListeners = function() {
  console.log('Setting up direct event listeners for buttons...');
  
  // Start game button
  if (window.MonopolyDeal.elements.startButton) {
    window.MonopolyDeal.elements.startButton.addEventListener('click', function() {
      console.log('Start game button clicked');
      window.MonopolyDeal.startGame();
    });
    console.log('Start game button listener added');
  } else {
    console.error('Start game button element not found');
  }
  
  // Draw cards button
  if (window.MonopolyDeal.elements.drawButton) {
    window.MonopolyDeal.elements.drawButton.addEventListener('click', function() {
      console.log('Draw cards button clicked');
      
      // Only allow draw if current perspective matches current player and not in spectator mode
      if (window.MonopolyDeal.currentPerspective === window.MonopolyDeal.gameState.currentPlayer &&
          window.MonopolyDeal.currentPerspective !== 3) {
        window.MonopolyDeal.drawCardsForTurn();
      } else if (window.MonopolyDeal.currentPerspective === 3) {
        window.MonopolyDeal.updateGameStatus('Spectator mode: Cannot interact with the game');
      } else {
        window.MonopolyDeal.updateGameStatus(`It's Player ${window.MonopolyDeal.gameState.currentPlayer}'s turn to draw cards`);
      }
    });
    console.log('Draw cards button listener added');
  } else {
    console.error('Draw cards button element not found');
  }
  
  // End turn button
  if (window.MonopolyDeal.elements.endTurnButton) {
    window.MonopolyDeal.elements.endTurnButton.addEventListener('click', function() {
      console.log('End turn button clicked');
      
      // Only allow end turn if current perspective matches current player and not in spectator mode
      if (window.MonopolyDeal.currentPerspective === window.MonopolyDeal.gameState.currentPlayer &&
          window.MonopolyDeal.currentPerspective !== 3) {
        window.MonopolyDeal.endTurn();
      } else if (window.MonopolyDeal.currentPerspective === 3) {
        window.MonopolyDeal.updateGameStatus('Spectator mode: Cannot interact with the game');
      } else {
        window.MonopolyDeal.updateGameStatus(`It's Player ${window.MonopolyDeal.gameState.currentPlayer}'s turn to end their turn`);
      }
    });
    console.log('End turn button listener added');
  } else {
    console.error('End turn button element not found');
  }
  
  // Switch perspective button
  if (window.MonopolyDeal.elements.switchPerspectiveButton) {
    window.MonopolyDeal.elements.switchPerspectiveButton.addEventListener('click', function() {
      console.log('Switch perspective button clicked');
      window.MonopolyDeal.switchPerspective();
    });
    console.log('Switch perspective button listener added');
  } else {
    console.error('Switch perspective button element not found');
  }
};

// Switch between player perspectives (1 -> 2 -> 3 -> 1)
window.MonopolyDeal.switchPerspective = function() {
  console.log('Switching perspective...');
  
  // If payment is pending, only allow switching to the paying player's perspective
  if (window.MonopolyDeal.gameState.paymentPending) {
    const payingPlayer = window.MonopolyDeal.gameState.paymentRequest?.fromPlayer;
    
    // If not already on paying player's perspective, switch to it
    if (window.MonopolyDeal.currentPerspective !== payingPlayer) {
      window.MonopolyDeal.currentPerspective = payingPlayer;
      window.MonopolyDeal.updateAllPlayerUIs();
      window.MonopolyDeal.updateGameStatus(`Switched to Player ${payingPlayer}'s perspective to make payment`);
      window.MonopolyDeal.addToHistory(`Switched to Player ${payingPlayer}'s perspective to make payment`);
      return;
    }
    
    // Already on paying player's perspective, show message
    window.MonopolyDeal.updateGameStatus(`Payment required: Player ${payingPlayer} must complete the payment first`);
    return;
  }
  
  // Remove any previous perspective indicators
  document.querySelectorAll('.perspective-indicator').forEach(el => el.remove());
  
  // Cycle through perspectives: 1 -> 2 -> 3 -> 1
  if (window.MonopolyDeal.currentPerspective === 1) {
    window.MonopolyDeal.currentPerspective = 2;
  } else if (window.MonopolyDeal.currentPerspective === 2) {
    window.MonopolyDeal.currentPerspective = 3; // Spectator mode
  } else {
    window.MonopolyDeal.currentPerspective = 1;
  }
  
  // Update all player UIs
  window.MonopolyDeal.updateAllPlayerUIs();
  
  // Add perspective indicator
  const indicator = document.createElement('div');
  indicator.className = 'perspective-indicator';
  
  if (window.MonopolyDeal.currentPerspective === 3) {
    // Spectator mode indicator
    indicator.textContent = 'SPECTATOR MODE';
    indicator.style.backgroundColor = 'rgba(128, 0, 128, 0.7)'; // Purple for spectator
    window.MonopolyDeal.updateGameStatus('Switched to Spectator mode - no interactions allowed');
  } else {
    // Player perspective indicator
    indicator.textContent = `PLAYER ${window.MonopolyDeal.currentPerspective} VIEW`;
    indicator.style.backgroundColor = window.MonopolyDeal.currentPerspective === 1 ? 
      'rgba(0, 128, 0, 0.7)' : 'rgba(0, 0, 128, 0.7)'; // Green for P1, Blue for P2
    window.MonopolyDeal.updateGameStatus(`Viewing from Player ${window.MonopolyDeal.currentPerspective}'s perspective`);
  }
  
  // Style the indicator
  indicator.style.position = 'fixed';
  indicator.style.top = '10px';
  indicator.style.left = '50%';
  indicator.style.transform = 'translateX(-50%)';
  indicator.style.color = 'white';
  indicator.style.padding = '5px 15px';
  indicator.style.borderRadius = '15px';
  indicator.style.fontWeight = 'bold';
  indicator.style.fontSize = '16px';
  indicator.style.zIndex = '1000';
  
  document.body.appendChild(indicator);
  
  // Also update the player area titles to make it clear
  const playerAreaTitle = document.querySelector('.player-area h2');
  const opponentAreaTitle = document.querySelector('.opponent-area h2');
  
  if (playerAreaTitle && opponentAreaTitle) {
    if (window.MonopolyDeal.currentPerspective === 1) {
      playerAreaTitle.textContent = "Player 1's Hand";
      opponentAreaTitle.textContent = "Player 2's Hand";
    } else if (window.MonopolyDeal.currentPerspective === 2) {
      playerAreaTitle.textContent = "Player 2's Hand";
      opponentAreaTitle.textContent = "Player 1's Hand";
    } else {
      playerAreaTitle.textContent = "Player 1's Hand";
      opponentAreaTitle.textContent = "Player 2's Hand";
    }
  }
  
  // Update button text if it exists
  const switchButton = window.MonopolyDeal.elements.switchPerspectiveButton;
  if (switchButton) {
    if (window.MonopolyDeal.currentPerspective === 1) {
      switchButton.textContent = 'Switch to Player 2';
    } else if (window.MonopolyDeal.currentPerspective === 2) {
      switchButton.textContent = 'Switch to Spectator';
    } else {
      switchButton.textContent = 'Switch to Player 1';
    }
  }
  
  window.MonopolyDeal.addToHistory(`Switched to ${window.MonopolyDeal.currentPerspective === 3 ? 'Spectator mode' : 'Player ' + window.MonopolyDeal.currentPerspective + '\'s perspective'}`);
  
  console.log(`Perspective switched to ${window.MonopolyDeal.currentPerspective === 3 ? 'Spectator mode' : 'Player ' + window.MonopolyDeal.currentPerspective}`);
};

// Export functions
window.MonopolyDeal.setupGame = window.MonopolyDeal.setupGame;
window.MonopolyDeal.setupEventListeners = window.MonopolyDeal.setupEventListeners;
window.MonopolyDeal.setupDirectEventListeners = window.MonopolyDeal.setupDirectEventListeners;
window.MonopolyDeal.switchPerspective = window.MonopolyDeal.switchPerspective;
window.MonopolyDeal.setupKeyboardShortcuts = window.MonopolyDeal.setupKeyboardShortcuts;
window.MonopolyDeal.updateAllPlayerUIs = window.MonopolyDeal.updateAllPlayerUIs;
window.MonopolyDeal.addSpectatorIndicator = window.MonopolyDeal.addSpectatorIndicator;
window.MonopolyDeal.removeSpectatorIndicator = window.MonopolyDeal.removeSpectatorIndicator;
window.MonopolyDeal.disableGameControls = window.MonopolyDeal.disableGameControls;
window.MonopolyDeal.enableGameControls = window.MonopolyDeal.enableGameControls;
window.MonopolyDeal.updateButtonStates = window.MonopolyDeal.updateButtonStates;

console.log('Scripts.js loaded successfully!');