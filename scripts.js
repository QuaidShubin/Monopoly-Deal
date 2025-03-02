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
    
    // Handle perspective switching keyboard shortcuts - always available
    switch (event.key) {
      case '1':
        // Switch to Player 1's perspective
        console.log('Key "1" pressed - attempting to switch to Player 1 perspective');
        if (window.MonopolyDeal.currentPerspective !== 1) {
          // Directly set the perspective to Player 1
          window.MonopolyDeal.currentPerspective = 2; // Set to 2 temporarily so switchPerspective will switch to 1
          window.MonopolyDeal.switchPerspective();
          console.log('Successfully switched to Player 1 perspective via keyboard shortcut');
        } else {
          console.log('Already in Player 1 perspective');
        }
        break;
        
      case '2':
        // Switch to Player 2's perspective
        console.log('Key "2" pressed - attempting to switch to Player 2 perspective');
        if (window.MonopolyDeal.currentPerspective !== 2) {
          // Directly set the perspective to Player 2
          window.MonopolyDeal.currentPerspective = 1; // Set to 1 temporarily so switchPerspective will switch to 2
          window.MonopolyDeal.switchPerspective();
          console.log('Successfully switched to Player 2 perspective via keyboard shortcut');
        } else {
          console.log('Already in Player 2 perspective');
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
  
  // Update button states
  window.MonopolyDeal.updateButtonStates();
};

// Update button states based on game state
window.MonopolyDeal.updateButtonStates = function() {
  const gameStarted = window.MonopolyDeal.gameState.gameStarted;
  const currentPlayer = window.MonopolyDeal.gameState.currentPlayer;
  const hasDrawnCards = window.MonopolyDeal.gameState.hasDrawnCards;
  const paymentPending = window.MonopolyDeal.gameState.paymentPending;
  const currentPerspective = window.MonopolyDeal.currentPerspective;
  
  // Get button references
  const startButton = window.MonopolyDeal.elements.startButton;
  const drawButton = window.MonopolyDeal.elements.drawButton;
  const endTurnButton = window.MonopolyDeal.elements.endTurnButton;
  const switchPerspectiveButton = window.MonopolyDeal.elements.switchPerspectiveButton;
  const paymentActionContainer = document.getElementById('payment-action-container');
  const makePaymentButton = document.getElementById('make-payment-btn');
  
  // Start button: Disabled if game already started
  if (startButton) {
    startButton.disabled = gameStarted;
  }
  
  // Draw button: Enabled only if it's the current player's turn,
  // the current perspective matches, game started, cards haven't been drawn yet,
  // and no payment is pending
  if (drawButton) {
    drawButton.disabled = !gameStarted || 
                          currentPerspective !== currentPlayer ||
                          hasDrawnCards ||
                          paymentPending;
  }
  
  // End turn button: Enabled only if it's the current player's turn,
  // the current perspective matches, game started, cards have been drawn,
  // and no payment is pending
  if (endTurnButton) {
    endTurnButton.disabled = !gameStarted || 
                            currentPerspective !== currentPlayer ||
                            !hasDrawnCards ||
                            paymentPending;
  }
  
  // Switch perspective button: Always enabled if game started
  if (switchPerspectiveButton) {
    switchPerspectiveButton.disabled = !gameStarted;
    switchPerspectiveButton.textContent = `Switch to Player ${currentPerspective === 1 ? '2' : '1'}'s View`;
    switchPerspectiveButton.title = `Switch to Player ${currentPerspective === 1 ? '2' : '1'}'s perspective`;
  }
  
  // Handle payment action button visibility
  if (paymentActionContainer && makePaymentButton) {
    // Only show payment button when payment is pending AND the current perspective is the paying player
    const isPaymentPending = paymentPending && 
                            window.MonopolyDeal.gameState.paymentRequest && 
                            window.MonopolyDeal.gameState.paymentRequest.fromPlayer === currentPerspective;
                            
    // Update visibility
    if (isPaymentPending) {
      paymentActionContainer.classList.add('visible');
      
      // Update payment button details
      const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
      makePaymentButton.textContent = `Pay $${paymentRequest.amount}M to Player ${paymentRequest.toPlayer}`;
    } else {
      paymentActionContainer.classList.remove('visible');
    }
  }
  
  return true;
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
      
      // Only allow draw if current perspective matches current player
      if (window.MonopolyDeal.currentPerspective === window.MonopolyDeal.gameState.currentPlayer) {
        window.MonopolyDeal.drawCardsForTurn();
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
      
      // Only allow draw if current perspective matches current player
      if (window.MonopolyDeal.currentPerspective === window.MonopolyDeal.gameState.currentPlayer) {
        window.MonopolyDeal.drawCardsForTurn();
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
      
      // Only allow end turn if current perspective matches current player
      if (window.MonopolyDeal.currentPerspective === window.MonopolyDeal.gameState.currentPlayer) {
        window.MonopolyDeal.endTurn();
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
  
  // Make payment button
  if (window.MonopolyDeal.elements.makePaymentButton) {
    window.MonopolyDeal.elements.makePaymentButton.addEventListener('click', function() {
      console.log('Make payment button clicked');
      
      // Only the player who needs to pay can process the payment
      const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
      if (paymentRequest && window.MonopolyDeal.currentPerspective === paymentRequest.fromPlayer) {
        window.MonopolyDeal.processPayment();
      } else {
        window.MonopolyDeal.updateGameStatus('Only the player who needs to pay can use this button');
      }
    });
    console.log('Make payment button listener added');
  } else {
    console.error('Make payment button element not found');
  }
};

// Switch between player perspectives (1 -> 2 -> 1)
window.MonopolyDeal.switchPerspective = function() {
  console.log('Switching perspective...');
  
  // IMPORTANT: Always remove any existing perspective indicators first
  document.querySelectorAll('.perspective-indicator').forEach(el => {
    // Remove immediately without animation to prevent UI shifts
    el.remove();
  });
  
  // Always allow perspective switching (remove payment restrictions)
  
  // Remove active class from all player areas
  document.querySelectorAll('.player-area, .opponent-area').forEach(el => {
    el.classList.remove('active');
  });
  
  // Cycle between perspectives: 1 -> 2 -> 1
  if (window.MonopolyDeal.currentPerspective === 1) {
    window.MonopolyDeal.currentPerspective = 2;
  } else {
    window.MonopolyDeal.currentPerspective = 1;
  }
  
  // Show which player we're now seeing
  console.log(`Now viewing from Player ${window.MonopolyDeal.currentPerspective}'s perspective`);
  
  // Update the button text
  const switchButton = window.MonopolyDeal.elements.switchPerspectiveButton;
  if (switchButton) {
    switchButton.textContent = `Switch to Player ${window.MonopolyDeal.currentPerspective === 1 ? '2' : '1'}'s View`;
  }
  
  // Update UIs to reflect the new perspective
  window.MonopolyDeal.updateAllPlayerUIs();
  
  // Update game status message to indicate switch
  window.MonopolyDeal.updateGameStatus(`Switched to Player ${window.MonopolyDeal.currentPerspective}'s perspective`);
  
  // If there's a payment pending, show a hint on what to do
  if (window.MonopolyDeal.gameState.paymentPending) {
    const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
    const payingPlayer = paymentRequest.fromPlayer;
    
    if (window.MonopolyDeal.currentPerspective === payingPlayer) {
      // Show hint that this player needs to pay
      setTimeout(() => {
        window.MonopolyDeal.updateGameStatus(`Player ${payingPlayer} needs to pay $${paymentRequest.amount}M to Player ${paymentRequest.toPlayer}`);
      }, 2000);
    } else {
      // Show hint that the other player needs to pay
      setTimeout(() => {
        window.MonopolyDeal.updateGameStatus(`Waiting for Player ${payingPlayer} to pay $${paymentRequest.amount}M to Player ${paymentRequest.toPlayer}`);
      }, 2000);
    }
  }
  
  return true;
};

// Export functions
window.MonopolyDeal.setupGame = window.MonopolyDeal.setupGame;
window.MonopolyDeal.setupEventListeners = window.MonopolyDeal.setupEventListeners;
window.MonopolyDeal.setupDirectEventListeners = window.MonopolyDeal.setupDirectEventListeners;
window.MonopolyDeal.switchPerspective = window.MonopolyDeal.switchPerspective;
window.MonopolyDeal.setupKeyboardShortcuts = window.MonopolyDeal.setupKeyboardShortcuts;
window.MonopolyDeal.updateAllPlayerUIs = window.MonopolyDeal.updateAllPlayerUIs;
window.MonopolyDeal.updateButtonStates = window.MonopolyDeal.updateButtonStates;

console.log('Scripts.js loaded successfully!');