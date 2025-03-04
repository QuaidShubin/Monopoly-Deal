// Game state management for Monopoly Deal
console.log('GameState.js loading...');

// Ensure MonopolyDeal namespace exists
window.MonopolyDeal = window.MonopolyDeal || {};

// Initialize game state
window.MonopolyDeal.gameState = {
  gameStarted: false,
  currentPlayer: 1,
  hasDrawnCards: false,
  cardsPlayedThisTurn: 0,
  discardMode: false,
  cardsToDiscard: 0,
  paymentRequest: null,
  paymentPending: false,
  paymentMode: false,
  selectedPaymentAssets: {
    money: [],
    properties: []
  },
  // New properties for Just Say No and action response system
  actionResponse: {
    pending: false,
    type: null,  // 'payment', 'property-steal', etc.
    fromPlayer: null,
    toPlayer: null,
    justSayNoChain: 0,  // How many Just Say No cards have been played in this chain
    actionCard: null,  // The original action card played
    payload: null      // Additional data for the action (e.g., amount, property)
  },
  players: {
    1: { hand: [], money: [], properties: {} },
    2: { hand: [], money: [], properties: {} }
  },
  deck: [],
  discardPile: [],
  lastActionCard: null,
  history: [],
  winnerDeclared: false // Add this property to track if a winner has been declared
};

// Add a property to track the currently selected wildcard
window.MonopolyDeal.selectedWildcard = null;

// Function to handle wildcard selection mode
window.MonopolyDeal.enterWildcardSelectionMode = function() {
  console.log('Entering wildcard selection mode (deprecated)');
  return true;
};

// Function to exit wildcard selection mode
window.MonopolyDeal.exitWildcardSelectionMode = function() {
  console.log('Exiting wildcard selection mode (deprecated)');
  return true;
};

// Set up game elements and UI references
window.MonopolyDeal.setupElements = function() {
  console.log('Setting up game elements and UI references...');
  try {
    window.MonopolyDeal.elements = {
      playerHand: document.getElementById('player-hand'),
      opponentHand: document.getElementById('opponent-hand'),
      currentPlayerHand: document.getElementById('current-player-hand'),
      playerMoney: document.getElementById('player-money'),
      opponentMoney: document.getElementById('opponent-money'),
      playerProperties: document.getElementById('player-properties'),
      opponentProperties: document.getElementById('opponent-properties'),
      drawPile: document.getElementById('draw-pile'),
      actionPile: document.getElementById('action-pile'),
      gameStatus: document.getElementById('game-status'),
      gameHistory: document.getElementById('game-history'),
      startButton: document.getElementById('start-game-btn'),
      drawButton: document.getElementById('draw-cards-btn'),
      endTurnButton: document.getElementById('end-turn-btn'),
      switchPerspectiveButton: document.getElementById('switch-perspective-btn'),
      makePaymentButton: document.getElementById('make-payment-btn')
    };
    
    // Check if all elements exist
    Object.entries(window.MonopolyDeal.elements).forEach(([key, element]) => {
      if (!element) {
        console.error(`Element not found: ${key}`);
      }
    });
    
    console.log('Elements setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up elements:', error);
    return false;
  }
};

// Start a new game
window.MonopolyDeal.startGame = function() {
  console.log('Starting a new game...');
  try {
    // Initialize game state
    window.MonopolyDeal.gameState = {
      gameStarted: true,
      currentPlayer: 1,
      hasDrawnCards: false,
      cardsPlayedThisTurn: 0,
      discardMode: false,
      cardsToDiscard: 0,
      paymentRequest: null,
      paymentPending: false,
      paymentMode: false,
      selectedPaymentAssets: {
        money: [],
        properties: []
      },
      // New properties for Just Say No and action response system
      actionResponse: {
        pending: false,
        type: null,  // 'payment', 'property-steal', etc.
        fromPlayer: null,
        toPlayer: null,
        justSayNoChain: 0,  // How many Just Say No cards have been played in this chain
        actionCard: null,  // The original action card played
        payload: null      // Additional data for the action (e.g., amount, property)
      },
      players: {
        1: { hand: [], money: [], properties: {} },
        2: { hand: [], money: [], properties: {} }
      },
      deck: [],
      discardPile: [],
      lastActionCard: null,
      history: [],
      winnerDeclared: false // Add this property to track if a winner has been declared
    };
    
    // Ensure UI elements exist
    if (!window.MonopolyDeal.setupElements()) {
      console.error('Failed to set up UI elements');
      return false;
    }
    
    // Initialize and shuffle deck
    window.MonopolyDeal.gameState.deck = window.MonopolyDeal.initializeDeck();
    if (!window.MonopolyDeal.gameState.deck || window.MonopolyDeal.gameState.deck.length === 0) {
      console.error('Failed to initialize deck');
      return false;
    }
    
    console.log(`Deck initialized with ${window.MonopolyDeal.gameState.deck.length} cards`);
    window.MonopolyDeal.shuffleDeck();
    
    // Deal initial cards (5 to each player)
    for (let i = 0; i < 5; i++) {
      window.MonopolyDeal.dealCard(1);
      window.MonopolyDeal.dealCard(2);
    }
    
    // Update UI
    window.MonopolyDeal.updatePlayerHandUI(1);
    window.MonopolyDeal.updatePlayerHandUI(2);
    
    // Initialize money UI for both players with zero values
    window.MonopolyDeal.updatePlayerMoneyUI(1);
    window.MonopolyDeal.updatePlayerMoneyUI(2);
    
    // Initialize properties UI for both players
    window.MonopolyDeal.updatePlayerPropertiesUI(1);
    window.MonopolyDeal.updatePlayerPropertiesUI(2);
    
    // Update actions left counter
    window.MonopolyDeal.updateActionsLeftCounter();
    
    window.MonopolyDeal.updateGameStatus('Player 1\'s turn. Draw 2 cards to start your turn');
    window.MonopolyDeal.addToHistory('Game started! Each player has been dealt 5 cards.');
    
    // Enable/disable relevant buttons
    if (window.MonopolyDeal.elements.drawButton) {
      window.MonopolyDeal.elements.drawButton.disabled = false;
    }
    if (window.MonopolyDeal.elements.endTurnButton) {
      window.MonopolyDeal.elements.endTurnButton.disabled = true;
    }
    
    console.log('Game started successfully!');
    return true;
  } catch (error) {
    console.error('Error starting game:', error);
    window.MonopolyDeal.updateGameStatus('Error starting game: ' + error.message);
    return false;
  }
};

// Shuffle the deck
window.MonopolyDeal.shuffleDeck = function() {
  console.log('Shuffling deck...');
  const deck = window.MonopolyDeal.gameState.deck;
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  console.log('Deck shuffled');
};

// Deal a card to a player
window.MonopolyDeal.dealCard = function(playerNumber) {
  console.log(`Dealing card to player ${playerNumber}...`);
  if (window.MonopolyDeal.gameState.deck.length === 0) {
    console.log('Deck is empty. Reshuffling discard pile...');
    if (window.MonopolyDeal.gameState.discardPile.length === 0) {
      console.warn('No cards left in the game');
      return null;
    }
    
    window.MonopolyDeal.gameState.deck = [...window.MonopolyDeal.gameState.discardPile];
    window.MonopolyDeal.gameState.discardPile = [];
    window.MonopolyDeal.shuffleDeck();
  }
  
  const card = window.MonopolyDeal.gameState.deck.pop();
  window.MonopolyDeal.gameState.players[playerNumber].hand.push(card);
  console.log(`Card dealt to player ${playerNumber}: ${card.type} - ${card.id}`);
  return card;
};

// Draw cards for the current player's turn
window.MonopolyDeal.drawCardsForTurn = function() {
  console.log('Drawing cards for turn...');
  if (!window.MonopolyDeal.gameState.gameStarted) {
    console.warn('Game not started');
    window.MonopolyDeal.updateGameStatus('Please start a new game first');
    return false;
  }
  
  if (window.MonopolyDeal.gameState.hasDrawnCards) {
    console.warn('Cards already drawn this turn');
    window.MonopolyDeal.updateGameStatus('You have already drawn cards this turn');
    return false;
  }
  
  // Check if payment is pending
  if (window.MonopolyDeal.gameState.paymentPending) {
    console.warn('Payment is pending');
    window.MonopolyDeal.updateGameStatus('Cannot draw cards while payment is pending');
    return false;
  }
  
  const playerNumber = window.MonopolyDeal.gameState.currentPlayer;
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  
  // Determine how many cards to draw
  // If player has zero cards, draw 5 cards instead of 2
  const cardsToDrawCount = player.hand.length === 0 ? 5 : 2;
  
  for (let i = 0; i < cardsToDrawCount; i++) {
    window.MonopolyDeal.dealCard(playerNumber);
  }
  
  // Update game status message based on how many cards were drawn
  if (cardsToDrawCount === 5) {
    window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} had no cards and drew 5 cards.`);
    window.MonopolyDeal.addToHistory(`Player ${playerNumber} had no cards and drew 5 cards.`);
  } else {
    window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} drew ${cardsToDrawCount} cards.`);
    window.MonopolyDeal.addToHistory(`Player ${playerNumber} drew ${cardsToDrawCount} cards.`);
  }
  
  window.MonopolyDeal.gameState.hasDrawnCards = true;
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  
  if (window.MonopolyDeal.elements.drawButton) {
    window.MonopolyDeal.elements.drawButton.disabled = true;
  }
  if (window.MonopolyDeal.elements.endTurnButton) {
    window.MonopolyDeal.elements.endTurnButton.disabled = false;
  }
  
  // Update actions left counter
  window.MonopolyDeal.updateActionsLeftCounter();
};

// Play a card from hand - Restore original functionality while keeping our improvements
window.MonopolyDeal.playCard = function(playerNumber, cardId) {
  console.log(`Playing card ${cardId} for player ${playerNumber}...`);
  
  // Check if payment is pending
  if (window.MonopolyDeal.gameState.paymentPending) {
    window.MonopolyDeal.updateGameStatus('Cannot play cards while payment is pending');
    return false;
  }
  
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  const cardIndex = player.hand.findIndex(card => card.id === cardId);
  
  if (cardIndex === -1) {
    console.warn(`Card ${cardId} not found in player ${playerNumber}'s hand`);
    return false;
  }
  
  const card = player.hand[cardIndex];
  
  // Check if card can be played
  const validationResult = window.MonopolyDeal.canPlayCard(card, window.MonopolyDeal.gameState, playerNumber);
  if (validationResult.code !== 'VALID') {
    console.warn(`Cannot play card: ${validationResult.message}`);
    window.MonopolyDeal.updateGameStatus(`Cannot play card: ${validationResult.message}`);
    return false;
  }
  
  // Handle action cards with modal
  if (card.type === 'action') {
    window.MonopolyDeal.showActionCardModal(playerNumber, cardIndex);
    return true;
  }
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Handle card based on type
  switch (card.type) {
    case 'money':
      player.money.push(card);
      window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played money: $${card.value}M`);
      window.MonopolyDeal.addToHistory(`Player ${playerNumber} played money: $${card.value}M`);
      break;
      
    case 'property':
      // Handle property wildcards with multiple colors
      if (card.wildcard && card.colors && card.colors.length > 1) {
        // For 2-way property wildcards
        // Check if only displaying the first color of a wildcard or the second
        if (card.topColor && card.colors[0] === card.topColor) {
          card.color = card.colors[0];
          card.activeColor = card.colors[0];
          card.secondaryColor = card.colors[1];
          card.isFlipped = false; // Start with the first color showing
          card.isWildcard = true;
          card.originalColors = [...card.colors];
          console.log(`Playing two-way wildcard property starting with color: ${card.activeColor}`);
        } else if (card.topColor && card.colors[1] === card.topColor) {
          card.color = card.colors[1];
          card.activeColor = card.colors[1];
          card.secondaryColor = card.colors[0];
          card.isFlipped = true; // Flipped to show second color
          card.isWildcard = true;
          console.log(`Playing two-way wildcard property starting with color: ${card.activeColor}`);
        } else {
          card.activeColor = card.color;
          card.isWildcard = true;
          card.originalColors = [...card.colors];
        }
      } else if (card.wildcard && card.colors && card.colors[0] === 'any') {
        card.isWildcard = true;
        card.originalColors = ['any'];
        card.color = 'any';
        card.activeColor = 'any';
      }
      
      // Initialize property color group if it doesn't exist
      if (!player.properties[card.color]) {
        player.properties[card.color] = [];
      }
      player.properties[card.color].push(card);
      window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played ${card.name} property`);
      window.MonopolyDeal.addToHistory(`Player ${playerNumber} played ${card.name} property`);
      break;
      
    default:
      console.warn(`Unknown card type: ${card.type}`);
      player.hand.push(card); // Return card to hand
      return false;
  }
  
  // Increment cards played this turn and update the counter
  window.MonopolyDeal.incrementCardsPlayed();
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  window.MonopolyDeal.updatePlayerMoneyUI(playerNumber);
  window.MonopolyDeal.updatePlayerPropertiesUI(playerNumber);
  
  // Check if any wildcards need to be reassigned after playing this card
  if (card.type === 'property' || (card.type === 'action' && ['sly-deal', 'forced-deal'].includes(card.action))) {
    window.MonopolyDeal.handleWildcardReassignment(playerNumber);
    
    // If this was a two-player action that affected the other player, check their wildcards too
    const opponentNumber = playerNumber === 1 ? 2 : 1;
    window.MonopolyDeal.handleWildcardReassignment(opponentNumber);
  }
  
  return true;
};

// Show the action card modal
window.MonopolyDeal.showActionCardModal = function(playerNumber, cardIndex) {
  console.log('Showing action card modal...');
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  const card = player.hand[cardIndex];
  
  // Get modal elements
  const modal = document.getElementById('action-card-modal');
  const cardNameElement = document.getElementById('modal-card-name');
  const cardPreviewElement = document.getElementById('modal-card-preview');
  const optionsContainer = document.getElementById('action-options-container');
  
  // Set card name
  cardNameElement.textContent = card.name;
  
  // Create card preview with actual card image
  cardPreviewElement.innerHTML = '';
  const cardElement = document.createElement('div');
  cardElement.className = 'card action-card';
  
  // Get the image path for the card
  const imagePath = window.MonopolyDeal.getCardImagePath(card);
  
  if (imagePath) {
    // Use the actual card image
    cardElement.style.backgroundImage = `url('${imagePath}')`;
    cardElement.style.backgroundSize = 'cover';
    cardElement.style.backgroundPosition = 'center';
    cardElement.style.backgroundRepeat = 'no-repeat';
  } else {
    // Fallback to text display only if image is not available
    if (card.action === window.MonopolyDeal.ActionTypes.PROPERTY_RENT || 
        card.action === window.MonopolyDeal.ActionTypes.WILD_RENT) {
      
      let rentTypeLabel = '';
      if (card.rentType === window.MonopolyDeal.RentTypes.WILD) {
        rentTypeLabel = 'ANY COLOR';
      } else {
        // Format the rent type to be more readable
        rentTypeLabel = card.rentType.replace(/-/g, ' & ').replace(/^./, str => str.toUpperCase());
      }
      
      // Add data-rent-type attribute for CSS styling
      cardElement.dataset.rentType = card.rentType;
      
      cardElement.innerHTML = `
        <div class="action-name">${card.name}</div>
        <div class="action-rent-type">${rentTypeLabel}</div>
        <div class="action-description">${card.description}</div>
        <div class="action-value">$${card.value}M</div>`;
    } else {
      // Regular action card
      cardElement.innerHTML = `
        <div class="action-name">${card.name}</div>
        <div class="action-description">${card.description}</div>
        <div class="action-value">$${card.value}M</div>`;
    }
  }
  
  cardPreviewElement.appendChild(cardElement);
  
  // Clear previous options
  optionsContainer.innerHTML = '';
  
  // Add play as money option - always available for all action cards
  const playAsMoneyButton = document.createElement('button');
  playAsMoneyButton.className = 'action-option-btn play-money';
  playAsMoneyButton.textContent = `Play as $${card.value}M`;
  playAsMoneyButton.addEventListener('click', function() {
    window.MonopolyDeal.playActionCardAsMoney(playerNumber, cardIndex);
    window.MonopolyDeal.hideActionCardModal();
  });
  optionsContainer.appendChild(playAsMoneyButton);
  
  // Add action-specific options
  switch (card.action) {
    case window.MonopolyDeal.ActionTypes.PASS_GO:
      const passGoButton = document.createElement('button');
      passGoButton.className = 'action-option-btn play-action';
      passGoButton.textContent = 'Pass Go (Draw 2 cards)';
      passGoButton.addEventListener('click', function() {
        window.MonopolyDeal.playPassGoCard(playerNumber, cardIndex);
        window.MonopolyDeal.hideActionCardModal();
      });
      optionsContainer.appendChild(passGoButton);
      break;
      
    case window.MonopolyDeal.ActionTypes.DEBT_COLLECTOR:
      const debtCollectorButton = document.createElement('button');
      debtCollectorButton.className = 'action-option-btn play-action';
      debtCollectorButton.textContent = 'Collect $5M from opponent';
      
      // Check if opponent has any assets to pay
      const opponentNumber = playerNumber === 1 ? 2 : 1;
      const opponentHasAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentNumber);
      
      // Only disable if opponent has no assets at all
      if (!opponentHasAssets) {
        debtCollectorButton.disabled = true;
        debtCollectorButton.textContent += ' (Opponent has no available assets)';
      }
      
      debtCollectorButton.addEventListener('click', function() {
        if (!debtCollectorButton.disabled) {
          window.MonopolyDeal.playDebtCollectorCard(playerNumber, cardIndex);
          window.MonopolyDeal.hideActionCardModal();
        }
      });
      optionsContainer.appendChild(debtCollectorButton);
      break;
      
    case window.MonopolyDeal.ActionTypes.PROPERTY_RENT:
      // Group properties by color to determine valid rent options
      const playerProperties = window.MonopolyDeal.gameState.players[playerNumber].properties;
      let hasValidRentTarget = false;
      
      // Only show options for colors mentioned in the rent card
      card.colors.forEach(color => {
        if (playerProperties[color] && playerProperties[color].length > 0) {
          const rentButton = document.createElement('button');
          rentButton.className = 'action-option-btn play-action';
          
          // Calculate rent value based on property count
          const rentValue = window.MonopolyDeal.calculateRentForProperties(playerNumber, color);
          
          // Simplified text without insufficient funds message
          rentButton.textContent = `Collect rent for ${color} properties ($${rentValue}M)`;
          
          // Check if opponent has any assets to pay
          const opponentNumber = playerNumber === 1 ? 2 : 1;
          const opponentHasAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentNumber);
          
          // Only disable if opponent has no assets at all
          if (!opponentHasAssets) {
            rentButton.disabled = true;
            rentButton.textContent += ' (Opponent has no available assets)';
          } else {
            hasValidRentTarget = true;
          }
          
          rentButton.addEventListener('click', function() {
            if (!rentButton.disabled) {
              window.MonopolyDeal.playRentCard(playerNumber, cardIndex, color, rentValue);
              window.MonopolyDeal.hideActionCardModal();
            }
          });
          optionsContainer.appendChild(rentButton);
        }
      });
      
      if (!hasValidRentTarget) {
        const noPropertiesMessage = document.createElement('div');
        noPropertiesMessage.className = 'action-option-message';
        noPropertiesMessage.textContent = 'You have no matching properties to collect rent for';
        optionsContainer.appendChild(noPropertiesMessage);
        
        // Emphasize the play as money option if there are no valid rent targets
        playAsMoneyButton.style.fontWeight = 'bold';
        playAsMoneyButton.style.backgroundColor = '#4CAF50';
        playAsMoneyButton.style.color = 'white';
      }
      break;
      
    case window.MonopolyDeal.ActionTypes.WILD_RENT:
      // For wild rent, we can collect rent for any color property we have
      const playerPropsForWildRent = window.MonopolyDeal.gameState.players[playerNumber].properties;
      let hasValidWildRentTarget = false;
      
      Object.keys(playerPropsForWildRent).forEach(color => {
        if (playerPropsForWildRent[color].length > 0) {
          const rentButton = document.createElement('button');
          rentButton.className = 'action-option-btn play-action';
          
          // Calculate rent value based on property count
          const rentValue = window.MonopolyDeal.calculateRentForProperties(playerNumber, color);
          
          // Simplified text without insufficient funds message
          rentButton.textContent = `Collect rent for ${color} properties ($${rentValue}M)`;
          
          // Check if opponent has any assets to pay
          const opponentNumber = playerNumber === 1 ? 2 : 1;
          const opponentHasAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentNumber);
          
          // Only disable if opponent has no assets at all
          if (!opponentHasAssets) {
            rentButton.disabled = true;
            rentButton.textContent += ' (Opponent has no available assets)';
          } else {
            hasValidWildRentTarget = true;
          }
          
          rentButton.addEventListener('click', function() {
            if (!rentButton.disabled) {
              window.MonopolyDeal.playRentCard(playerNumber, cardIndex, color, rentValue);
              window.MonopolyDeal.hideActionCardModal();
            }
          });
          optionsContainer.appendChild(rentButton);
        }
      });
      
      if (!hasValidWildRentTarget) {
        const noPropertiesMessage = document.createElement('div');
        noPropertiesMessage.className = 'action-option-message';
        noPropertiesMessage.textContent = 'You have no properties to collect rent for';
        optionsContainer.appendChild(noPropertiesMessage);
        
        // Emphasize the play as money option if there are no valid rent targets
        playAsMoneyButton.style.fontWeight = 'bold';
        playAsMoneyButton.style.backgroundColor = '#4CAF50';
        playAsMoneyButton.style.color = 'white';
      }
      break;
      
    case window.MonopolyDeal.ActionTypes.RENT:
      // Legacy rent handling for backwards compatibility
      // Group properties by color to determine valid rent options
      const playerPropsLegacy = window.MonopolyDeal.gameState.players[playerNumber].properties;
      let hasValidRentTargetLegacy = false;
      
      Object.keys(playerPropsLegacy).forEach(color => {
        if (playerPropsLegacy[color].length > 0) {
          const rentButton = document.createElement('button');
          rentButton.className = 'action-option-btn play-action';
          
          // Calculate rent value based on property count
          const rentValue = window.MonopolyDeal.calculateRentForProperties(playerNumber, color);
          
          // Simplified text without insufficient funds message
          rentButton.textContent = `Collect rent for ${color} properties ($${rentValue}M)`;
          
          // Check if opponent has any assets to pay
          const opponentNumber = playerNumber === 1 ? 2 : 1;
          const opponentHasAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentNumber);
          
          // Only disable if opponent has no assets at all
          if (!opponentHasAssets) {
            rentButton.disabled = true;
            rentButton.textContent += ' (Opponent has no available assets)';
          } else {
            hasValidRentTargetLegacy = true;
          }
          
          rentButton.addEventListener('click', function() {
            if (!rentButton.disabled) {
              window.MonopolyDeal.playRentCard(playerNumber, cardIndex, color, rentValue);
              window.MonopolyDeal.hideActionCardModal();
            }
          });
          optionsContainer.appendChild(rentButton);
        }
      });
      
      if (!hasValidRentTargetLegacy) {
        const noPropertiesMessage = document.createElement('div');
        noPropertiesMessage.className = 'action-option-message';
        noPropertiesMessage.textContent = 'You have no properties to collect rent for';
        optionsContainer.appendChild(noPropertiesMessage);
      }
      break;
      
    case window.MonopolyDeal.ActionTypes.BIRTHDAY:
      const birthdayButton = document.createElement('button');
      birthdayButton.className = 'action-option-btn play-action';
      birthdayButton.textContent = 'Collect $2M from opponent';
      
      // Check if opponent has any assets to pay
      const opponentForBirthday = playerNumber === 1 ? 2 : 1;
      const opponentHasBirthdayAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentForBirthday);
      
      // Only disable if opponent has no assets at all
      if (!opponentHasBirthdayAssets) {
        birthdayButton.disabled = true;
        birthdayButton.textContent += ' (Opponent has no available assets)';
      }
      
      birthdayButton.addEventListener('click', function() {
        if (!birthdayButton.disabled) {
          window.MonopolyDeal.playBirthdayCard(playerNumber, cardIndex);
          window.MonopolyDeal.hideActionCardModal();
        }
      });
      optionsContainer.appendChild(birthdayButton);
      break;
      
    // Add more action types as needed
      
    default:
      const playActionButton = document.createElement('button');
      playActionButton.className = 'action-option-btn play-action';
      playActionButton.textContent = `Use ${card.name} action (Not implemented)`;
      playActionButton.disabled = true;
      optionsContainer.appendChild(playActionButton);
      break;
  }
  
  // Set up close button
  const closeButtons = modal.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      window.MonopolyDeal.hideActionCardModal();
    });
  });
  
  // Show modal
  modal.style.display = 'block';
};

// Hide the action card modal
window.MonopolyDeal.hideActionCardModal = function() {
  console.log('Hiding action card modal...');
  const modal = document.getElementById('action-card-modal');
  modal.style.display = 'none';
};

// Play action card as money
window.MonopolyDeal.playActionCardAsMoney = function(playerNumber, cardIndex) {
  console.log(`Playing action card as money for player ${playerNumber}...`);
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  const card = player.hand[cardIndex];
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to money pile
  player.money.push(card);
  
  // Update UI
  window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played ${card.name} as money ($${card.value}M)`);
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} played ${card.name} as money ($${card.value}M)`);
  
  // Increment cards played this turn
  window.MonopolyDeal.incrementCardsPlayed();
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  window.MonopolyDeal.updatePlayerMoneyUI(playerNumber);
  
  return true;
};

// Play Pass Go card
window.MonopolyDeal.playPassGoCard = function(playerNumber, cardIndex) {
  console.log(`Playing Pass Go card for player ${playerNumber}...`);
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  const card = player.hand[cardIndex];
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to action pile
  window.MonopolyDeal.placeActionCard(card);
  
  // Draw 2 cards
  for (let i = 0; i < 2; i++) {
    window.MonopolyDeal.dealCard(playerNumber);
  }
  
  // Update UI
  window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played Pass Go and drew 2 cards`);
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} played Pass Go and drew 2 cards`);
  
  // Increment cards played this turn
  window.MonopolyDeal.incrementCardsPlayed();
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  
  return true;
};

// Play Debt Collector card
window.MonopolyDeal.playDebtCollectorCard = function(playerNumber, cardIndex) {
  console.log(`Playing Debt Collector card for player ${playerNumber}...`);
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  const card = player.hand[cardIndex];
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to action pile
  window.MonopolyDeal.placeActionCard(card);
  
  // Determine opponent
  const opponentNumber = playerNumber === 1 ? 2 : 1;
  const debtAmount = 5; // Debt Collector always requires $5M
  
  // Request payment from opponent - auto-payment will be handled in requestPayment function
  window.MonopolyDeal.requestPayment(opponentNumber, playerNumber, debtAmount, `Player ${playerNumber} played Debt Collector`);
  
  // Increment cards played this turn
  window.MonopolyDeal.incrementCardsPlayed();
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  window.MonopolyDeal.updateActionsLeftCounter();
  
  return true;
};

// Play Rent card
window.MonopolyDeal.playRentCard = function(playerNumber, cardIndex, propertyColor, rentAmount) {
  console.log(`Playing Rent card for player ${playerNumber} for ${propertyColor} properties...`);
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  const card = player.hand[cardIndex];
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to action pile
  window.MonopolyDeal.placeActionCard(card);
  
  // Determine opponent
  const opponentNumber = playerNumber === 1 ? 2 : 1;
  
  // Request payment from opponent - auto-payment will be handled in requestPayment function
  window.MonopolyDeal.requestPayment(opponentNumber, playerNumber, rentAmount, `Player ${playerNumber} played Rent for ${propertyColor} properties`);
  
  // Increment cards played this turn
  window.MonopolyDeal.incrementCardsPlayed();
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  window.MonopolyDeal.updateActionsLeftCounter();
  
  return true;
};

// Play Birthday card
window.MonopolyDeal.playBirthdayCard = function(playerNumber, cardIndex) {
  console.log(`Playing Birthday card for player ${playerNumber}...`);
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  const card = player.hand[cardIndex];
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to action pile
  window.MonopolyDeal.placeActionCard(card);
  
  // Determine opponent
  const opponentNumber = playerNumber === 1 ? 2 : 1;
  const birthdayAmount = 2; // Birthday always requires $2M
  
  // Request payment from opponent - auto-payment will be handled in requestPayment function
  window.MonopolyDeal.requestPayment(opponentNumber, playerNumber, birthdayAmount, `Player ${playerNumber} played Birthday`);
  
  // Increment cards played this turn
  window.MonopolyDeal.incrementCardsPlayed();
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  window.MonopolyDeal.updateActionsLeftCounter();
  
  return true;
};

// Calculate the total value of a player's assets (money + properties)
window.MonopolyDeal.calculatePlayerAssetValue = function(playerNumber) {
  console.log(`Calculating asset value for player ${playerNumber}...`);
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  let totalValue = 0;
  
  // Add money
  player.money.forEach(card => {
    totalValue += parseInt(card.value);
  });
  
  // Add properties
  Object.keys(player.properties).forEach(color => {
    player.properties[color].forEach(card => {
      totalValue += parseInt(card.value);
    });
  });
  
  console.log(`Player ${playerNumber} has assets worth $${totalValue}M`);
  return totalValue;
};

// Request payment from a player
window.MonopolyDeal.requestPayment = function(fromPlayer, toPlayer, amount, reason = '') {
  console.log(`Requesting payment of $${amount}M from Player ${fromPlayer} to Player ${toPlayer}`);
  
  if (!window.MonopolyDeal.gameState.gameStarted) {
    console.warn('Game not started');
    return false;
  }
  
  // Set up payment request
  window.MonopolyDeal.gameState.paymentRequest = {
    fromPlayer: fromPlayer,
    toPlayer: toPlayer,
    amount: amount,
    reason: reason
  };
  
  window.MonopolyDeal.gameState.paymentPending = true;
  window.MonopolyDeal.gameState.paymentMode = false;
  
  // Reset selected payment assets
  window.MonopolyDeal.gameState.selectedPaymentAssets = {
    money: [],
    properties: []
  };
  
  // Set up the action response system for Just Say No
  window.MonopolyDeal.gameState.actionResponse = {
    pending: true,
    type: 'payment',
    fromPlayer: fromPlayer,  // Player who will pay (target of the action)
    toPlayer: toPlayer,      // Player who will receive (initiator of the action)
    justSayNoChain: 0,
    actionCard: window.MonopolyDeal.gameState.lastActionCard,
    payload: { amount: amount, reason: reason }
  };
  
  // Update the game status for everyone
  window.MonopolyDeal.updateGameStatus(`Waiting for Player ${fromPlayer} to respond to payment request of $${amount}M to Player ${toPlayer}`);
  window.MonopolyDeal.addToHistory(`Player ${toPlayer} requested $${amount}M from Player ${fromPlayer}`);
  
  // Store the current perspective to restore it later
  window.MonopolyDeal.gameState.perspectiveBeforePayment = window.MonopolyDeal.currentPerspective;
  
  // Create a notification for the player who needs to pay
  window.MonopolyDeal.showPaymentNotification(fromPlayer, amount, reason);
  
  // Update UI
  window.MonopolyDeal.updateAllPlayerUIs();
  
  // Show response options when in target player's perspective
  window.MonopolyDeal.showActionResponseOptions();
  
  return true;
};

// Show a notification to the player who needs to pay
window.MonopolyDeal.showPaymentNotification = function(playerNumber, amount, reason) {
  console.log(`Showing payment notification for player ${playerNumber}`);
  
  // First remove any existing notifications
  const existingNotification = document.querySelector('.payment-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'payment-notification';
  notification.innerHTML = `
    <div class="payment-message">
      <strong>Payment Required: $${amount}M</strong>
      <p>${reason}</p>
    </div>
    <button class="payment-button">Pay Now</button>
  `;
  
  // Add click event to the button
  const payButton = notification.querySelector('.payment-button');
  if (payButton) {
    payButton.addEventListener('click', function() {
      // Temporarily switch to the paying player's perspective to handle payment
      const originalPerspective = window.MonopolyDeal.currentPerspective;
      window.MonopolyDeal.currentPerspective = playerNumber;
      window.MonopolyDeal.updateAllPlayerUIs();
      
      // Show the payment modal
      window.MonopolyDeal.showPaymentModal();
      
      // Remove the notification
      notification.remove();
    });
  }
  
  // Add to the document
  document.body.appendChild(notification);
  
  // Make the notification pulse to draw attention
  setTimeout(() => {
    notification.classList.add('pulse');
  }, 300);
};

// Show the payment modal with all selectable assets
window.MonopolyDeal.showPaymentModal = function() {
  console.log('Showing payment modal...');
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  
  if (!paymentRequest) {
    console.error('No payment request found!');
    return;
  }
  
  // Reset selected payment assets
  window.MonopolyDeal.gameState.selectedPaymentAssets = {
    money: [],
    properties: []
  };
  
  // Calculate total available assets to determine minimum payment amount
  const totalAvailableAssets = window.MonopolyDeal.calculateAvailableAssets(paymentRequest.fromPlayer);
  
  // Set the payment amount to the minimum of what was requested and what the player can actually pay
  const adjustedAmount = Math.min(totalAvailableAssets, paymentRequest.amount);
  paymentRequest.adjustedAmount = adjustedAmount;
  
  console.log(`Original payment request: $${paymentRequest.amount}M, Adjusted to: $${adjustedAmount}M based on available assets`);
  
  // Enable payment mode when the modal is shown
  window.MonopolyDeal.gameState.paymentMode = true;
  
  // Ensure we are in the correct perspective
  if (window.MonopolyDeal.currentPerspective !== paymentRequest.fromPlayer) {
    window.MonopolyDeal.currentPerspective = paymentRequest.fromPlayer;
    window.MonopolyDeal.updateAllPlayerUIs();
  }
  
  const paymentModal = document.getElementById('payment-modal');
  if (!paymentModal) {
    console.error('Payment modal element not found!');
    return;
  }
  
  // Initialize the payment-current element to $0M
  const currentElement = document.getElementById('payment-current');
  if (currentElement) {
    // Set the initial value to 0
    currentElement.textContent = '$0M';
    currentElement.style.color = '#f44336'; // Red for insufficient
  } else {
    console.error('payment-current element not found!');
  }
  
  // Update required amount display
  const requiredAmountElement = document.getElementById('payment-required-amount');
  if (requiredAmountElement) {
    requiredAmountElement.textContent = adjustedAmount;
  }
  
  // Reset progress bar
  const progressBar = document.getElementById('payment-progress-bar');
  if (progressBar) {
    progressBar.style.width = '0%';
    progressBar.classList.remove('sufficient');
  }
  
  // Remove the close button completely from the modal header
  const closeButton = paymentModal.querySelector('.close');
  if (closeButton) {
    closeButton.style.display = 'none';
  }
  
  // Set up payment confirm button
  const confirmButton = document.getElementById('payment-confirm-btn');
  if (confirmButton) {
    // Reset button state
    confirmButton.disabled = true;
    confirmButton.textContent = adjustedAmount > 0 ? `Select $${adjustedAmount}M` : 'Confirm (No Payment Required)';
    
    // Replace to remove existing listeners
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    
    // Add new listener
    newConfirmButton.addEventListener('click', function() {
      window.MonopolyDeal.processSelectedPayment();
    });
  }
  
  // Clear and populate payment containers
  window.MonopolyDeal.populatePaymentSelectionContainers();
  
  // Display the modal
  paymentModal.style.display = 'flex';
  
  // Add ESC key prevention
  const escKeyHandler = function(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      window.MonopolyDeal.showTemporaryMessage('You must complete the payment before closing this window.', 3000);
    }
  };
  document.addEventListener('keydown', escKeyHandler);
  
  // Store the handler for removal when payment is complete
  window.MonopolyDeal.gameState.escKeyHandler = escKeyHandler;
};

// Populate the payment containers with selectable assets
window.MonopolyDeal.populatePaymentSelectionContainers = function() {
  console.log('Populating payment selection containers...');
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) return;
  
  const fromPlayer = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
  
  // Get containers
  const moneyContainer = document.getElementById('payment-money-container');
  const propertiesContainer = document.getElementById('payment-properties-container');
  
  // Clear containers
  if (moneyContainer) moneyContainer.innerHTML = '';
  if (propertiesContainer) propertiesContainer.innerHTML = '';
  
  // Handle money cards
  if (fromPlayer.money.length === 0) {
    moneyContainer.innerHTML = '<div class="empty-message">No money cards available.</div>';
  } else {
    // Group money cards by denomination
    const denominations = [1, 2, 3, 4, 5, 10];
    const denominationGroups = {};
    
    // Initialize denomination groups
    denominations.forEach(value => {
      denominationGroups[value] = {
        cards: [],
        count: 0,
        selectedCount: 0
      };
    });
    
    // Group money cards by value
    fromPlayer.money.forEach((card, index) => {
      const value = parseInt(card.value);
      if (denominationGroups[value]) {
        denominationGroups[value].cards.push({
          card: card,
          index: index,
          selected: window.MonopolyDeal.gameState.selectedPaymentAssets.money.includes(index)
        });
        
        denominationGroups[value].count++;
        
        if (window.MonopolyDeal.gameState.selectedPaymentAssets.money.includes(index)) {
          denominationGroups[value].selectedCount++;
        }
      }
    });
    
    // Create denomination boxes for payment selection
    denominations.forEach(value => {
      if (denominationGroups[value].count > 0) {
        const denominationBox = document.createElement('div');
        denominationBox.className = 'money-denomination-box payment-denomination-box';
        denominationBox.style.backgroundColor = window.MonopolyDeal.getMoneyColor(value);
        
        // Add value
        const valueElement = document.createElement('div');
        valueElement.className = 'money-denomination-value';
        valueElement.textContent = `$${value}M`;
        denominationBox.appendChild(valueElement);
        
        // Add count
        const countElement = document.createElement('div');
        countElement.className = 'money-denomination-count';
        countElement.textContent = `Available: ${denominationGroups[value].count}`;
        denominationBox.appendChild(countElement);
        
        // Add selection controls
        const controlsElement = document.createElement('div');
        controlsElement.className = 'payment-selection-controls';
        
        // Decrement button
        const decrementButton = document.createElement('button');
        decrementButton.className = 'selection-button decrement';
        decrementButton.textContent = '-';
        decrementButton.disabled = denominationGroups[value].selectedCount === 0;
        decrementButton.addEventListener('click', function(event) {
          event.stopPropagation(); // Prevent event bubbling
          
          if (denominationGroups[value].selectedCount > 0) {
            // Find and deselect one card of this denomination
            for (let i = 0; i < denominationGroups[value].cards.length; i++) {
              const cardInfo = denominationGroups[value].cards[i];
              if (cardInfo.selected) {
                // Update the selected state
                cardInfo.selected = false;
                denominationGroups[value].selectedCount--;
                
                // Remove from the global selected assets array
                const index = window.MonopolyDeal.gameState.selectedPaymentAssets.money.indexOf(cardInfo.index);
                if (index !== -1) {
                  window.MonopolyDeal.gameState.selectedPaymentAssets.money.splice(index, 1);
                }
                
                // Update UI without calling togglePaymentAsset
                selectionCount.textContent = denominationGroups[value].selectedCount;
                decrementButton.disabled = denominationGroups[value].selectedCount === 0;
                incrementButton.disabled = denominationGroups[value].selectedCount >= denominationGroups[value].count;
                
                // Update payment amount display directly
                const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
                const adjustedAmount = paymentRequest.adjustedAmount || paymentRequest.amount;
                const hasFullAmount = selectedTotal >= adjustedAmount;
                
                // Update current amount element
                const currentAmountElement = document.getElementById('payment-current-amount');
                if (currentAmountElement) {
                  currentAmountElement.textContent = selectedTotal;
                  const parentElement = currentAmountElement.parentElement;
                  if (parentElement) {
                    parentElement.style.color = hasFullAmount ? '#4CAF50' : '#f44336';
                  }
                }
                
                // Update progress bar
                const progressBar = document.getElementById('payment-progress-bar');
                if (progressBar) {
                  const progressPercentage = adjustedAmount <= 0 ? 100 : Math.min(100, (selectedTotal / adjustedAmount) * 100);
                  progressBar.style.width = `${progressPercentage}%`;
                  if (hasFullAmount) {
                    progressBar.classList.add('sufficient');
                  } else {
                    progressBar.classList.remove('sufficient');
                  }
                }
                
                // Update confirm button
                const confirmButton = document.getElementById('payment-confirm-btn');
                if (confirmButton) {
                  if (adjustedAmount <= 0) {
                    confirmButton.disabled = false;
                    confirmButton.textContent = 'Confirm (No Payment Required)';
                  } else {
                    confirmButton.disabled = !hasFullAmount;
                    confirmButton.textContent = hasFullAmount ? 'Pay' : `Select $${adjustedAmount}M`;
                  }
                }
                
                break;
              }
            }
          }
        });
        
        // Selection count
        const selectionCount = document.createElement('span');
        selectionCount.className = 'selection-count';
        selectionCount.textContent = denominationGroups[value].selectedCount;
        
        // Increment button
        const incrementButton = document.createElement('button');
        incrementButton.className = 'selection-button increment';
        incrementButton.textContent = '+';
        incrementButton.disabled = denominationGroups[value].selectedCount >= denominationGroups[value].count;
        incrementButton.addEventListener('click', function(event) {
          event.stopPropagation(); // Prevent event bubbling
          
          if (denominationGroups[value].selectedCount < denominationGroups[value].count) {
            // Find and select one unselected card of this denomination
            for (let i = 0; i < denominationGroups[value].cards.length; i++) {
              const cardInfo = denominationGroups[value].cards[i];
              if (!cardInfo.selected) {
                // Update the selected state
                cardInfo.selected = true;
                denominationGroups[value].selectedCount++;
                
                // Add to the global selected assets array
                window.MonopolyDeal.gameState.selectedPaymentAssets.money.push(cardInfo.index);
                
                // Update UI without calling togglePaymentAsset
                selectionCount.textContent = denominationGroups[value].selectedCount;
                decrementButton.disabled = denominationGroups[value].selectedCount === 0;
                incrementButton.disabled = denominationGroups[value].selectedCount >= denominationGroups[value].count;
                
                // Update payment amount display directly
                const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
                const adjustedAmount = paymentRequest.adjustedAmount || paymentRequest.amount;
                const hasFullAmount = selectedTotal >= adjustedAmount;
                
                // Update current amount element
                const currentAmountElement = document.getElementById('payment-current-amount');
                if (currentAmountElement) {
                  currentAmountElement.textContent = selectedTotal;
                  const parentElement = currentAmountElement.parentElement;
                  if (parentElement) {
                    parentElement.style.color = hasFullAmount ? '#4CAF50' : '#f44336';
                  }
                }
                
                // Update progress bar
                const progressBar = document.getElementById('payment-progress-bar');
                if (progressBar) {
                  const progressPercentage = adjustedAmount <= 0 ? 100 : Math.min(100, (selectedTotal / adjustedAmount) * 100);
                  progressBar.style.width = `${progressPercentage}%`;
                  if (hasFullAmount) {
                    progressBar.classList.add('sufficient');
                  } else {
                    progressBar.classList.remove('sufficient');
                  }
                }
                
                // Update confirm button
                const confirmButton = document.getElementById('payment-confirm-btn');
                if (confirmButton) {
                  if (adjustedAmount <= 0) {
                    confirmButton.disabled = false;
                    confirmButton.textContent = 'Confirm (No Payment Required)';
                  } else {
                    confirmButton.disabled = !hasFullAmount;
                    confirmButton.textContent = hasFullAmount ? 'Pay' : `Select $${adjustedAmount}M`;
                  }
                }
                
                break;
              }
            }
          }
        });
        
        controlsElement.appendChild(decrementButton);
        controlsElement.appendChild(selectionCount);
        controlsElement.appendChild(incrementButton);
        
        denominationBox.appendChild(controlsElement);
        moneyContainer.appendChild(denominationBox);
      }
    });
  }
  
  // Check if player has any property cards
  let hasProperties = false;
  for (const color in fromPlayer.properties) {
    if (fromPlayer.properties[color] && fromPlayer.properties[color].length > 0) {
      hasProperties = true;
      break;
    }
  }
  
  if (!hasProperties) {
    propertiesContainer.innerHTML = '<div class="empty-message">No property cards available.</div>';
    return;
  }
  
  // Add property cards
  for (const color in fromPlayer.properties) {
    const properties = fromPlayer.properties[color];
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      
      // Skip 10-way wildcard properties (completely - don't even show them)
      if (property.wildcard && property.originalColors && 
          (property.originalColors.includes('any') || property.originalColors[0] === 'any')) {
        // Skip this property entirely
        continue;
      }
      
      // Create selectable property card
      const cardElement = document.createElement('div');
      cardElement.className = `card property-card ${color}-property payment-selectable`;
      
      // Check if property is already selected
      const isSelected = window.MonopolyDeal.gameState.selectedPaymentAssets.properties.some(
        p => p.color === color && p.index === i
      );
      
      if (isSelected) {
        cardElement.classList.add('payment-selected');
      }
      
      // Use image path if available
      const imagePath = window.MonopolyDeal.getCardImagePath(property);
      if (imagePath) {
        cardElement.style.backgroundImage = `url('${imagePath}')`;
        cardElement.style.backgroundSize = 'cover';
        cardElement.style.backgroundPosition = 'center';
        cardElement.style.backgroundRepeat = 'no-repeat';
      } else {
        // Fallback to text display if image not available
        cardElement.innerHTML = `
          <div class="property-name">${property.name}</div>
          <div class="property-value">$${property.value}M</div>`;
      }
      
      // Add selection overlay
      const overlay = document.createElement('div');
      overlay.className = 'payment-overlay';
      overlay.textContent = `$${property.value}M`;
      cardElement.appendChild(overlay);
      
      // Add click handler for property selection
      cardElement.addEventListener('click', function() {
        // Toggle property selection
        const isSelected = cardElement.classList.contains('payment-selected');
        
        if (isSelected) {
          // Unselect property
          cardElement.classList.remove('payment-selected');
          
          // Remove from selected assets
          const assetIndex = window.MonopolyDeal.gameState.selectedPaymentAssets.properties.findIndex(
            p => p.color === color && p.index === i
          );
          
          if (assetIndex !== -1) {
            window.MonopolyDeal.gameState.selectedPaymentAssets.properties.splice(assetIndex, 1);
          }
        } else {
          // Select property
          cardElement.classList.add('payment-selected');
          
          // Add to selected assets
          window.MonopolyDeal.gameState.selectedPaymentAssets.properties.push({
            color: color,
            index: i
          });
        }
        
        // Update payment amount display directly
        const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
        const adjustedAmount = paymentRequest.adjustedAmount || paymentRequest.amount;
        const hasFullAmount = selectedTotal >= adjustedAmount;
        
        // Update current amount element
        const currentAmountElement = document.getElementById('payment-current-amount');
        if (currentAmountElement) {
          currentAmountElement.textContent = selectedTotal;
          const parentElement = currentAmountElement.parentElement;
          if (parentElement) {
            parentElement.style.color = hasFullAmount ? '#4CAF50' : '#f44336';
          }
        }
        
        // Update progress bar
        const progressBar = document.getElementById('payment-progress-bar');
        if (progressBar) {
          const progressPercentage = adjustedAmount <= 0 ? 100 : Math.min(100, (selectedTotal / adjustedAmount) * 100);
          progressBar.style.width = `${progressPercentage}%`;
          if (hasFullAmount) {
            progressBar.classList.add('sufficient');
          } else {
            progressBar.classList.remove('sufficient');
          }
        }
        
        // Update confirm button
        const confirmButton = document.getElementById('payment-confirm-btn');
        if (confirmButton) {
          if (adjustedAmount <= 0) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'Confirm (No Payment Required)';
          } else {
            confirmButton.disabled = !hasFullAmount;
            confirmButton.textContent = hasFullAmount ? 'Pay' : `Select $${adjustedAmount}M`;
          }
        }
      });
      
      propertiesContainer.appendChild(cardElement);
    }
  }
};

// Process the selected payment assets
window.MonopolyDeal.processSelectedPayment = function() {
  console.log('Processing selected payment assets...');
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) {
    console.error('No payment request found!');
    return;
  }
  
  const fromPlayer = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
  const toPlayer = window.MonopolyDeal.gameState.players[paymentRequest.toPlayer];
  
  if (!fromPlayer || !toPlayer) {
    console.error('Invalid player in payment request!');
    return;
  }
  
  // Calculate total payment amount
  const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
  
  // Use adjusted amount (minimum of requested and available)
  const adjustedAmount = paymentRequest.adjustedAmount || paymentRequest.amount;
  
  console.log(`Selected payment total: $${selectedTotal}M of $${adjustedAmount}M required (originally $${paymentRequest.amount}M)`);
  
  // Transfer selected assets (even if insufficient)
  console.log(`Transferring ${window.MonopolyDeal.gameState.selectedPaymentAssets.money.length} money cards and ${window.MonopolyDeal.gameState.selectedPaymentAssets.properties.length} property cards`);
  
  // Sort indices in descending order so we remove from back to front
  const moneyIndices = [...window.MonopolyDeal.gameState.selectedPaymentAssets.money].sort((a, b) => b - a);
  
  // Transfer money cards
  moneyIndices.forEach(index => {
    if (fromPlayer.money[index]) {
      // Get the card
      const moneyCard = fromPlayer.money[index];
      
      // Add to receiver's money pile
      toPlayer.money.push(moneyCard);
      
      // Remove from sender's money array
      fromPlayer.money.splice(index, 1);
      
      console.log(`Transferred money card worth $${moneyCard.value}M from Player ${paymentRequest.fromPlayer} to Player ${paymentRequest.toPlayer}`);
    }
  });
  
  // Transfer property cards (if any)
  const propertyTransfers = [...window.MonopolyDeal.gameState.selectedPaymentAssets.properties];
  propertyTransfers.forEach(prop => {
    const color = prop.color;
    const index = prop.index;
    
    if (fromPlayer.properties[color] && fromPlayer.properties[color][index]) {
      // Get the property card
      const propertyCard = fromPlayer.properties[color][index];
      
      // Ensure the receiver has a property array for this color
      if (!toPlayer.properties[color]) {
        toPlayer.properties[color] = [];
      }
      
      // Add to receiver
      toPlayer.properties[color].push(propertyCard);
      
      // Remove from sender
      fromPlayer.properties[color].splice(index, 1);
      
      console.log(`Transferred ${color} property "${propertyCard.name}" worth $${propertyCard.value}M from Player ${paymentRequest.fromPlayer} to Player ${paymentRequest.toPlayer}`);
    }
  });
  
  // Check if any wildcards need to be reassigned (when they're left alone in a set)
  window.MonopolyDeal.handleWildcardReassignment(paymentRequest.fromPlayer);
  
  // Remove ESC key handler
  if (window.MonopolyDeal.gameState.escKeyHandler) {
    document.removeEventListener('keydown', window.MonopolyDeal.gameState.escKeyHandler);
    window.MonopolyDeal.gameState.escKeyHandler = null;
  }
  
  // Close payment modal
  const paymentModal = document.getElementById('payment-modal');
  if (paymentModal) {
    paymentModal.style.display = 'none';
  }
  
  // Remove any payment notifications
  const notification = document.querySelector('.payment-notification');
  if (notification) {
    notification.remove();
  }
  
  // Restore the original perspective
  if (window.MonopolyDeal.gameState.perspectiveBeforePayment !== undefined) {
    window.MonopolyDeal.currentPerspective = window.MonopolyDeal.gameState.perspectiveBeforePayment;
    window.MonopolyDeal.gameState.perspectiveBeforePayment = undefined;
  }
  
  // Reset payment state
  window.MonopolyDeal.gameState.paymentPending = false;
  window.MonopolyDeal.gameState.paymentMode = false;
  window.MonopolyDeal.gameState.paymentRequest = null;
  window.MonopolyDeal.gameState.selectedPaymentAssets = {
    money: [],
    properties: []
  };
  
  // Update UI for both players
  window.MonopolyDeal.updatePlayerMoneyUI(paymentRequest.fromPlayer);
  window.MonopolyDeal.updatePlayerPropertiesUI(paymentRequest.fromPlayer);
  window.MonopolyDeal.updatePlayerMoneyUI(paymentRequest.toPlayer);
  window.MonopolyDeal.updatePlayerPropertiesUI(paymentRequest.toPlayer);
  
  // Update game status based on payment amount and adjusted amount
  if (selectedTotal < adjustedAmount) {
    window.MonopolyDeal.updateGameStatus(`Player ${paymentRequest.fromPlayer} made a partial payment of $${selectedTotal}M to Player ${paymentRequest.toPlayer} (short by $${adjustedAmount - selectedTotal}M)`);
    window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} made a partial payment of $${selectedTotal}M to Player ${paymentRequest.toPlayer}`);
  } else if (adjustedAmount < paymentRequest.amount) {
    window.MonopolyDeal.updateGameStatus(`Player ${paymentRequest.fromPlayer} paid $${selectedTotal}M to Player ${paymentRequest.toPlayer} (max possible of $${paymentRequest.amount}M requested)`);
    window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} paid $${selectedTotal}M to Player ${paymentRequest.toPlayer} (maximum possible amount)`);
  } else {
    window.MonopolyDeal.updateGameStatus(`Player ${paymentRequest.fromPlayer} paid $${selectedTotal}M to Player ${paymentRequest.toPlayer}`);
    window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} paid $${selectedTotal}M to Player ${paymentRequest.toPlayer}`);
  }
  
  // Complete the action response flow
  window.MonopolyDeal.completeActionResponse();
  
  // Update all UIs after perspective change
  window.MonopolyDeal.updateAllPlayerUIs();
  
  return true;
};

// Toggle selection of an asset for payment
window.MonopolyDeal.togglePaymentAsset = function(assetType, index, color = null) {
  console.log(`Toggling payment asset: ${assetType}, index ${index}, color ${color}`);
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) {
    console.error('No payment request found!');
    return;
  }
  
  // Handle money assets
  if (assetType === 'money') {
    const assetIndex = window.MonopolyDeal.gameState.selectedPaymentAssets.money.indexOf(index);
    if (assetIndex === -1) {
      // Not selected, add it
      window.MonopolyDeal.gameState.selectedPaymentAssets.money.push(index);
      console.log(`Selected money card at index ${index}`);
    } else {
      // Already selected, remove it
      window.MonopolyDeal.gameState.selectedPaymentAssets.money.splice(assetIndex, 1);
      console.log(`Deselected money card at index ${index}`);
    }
  }
  // Handle property assets
  else if (assetType === 'property' && color) {
    const assetIndex = window.MonopolyDeal.gameState.selectedPaymentAssets.properties.findIndex(
      p => p.color === color && p.index === index
    );
    
    if (assetIndex === -1) {
      // Not selected, add it
      window.MonopolyDeal.gameState.selectedPaymentAssets.properties.push({
        color: color,
        index: index
      });
      console.log(`Selected ${color} property at index ${index}`);
    } else {
      // Already selected, remove it
      window.MonopolyDeal.gameState.selectedPaymentAssets.properties.splice(assetIndex, 1);
      console.log(`Deselected ${color} property at index ${index}`);
    }
  }
  
  // Calculate the new total
  const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
  
  // Directly update the payment-current element to immediately reflect the total
  const currentElement = document.getElementById('payment-current');
  if (currentElement) {
    currentElement.textContent = `$${selectedTotal}M`;
    
    // Also update the color based on whether the amount is sufficient
    const adjustedAmount = paymentRequest.adjustedAmount || paymentRequest.amount;
    const hasFullAmount = selectedTotal >= adjustedAmount;
    
    if (hasFullAmount) {
      currentElement.style.color = '#4CAF50'; // Green color for sufficient amount
    } else {
      currentElement.style.color = '#f44336'; // Red color for insufficient amount
    }
  }
  
  // Update progress bar
  const progressBar = document.getElementById('payment-progress-bar');
  if (progressBar) {
    // Avoid division by zero if adjusted amount is 0
    const adjustedAmount = paymentRequest.adjustedAmount || paymentRequest.amount;
    const progressPercentage = adjustedAmount <= 0 ? 100 : Math.min(100, (selectedTotal / adjustedAmount) * 100);
    progressBar.style.width = `${progressPercentage}%`;
    
    if (selectedTotal >= adjustedAmount) {
      progressBar.classList.add('sufficient');
    } else {
      progressBar.classList.remove('sufficient');
    }
  }
  
  // Update confirm button state
  const confirmButton = document.getElementById('payment-confirm-btn');
  if (confirmButton) {
    const adjustedAmount = paymentRequest.adjustedAmount || paymentRequest.amount;
    const hasFullAmount = selectedTotal >= adjustedAmount;
    
    // If adjusted amount is 0, enable button as no payment is needed
    if (adjustedAmount <= 0) {
      confirmButton.disabled = false;
      confirmButton.textContent = 'Confirm (No Payment Required)';
    } else {
      confirmButton.disabled = !hasFullAmount;
      confirmButton.textContent = hasFullAmount ? 'Pay' : `Select $${adjustedAmount}M`;
    }
  }
  
  // Log current total to console
  console.log(`Current payment selection total: $${selectedTotal}M of $${paymentRequest.adjustedAmount || paymentRequest.amount}M required`);
};

// Update the payment UI elements
window.MonopolyDeal.updatePaymentUI = function() {
  console.log('Updating payment UI...');
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) return;
  
  // Get selected total
  const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
  console.log(`Payment UI update - selected total: $${selectedTotal}M`);
  
  // Use the adjusted amount (minimum of requested and available) instead of original amount
  const adjustedAmount = paymentRequest.adjustedAmount || paymentRequest.amount;
  const hasFullAmount = selectedTotal >= adjustedAmount;
  
  // Update current amount and apply appropriate color
  const currentElement = document.getElementById('payment-current');
  if (currentElement) {
    // Ensure the text content is updated with the current total
    currentElement.textContent = `$${selectedTotal}M`;
    console.log(`Updated payment-current to: $${selectedTotal}M`);
    
    // Set color based on whether the amount is sufficient
    if (hasFullAmount) {
      currentElement.style.color = '#4CAF50'; // Green color for sufficient amount
      console.log('Set payment amount color to green (sufficient)');
    } else {
      currentElement.style.color = '#f44336'; // Red color for insufficient amount
      console.log('Set payment amount color to red (insufficient)');
    }
  } else {
    console.error('payment-current element not found!');
  }
  
  // Update required amount - use adjusted amount
  const requiredAmountElement = document.getElementById('payment-required-amount');
  if (requiredAmountElement) {
    requiredAmountElement.textContent = adjustedAmount;
  }
  
  // Update progress bar
  const progressBar = document.getElementById('payment-progress-bar');
  if (progressBar) {
    // Avoid division by zero if adjusted amount is 0
    const progressPercentage = adjustedAmount <= 0 ? 100 : Math.min(100, (selectedTotal / adjustedAmount) * 100);
    progressBar.style.width = `${progressPercentage}%`;
    
    if (hasFullAmount) {
      progressBar.classList.add('sufficient');
    } else {
      progressBar.classList.remove('sufficient');
    }
  }
  
  // Update confirm button state - only enable when full amount is selected
  const confirmButton = document.getElementById('payment-confirm-btn');
  if (confirmButton) {
    // If adjusted amount is 0, enable button as no payment is needed
    if (adjustedAmount <= 0) {
      confirmButton.disabled = false;
      confirmButton.textContent = 'Confirm (No Payment Required)';
    } else {
      confirmButton.disabled = !hasFullAmount;
      confirmButton.textContent = hasFullAmount ? 'Pay' : `Select $${adjustedAmount}M`;
    }
  }
};

// Update the payment confirm button state based on selected total
window.MonopolyDeal.updatePaymentButtonState = function() {
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) return;
  
  // Calculate selected total
  const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
  const hasSelection = selectedTotal > 0;
  
  // Use adjusted amount
  const adjustedAmount = paymentRequest.adjustedAmount || paymentRequest.amount;
  const hasFullAmount = selectedTotal >= adjustedAmount;
  
  // Update payment status display in case we still have payment-selected-amount element
  const selectedAmountElement = document.getElementById('payment-selected-amount');
  if (selectedAmountElement) {
    selectedAmountElement.textContent = selectedTotal;
    
    // Set color based on whether the amount is sufficient
    if (hasFullAmount) {
      selectedAmountElement.parentElement.style.color = '#4CAF50'; // Green color for sufficient amount
    } else {
      selectedAmountElement.parentElement.style.color = '#f44336'; // Red color for insufficient amount
    }
  }
  
  const requiredAmountElement = document.getElementById('payment-required-amount');
  if (requiredAmountElement) {
    requiredAmountElement.textContent = adjustedAmount;
  }
  
  // Ensure payment-current-amount is also updated
  const currentAmountElement = document.getElementById('payment-current-amount');
  if (currentAmountElement) {
    currentAmountElement.textContent = selectedTotal;
    
    // Set color based on whether the amount is sufficient
    if (hasFullAmount) {
      currentAmountElement.parentElement.style.color = '#4CAF50'; // Green color for sufficient amount
    } else {
      currentAmountElement.parentElement.style.color = '#f44336'; // Red color for insufficient amount
    }
  }
  
  // Update progress bar
  const progressBar = document.getElementById('payment-progress-bar');
  if (progressBar) {
    const percentage = Math.min(100, (selectedTotal / adjustedAmount) * 100);
    progressBar.style.width = `${percentage}%`;
    
    if (selectedTotal >= adjustedAmount) {
      progressBar.classList.add('sufficient');
    } else {
      progressBar.classList.remove('sufficient');
    }
  }
  
  // Find confirm button in the payment modal
  const confirmButton = document.getElementById('payment-confirm-btn');
  if (confirmButton) {
    // Allow payment if any assets are selected, not just if full amount is selected
    if (hasSelection) {
      confirmButton.disabled = false;
      
      if (selectedTotal >= adjustedAmount) {
        confirmButton.textContent = `Send Full Payment ($${selectedTotal}M)`;
      } else {
        confirmButton.textContent = `Send Partial Payment ($${selectedTotal}M of $${adjustedAmount}M)`;
      }
    } else {
      confirmButton.disabled = true;
      confirmButton.textContent = 'Select Assets to Pay';
    }
  }
};

// Calculate the total value of selected payment assets
window.MonopolyDeal.calculateSelectedPaymentTotal = function() {
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) return 0;
  
  const fromPlayer = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
  let total = 0;
  
  // Add up money card values
  window.MonopolyDeal.gameState.selectedPaymentAssets.money.forEach(index => {
    if (fromPlayer.money[index]) {
      total += fromPlayer.money[index].value;
    }
  });
  
  // Add up property card values
  window.MonopolyDeal.gameState.selectedPaymentAssets.properties.forEach(property => {
    const { color, index } = property;
    if (fromPlayer.properties[color] && fromPlayer.properties[color][index]) {
      total += fromPlayer.properties[color][index].value;
    }
  });
  
  return total;
};

// Show a temporary message on the screen
window.MonopolyDeal.showTemporaryMessage = function(message, duration = 2000) {
  // Create or use existing message element
  let messageElement = document.getElementById('temporary-message');
  
  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.id = 'temporary-message';
    document.body.appendChild(messageElement);
  }
  
  // Set message and show
  messageElement.textContent = message;
  messageElement.className = 'temporary-message visible';
  
  // Hide after duration
  setTimeout(() => {
    messageElement.className = 'temporary-message';
  }, duration);
};

// Update payment status indicators in the money and property sections
window.MonopolyDeal.updatePaymentStatusIndicators = function(playerNumber, stillNeeded, hasSelectedAssets, isPaymentSufficient) {
  console.log(`Updating payment status indicators for player ${playerNumber}, still needed: $${stillNeeded}M, sufficient: ${isPaymentSufficient}, has selected assets: ${hasSelectedAssets}`);
  
  // Get the correct elements based on perspective and player number
  let moneyElement, propertiesElement;
  
  if (playerNumber === window.MonopolyDeal.currentPerspective) {
    moneyElement = document.getElementById('player-money');
    propertiesElement = document.getElementById('player-properties');
    console.log('Using player money and properties elements (current perspective)');
  } else {
    moneyElement = document.getElementById('opponent-money');
    propertiesElement = document.getElementById('opponent-properties');
    console.log('Using opponent money and properties elements (not current perspective)');
  }
  
  // Remove existing status indicators
  const existingIndicators = document.querySelectorAll('.payment-status-indicator');
  existingIndicators.forEach(element => {
    console.log('Removing existing status indicator:', element);
    element.remove();
  });
  
  if (playerNumber !== window.MonopolyDeal.currentPerspective) {
    console.log('Not adding indicators for non-current perspective');
    return; // Don't add indicators if we're not in the paying player's perspective
  }
  
  // Create status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.className = 'payment-status-indicator';
  
  if (isPaymentSufficient) {
    // Full payment
    statusIndicator.className += ' payment-status-sufficient';
    statusIndicator.textContent = 'Payment amount satisfied! Click "Confirm Payment" to proceed.';
    console.log('Created sufficient payment status indicator');
  } else if (hasSelectedAssets) {
    // Partial payment
    statusIndicator.className += ' payment-status-partial';
    statusIndicator.textContent = `Partial payment selected. Click "Pay Partial Amount" to proceed or select $${stillNeeded}M more for full payment.`;
    console.log('Created partial payment status indicator');
  } else {
    // No assets selected
    statusIndicator.className += ' payment-status-insufficient';
    statusIndicator.textContent = `Select assets worth at least $1M to begin payment.`;
    console.log('Created insufficient payment status indicator');
  }
  
  // Add the indicator to the money element
  if (moneyElement) {
    moneyElement.parentNode.insertBefore(statusIndicator, moneyElement);
    console.log('Added status indicator before money element');
  }
};

// End the current player's turn
window.MonopolyDeal.endTurn = function() {
  console.log('Ending turn...');
  if (!window.MonopolyDeal.gameState.gameStarted) {
    console.warn('Game not started');
    return false;
  }
  
  if (!window.MonopolyDeal.gameState.hasDrawnCards) {
    console.warn('Cards not drawn yet');
    window.MonopolyDeal.updateGameStatus('You must draw cards before ending your turn');
    return false;
  }
  
  // Check if payment is pending
  if (window.MonopolyDeal.gameState.paymentPending) {
    console.warn('Payment is pending');
    window.MonopolyDeal.updateGameStatus('Cannot end turn while payment is pending');
    return false;
  }
  
  const currentPlayer = window.MonopolyDeal.gameState.currentPlayer;
  const playerHand = window.MonopolyDeal.gameState.players[currentPlayer].hand;
  
  // Check if the player has more than 7 cards
  if (playerHand.length > 7) {
    console.log(`Player ${currentPlayer} has ${playerHand.length} cards, needs to discard down to 7`);
    window.MonopolyDeal.updateGameStatus(`You have ${playerHand.length} cards. Please discard down to 7 cards.`);
    window.MonopolyDeal.addToHistory(`Player ${currentPlayer} needs to discard ${playerHand.length - 7} cards`);
    
    // Enable discard mode
    window.MonopolyDeal.gameState.discardMode = true;
    window.MonopolyDeal.gameState.cardsToDiscard = playerHand.length - 7;
    
    // Update UI to show discard mode
    window.MonopolyDeal.updatePlayerHandUI(currentPlayer);
    
    // We don't end the turn yet
    return false;
  }
  
  // If we get here, player doesn't need to discard or has finished discarding
  
  // Switch to the other player
  window.MonopolyDeal.gameState.currentPlayer = (window.MonopolyDeal.gameState.currentPlayer === 1) ? 2 : 1;
  
  // Reset turn state
  window.MonopolyDeal.gameState.hasDrawnCards = false;
  window.MonopolyDeal.gameState.cardsPlayedThisTurn = 0;
  window.MonopolyDeal.gameState.discardMode = false;
  window.MonopolyDeal.gameState.cardsToDiscard = 0;
  
  // Update actions left counter
  window.MonopolyDeal.updateActionsLeftCounter();
  
  // Update UI
  if (window.MonopolyDeal.elements.drawButton) {
    window.MonopolyDeal.elements.drawButton.disabled = false;
  }
  if (window.MonopolyDeal.elements.endTurnButton) {
    window.MonopolyDeal.elements.endTurnButton.disabled = true;
  }
  
  window.MonopolyDeal.updateGameStatus(`Player ${window.MonopolyDeal.gameState.currentPlayer}'s turn. Draw 2 cards to start your turn`);
  window.MonopolyDeal.addToHistory(`Player ${window.MonopolyDeal.gameState.currentPlayer}'s turn begins`);
  
  return true;
};

// Discard a card from hand (used during forced discard at end of turn)
window.MonopolyDeal.discardCard = function(playerNumber, cardId) {
  console.log(`Discarding card ${cardId} for player ${playerNumber}...`);
  
  // Verify discard mode is active
  if (!window.MonopolyDeal.gameState.discardMode) {
    console.warn('Not in discard mode');
    return;
  }
  
  // Verify correct player is discarding
  if (playerNumber !== window.MonopolyDeal.gameState.currentPlayer) {
    console.warn(`Not player ${playerNumber}'s turn to discard`);
    return;
  }
  
  // Find card in player's hand
  const playerHand = window.MonopolyDeal.gameState.players[playerNumber].hand;
  const cardIndex = playerHand.findIndex(c => c.id === cardId);
  
  if (cardIndex === -1) {
    console.warn(`Card ${cardId} not found in player ${playerNumber}'s hand`);
    return;
  }
  
  // Remove card from hand and add to discard pile
  const card = playerHand.splice(cardIndex, 1)[0];
  window.MonopolyDeal.gameState.discardPile.push(card);
  
  // If it's an action card, place it on the action pile
  if (card.type === 'action') {
    window.MonopolyDeal.placeActionCard(card);
  }
  
  // Decrement cards to discard counter
  window.MonopolyDeal.gameState.cardsToDiscard--;
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  
  if (window.MonopolyDeal.gameState.cardsToDiscard > 0) {
    window.MonopolyDeal.updateGameStatus(`Discarded ${card.type} card. ${window.MonopolyDeal.gameState.cardsToDiscard} more to discard.`);
  } else {
    window.MonopolyDeal.updateGameStatus(`Discarded final card. Turn ended.`);
  }
  
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} discarded a ${card.type} card`);
  
  // Check if we've discarded enough cards
  if (window.MonopolyDeal.gameState.cardsToDiscard === 0) {
    window.MonopolyDeal.gameState.discardMode = false;
    
    // Clear the discard message first with an empty update
    window.MonopolyDeal.updateGameStatus('');
    
    // Remove the discard notification banner
    const discardInfo = document.querySelector('.discard-info');
    if (discardInfo) {
      discardInfo.remove();
    }
    
    // End the turn immediately without delay
    window.MonopolyDeal.endTurn();
  }
};

// Check win condition for a player
window.MonopolyDeal.checkWinCondition = function(playerNumber) {
  console.log(`Checking win condition for player ${playerNumber}...`);
  const completeSets = window.MonopolyDeal.countCompleteSets(playerNumber);
  
  console.log(`Player ${playerNumber} has ${completeSets} complete sets`);
  
  if (completeSets >= 3) {
    window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} wins the game with ${completeSets} complete sets!`);
    window.MonopolyDeal.addToHistory(`Player ${playerNumber} wins the game with ${completeSets} complete sets!`);
    
    // Disable further play
    window.MonopolyDeal.gameState.gameStarted = false;
    
    if (window.MonopolyDeal.elements.drawButton) {
      window.MonopolyDeal.elements.drawButton.disabled = true;
    }
    if (window.MonopolyDeal.elements.endTurnButton) {
      window.MonopolyDeal.elements.endTurnButton.disabled = true;
    }
    
    return true;
  }
  
  return false;
};

// Count the number of complete property sets a player has
window.MonopolyDeal.countCompleteSets = function(playerNumber) {
  console.log(`Counting complete sets for player ${playerNumber}...`);
  const propertyGroups = window.MonopolyDeal.gameState.players[playerNumber].properties;
  let completeSets = 0;
  
  // Required number of properties for a complete set
  const requiredProperties = {
    'brown': 2,
    'blue': 2,
    'green': 3,
    'red': 3,
    'yellow': 3,
    'orange': 3,
    'pink': 3,
    'light-blue': 3,
    'utility': 2,
    'railroad': 4
  };
  
  // Check each color group
  Object.entries(propertyGroups).forEach(([color, properties]) => {
    if (properties.length >= requiredProperties[color]) {
      completeSets++;
      console.log(`Player ${playerNumber} has a complete set of ${color} properties`);
    }
  });
  
  return completeSets;
};

// Update UI functions
window.MonopolyDeal.updatePlayerHandUI = function(playerNumber) {
  console.log(`Updating hand UI for player ${playerNumber}...`);
  
  // Always use current-player-hand for the active perspective's cards
  const currentPerspectiveHandElement = window.MonopolyDeal.elements.currentPlayerHand;
  
  // Update the hidden hand container for data consistency
  // This ensures the data is kept up to date even if not shown
  const hiddenHandElement = playerNumber === 1 ? 
    window.MonopolyDeal.elements.opponentHand : 
    window.MonopolyDeal.elements.playerHand;
  
  if (!hiddenHandElement) {
    console.error(`Hidden hand element for player ${playerNumber} not found`);
    return false;
  }
  
  const hand = window.MonopolyDeal.gameState.players[playerNumber].hand;
  hiddenHandElement.innerHTML = '';
  
  // Update card counter
  const cardCounterElement = document.getElementById(playerNumber === 1 ? 'opponent-card-counter' : 'player-card-counter');
  if (cardCounterElement) {
    cardCounterElement.textContent = `(${hand.length} card${hand.length !== 1 ? 's' : ''})`;
  }
  
  // Only show cards in currentPlayerHand if this player's perspective is active
  if (playerNumber === window.MonopolyDeal.currentPerspective) {
    currentPerspectiveHandElement.innerHTML = '';
    console.log(`Showing ${hand.length} actual cards for player ${playerNumber} (current perspective)`);
    
    hand.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.dataset.cardId = card.id;
      
      const imagePath = window.MonopolyDeal.getCardImagePath(card);
      
      // Style based on card type
      if (imagePath) {
        // Use card image
        cardElement.style.backgroundImage = `url('${imagePath}')`;
        cardElement.style.backgroundSize = 'cover';
        cardElement.style.backgroundPosition = 'center';
        cardElement.style.backgroundRepeat = 'no-repeat';
      } else if (card.type === 'money') {
        // Fallback for money cards
        cardElement.className += ' money-card';
        cardElement.style.backgroundColor = window.MonopolyDeal.getMoneyColor(card.value);
        cardElement.innerHTML = `<div class="card-value">$${card.value}M</div>`;
      }
      
      // Handle card click events based on game state
      if (window.MonopolyDeal.gameState.discardMode && 
          playerNumber === window.MonopolyDeal.gameState.currentPlayer && 
          window.MonopolyDeal.currentPerspective === window.MonopolyDeal.gameState.currentPlayer) {
        // In discard mode and current player's perspective
        cardElement.className += ' discard-selectable';
        cardElement.innerHTML += `<div class="discard-overlay">Discard</div>`;
        
        cardElement.addEventListener('click', function() {
          window.MonopolyDeal.discardCard(playerNumber, card.id);
        });
      } else if (playerNumber === window.MonopolyDeal.gameState.currentPlayer && 
                window.MonopolyDeal.currentPerspective === window.MonopolyDeal.gameState.currentPlayer) {
        // Normal play mode and current player's perspective
        cardElement.addEventListener('click', function() {
          window.MonopolyDeal.playCard(playerNumber, card.id);
        });
      } else if (playerNumber === window.MonopolyDeal.gameState.currentPlayer) {
        // Current player but viewing from another perspective
        cardElement.addEventListener('click', function() {
          window.MonopolyDeal.updateGameStatus("You can't play cards from another player's perspective");
        });
      } else {
        // Not current player
        cardElement.addEventListener('click', function() {
          window.MonopolyDeal.updateGameStatus("It's not your turn");
        });
      }
      
      currentPerspectiveHandElement.appendChild(cardElement);
    });
    
    // Add discard mode indicator if needed
    if (window.MonopolyDeal.gameState.discardMode && 
        playerNumber === window.MonopolyDeal.gameState.currentPlayer) {
      const discardInfo = document.createElement('div');
      discardInfo.className = 'discard-info';
      discardInfo.textContent = `Discard ${window.MonopolyDeal.gameState.cardsToDiscard} more cards`;
      currentPerspectiveHandElement.appendChild(discardInfo);
    }
    
    // Update the current hand area title
    const currentHandTitle = document.querySelector('.current-hand-area h2');
    if (currentHandTitle) {
      currentHandTitle.textContent = `Player ${playerNumber}'s Hand (Your View)`;
    }
  } else {
    // If this is not the current perspective, update the card counter in hidden element
    const counterElement = document.createElement('div');
    counterElement.className = 'card-counter';
    counterElement.textContent = `${hand.length} cards`;
    hiddenHandElement.appendChild(counterElement);
  }
  
  return true;
};

window.MonopolyDeal.updatePlayerMoneyUI = function(playerNumber) {
  console.log(`Updating money UI for player ${playerNumber}...`);
  
  // Fixed positions: Player 1 always top, Player 2 always bottom
  let moneyElement, totalElement;
  
  if (playerNumber === 1) {
    // Player 1 is always in opponent area (top)
    moneyElement = document.getElementById('opponent-money');
    totalElement = document.getElementById('opponent-money-total');
    console.log(`Using opponent-money element for Player 1 (top)`);
  } else {
    // Player 2 is always in player area (bottom)
    moneyElement = document.getElementById('player-money');
    totalElement = document.getElementById('player-money-total');
    console.log(`Using player-money element for Player 2 (bottom)`);
  }
  
  if (!moneyElement) {
    console.error(`Money element for player ${playerNumber} not found`);
    return false;
  }
  
  const money = window.MonopolyDeal.gameState.players[playerNumber].money;
  moneyElement.innerHTML = '';
  
  // Check if this player is the one who needs to pay
  const isPaymentPending = window.MonopolyDeal.gameState.paymentPending && 
                           window.MonopolyDeal.gameState.paymentRequest && 
                           window.MonopolyDeal.gameState.paymentRequest.fromPlayer === playerNumber;
  
  const isPaymentRecipient = window.MonopolyDeal.gameState.paymentPending && 
                             window.MonopolyDeal.gameState.paymentRequest && 
                             window.MonopolyDeal.gameState.paymentRequest.toPlayer === playerNumber;
                             
  // Whether this player's perspective is active and they're supposed to pay
  const isPaymentPlayerPerspective = isPaymentPending && 
                                     playerNumber === window.MonopolyDeal.currentPerspective;
  
  // Create a flex container for money section and payment bar
  const flexContainer = document.createElement('div');
  flexContainer.style.display = 'flex';
  flexContainer.style.alignItems = 'center';
  flexContainer.style.width = '100%';
  
  // New simplified horizontal layout structure
  const moneySection = document.createElement('div');
  moneySection.className = 'money-section';
  
  // Add "Money:" label on the left
  const moneyLabel = document.createElement('div');
  moneyLabel.className = 'money-label';
  moneyLabel.textContent = 'Money:';
  moneySection.appendChild(moneyLabel);
  
  // Group money cards by denomination
  const denominations = [1, 2, 3, 4, 5, 10];
  const denominationCounts = {};
  let totalValue = 0;
  
  // Initialize counts to 0 for ALL denominations
  denominations.forEach(value => {
    denominationCounts[value] = {
      count: 0,
      indices: [] // Store indices of cards with this value
    };
  });
  
  // Count card denominations and store indices
  money.forEach((card, index) => {
    const value = parseInt(card.value);
    totalValue += value;
    
    if (denominationCounts[value]) {
      denominationCounts[value].count++;
      denominationCounts[value].indices.push(index);
    }
  });
  
  // Create denomination container (now positioned to the right of the Money label)
  const denominationContainer = document.createElement('div');
  denominationContainer.className = 'money-denomination-container';

  // Check if player has no money and add a placeholder message if needed
  if (money.length === 0 && !isPaymentPlayerPerspective) {
    const emptyMoneyMessage = document.createElement('div');
    emptyMoneyMessage.className = 'empty-money-message';
    emptyMoneyMessage.textContent = 'No money cards';
    denominationContainer.appendChild(emptyMoneyMessage);
  } else {
    // Create boxes for ALL denominations, even if count is 0
    denominations.forEach(value => {
      const box = document.createElement('div');
      box.className = 'money-denomination-box';
      
      // For payment mode, make denomination boxes selectable
      if (isPaymentPlayerPerspective && denominationCounts[value].count > 0) {
        box.classList.add('selectable');
        
        // Check if any cards of this value are already selected
        const selectedCount = window.MonopolyDeal.gameState.selectedPaymentAssets.money.filter(
          index => money[index] && money[index].value === value
        ).length;
        
        if (selectedCount > 0) {
          box.classList.add('selected');
        }
        
        // Add payment selection functionality
        box.addEventListener('click', function() {
          if (!box.classList.contains('selected')) {
            // Select one card of this denomination if none selected
            if (denominationCounts[value].indices.length > 0) {
              window.MonopolyDeal.togglePaymentAsset('money', denominationCounts[value].indices[0]);
            }
          }
        });
        
        // Add selection controls for selecting multiple cards of same denomination
        const selectionControls = document.createElement('div');
        selectionControls.className = 'money-selection-controls';
        
        // Minus button
        const minusBtn = document.createElement('button');
        minusBtn.className = 'money-selection-btn';
        minusBtn.textContent = '-';
        minusBtn.disabled = selectedCount === 0;
        minusBtn.addEventListener('click', function(e) {
          e.stopPropagation(); // Prevent triggering the parent click
          
          // Find a selected index of this denomination and deselect it
          const selectedIndices = window.MonopolyDeal.gameState.selectedPaymentAssets.money.filter(
            index => money[index] && money[index].value === value
          );
          
          if (selectedIndices.length > 0) {
            window.MonopolyDeal.togglePaymentAsset('money', selectedIndices[0]);
          }
        });
        
        // Selected count
        const selectedCountEl = document.createElement('span');
        selectedCountEl.className = 'money-selected-count';
        selectedCountEl.textContent = selectedCount;
        
        // Plus button
        const plusBtn = document.createElement('button');
        plusBtn.className = 'money-selection-btn';
        plusBtn.textContent = '+';
        plusBtn.disabled = selectedCount >= denominationCounts[value].count;
        plusBtn.addEventListener('click', function(e) {
          e.stopPropagation(); // Prevent triggering the parent click
          
          // Find an unselected index of this denomination and select it
          const selectedIndices = window.MonopolyDeal.gameState.selectedPaymentAssets.money;
          const availableIndices = denominationCounts[value].indices.filter(
            index => !selectedIndices.includes(index)
          );
          
          if (availableIndices.length > 0) {
            window.MonopolyDeal.togglePaymentAsset('money', availableIndices[0]);
          }
        });
        
        selectionControls.appendChild(minusBtn);
        selectionControls.appendChild(selectedCountEl);
        selectionControls.appendChild(plusBtn);
        
        box.appendChild(selectionControls);
      }
      
      box.style.backgroundColor = window.MonopolyDeal.getMoneyColor(value);
      
      // First add value (now on the left)
      const valueElement = document.createElement('div');
      valueElement.className = 'money-denomination-value';
      valueElement.textContent = `$${value}M`;
      box.appendChild(valueElement);
      
      // Then add count (now on the right)
      const countElement = document.createElement('div');
      countElement.className = 'money-denomination-count';
      countElement.textContent = `${denominationCounts[value].count}`;
      box.appendChild(countElement);
      
      // Only add boxes with counts greater than 0 to avoid clutter
      if (denominationCounts[value].count > 0) {
        denominationContainer.appendChild(box);
      }
    });
  }
  
  // Add denomination container to money section
  moneySection.appendChild(denominationContainer);
  
  // Add total value display in the compact format
  const totalDisplay = document.createElement('div');
  totalDisplay.className = 'money-total-compact';
  totalDisplay.textContent = `Total: $${totalValue}M`;
  moneySection.appendChild(totalDisplay);
  
  // Add the money section to the flex container
  flexContainer.appendChild(moneySection);
  
  // Add payment bar if this player needs to pay and we're in their perspective
  if (isPaymentPlayerPerspective) {
    const paymentBar = document.createElement('div');
    paymentBar.className = 'payment-bar visible';
    
    const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
    
    // Create payment info column container (first element)
    const infoColumn = document.createElement('div');
    infoColumn.className = 'payment-info-column';
    
    // Payment bar header
    const barHeader = document.createElement('div');
    barHeader.className = 'payment-bar-header';
    barHeader.textContent = `Payment to Player ${paymentRequest.toPlayer}`;
    infoColumn.appendChild(barHeader);
    
    // Calculate selected total
    const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
    
    // Amount display
    const amountDisplay = document.createElement('div');
    amountDisplay.className = 'payment-amount-display';
    
    const currentAmount = document.createElement('span');
    currentAmount.className = 'payment-current-amount';
    currentAmount.textContent = `$${selectedTotal}M`;
    currentAmount.id = 'payment-current-amount';
    
    const targetAmount = document.createElement('span');
    targetAmount.className = 'payment-target-amount';
    targetAmount.textContent = `of $${paymentRequest.amount}M`;
    
    // Set color based on whether the amount is sufficient
    const hasFullAmount = selectedTotal >= (paymentRequest.adjustedAmount || paymentRequest.amount);
    if (hasFullAmount) {
      currentAmount.style.color = '#4CAF50'; // Green color for sufficient amount
    } else {
      currentAmount.style.color = '#f44336'; // Red color for insufficient amount
    }
    
    amountDisplay.appendChild(currentAmount);
    amountDisplay.appendChild(targetAmount);
    infoColumn.appendChild(amountDisplay);
    
    // Add info column to payment bar (first direct child)
    paymentBar.appendChild(infoColumn);
    
    // Progress bar (second direct child - completely separate from info column)
    const progressContainer = document.createElement('div');
    progressContainer.className = 'payment-progress-container';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'payment-progress-fill';
    progressFill.id = 'payment-progress-fill';
    const progressPercent = Math.min(100, (selectedTotal / paymentRequest.amount) * 100);
    progressFill.style.width = `${progressPercent}%`;
    
    if (selectedTotal >= paymentRequest.amount) {
      progressFill.style.background = 'linear-gradient(to right, #4caf50, #8bc34a)';
    }
    
    progressContainer.appendChild(progressFill);
    paymentBar.appendChild(progressContainer);
    
    // Pay button (third direct child - completely separate element)
    const payButton = document.createElement('button');
    payButton.className = 'payment-pay-button';
    payButton.textContent = 'PAY';
    payButton.id = 'payment-pay-button';
    payButton.disabled = selectedTotal < paymentRequest.amount;
    
    payButton.addEventListener('click', function() {
      if (selectedTotal >= paymentRequest.amount) {
        window.MonopolyDeal.processSelectedPayment();
      }
    });
    
    // Add pay button directly to payment bar
    paymentBar.appendChild(payButton);
    
    // Add payment bar to flex container
    flexContainer.appendChild(paymentBar);
  }
  
  // Add the entire flex container to the money element
  moneyElement.appendChild(flexContainer);
  
  // Hide the existing money header since we now display everything in a single row
  const moneyHeader = moneyElement.closest('.asset-section').querySelector('.money-header');
  if (moneyHeader) {
    moneyHeader.style.display = 'none';
  }
  
  // Update total value display in the compact format (legacy support)
  if (totalElement) {
    totalElement.textContent = totalValue;
  }
  
  // Add subtle highlight if this player needs to pay but we're not in their perspective
  if (isPaymentPending && !isPaymentRecipient && !isPaymentPlayerPerspective) {
    moneySection.style.borderLeft = '3px solid #f44336';
    moneySection.style.paddingLeft = '5px';
  }
  
  return true;
};

window.MonopolyDeal.updatePlayerPropertiesUI = function(playerNumber) {
  console.log(`Updating properties UI for player ${playerNumber}...`);
  
  // Fixed positions: Player 1 always top, Player 2 always bottom
  const propertiesElement = playerNumber === 1 ? 
    document.getElementById('opponent-properties') : 
    document.getElementById('player-properties');
  
  if (!propertiesElement) {
    console.error(`Properties element for player ${playerNumber} not found`);
    return false;
  }
  
  const playerProperties = window.MonopolyDeal.gameState.players[playerNumber].properties;
  propertiesElement.innerHTML = '';
  
  // Required number of properties for a complete set
  const requiredProperties = {
    'brown': 2,
    'blue': 2,
    'green': 3,
    'red': 3,
    'yellow': 3,
    'orange': 3,
    'pink': 3,
    'light-blue': 3,
    'utility': 2,
    'railroad': 4
  };
  
  // Count the monopolies for this player
  let monopolyCount = 0;
  
  // Create property groups for each color
  Object.keys(playerProperties).forEach(color => {
    const properties = playerProperties[color];
    if (properties.length === 0) return;
    
    const groupElement = document.createElement('div');
    groupElement.className = `property-group ${color}-group`;
    
    // Check if this is a monopoly (complete set)
    const isMonopoly = requiredProperties[color] && properties.length >= requiredProperties[color];
    if (isMonopoly) {
      groupElement.classList.add('complete-set');
      monopolyCount++;
    }
    
    // Add a tooltip showing the rent amount for this property group
    const rentAmount = window.MonopolyDeal.calculateRentForProperties(playerNumber, color);
    const requiredCount = requiredProperties[color] || 1;
    groupElement.title = `Rent: $${rentAmount}M (${properties.length}/${requiredCount} cards)`;
    
    // Add properties to the group
    properties.forEach((property, index) => {
      const propertyElement = document.createElement('div');
      propertyElement.className = 'card property-card played';
      propertyElement.dataset.cardId = property.id;
      
      // Get the image path for the property
      const imagePath = window.MonopolyDeal.getCardImagePath(property);
      
      if (imagePath) {
        // Use property image
        propertyElement.style.backgroundImage = `url('${imagePath}')`;
        propertyElement.style.backgroundSize = 'cover';
        propertyElement.style.backgroundPosition = 'center';
        propertyElement.style.backgroundRepeat = 'no-repeat';
        
        // Remove any text content to just show the image
        propertyElement.innerHTML = '';
      } else {
        // Fallback to text display - only if image not available
        propertyElement.innerHTML = `
          <div class="property-name">${property.name}</div>
          <div class="property-value">$${property.value}M</div>`;
      }
      
      // Add wildcard classes and handle flipped state
      if (property.wildcard && property.colors) {
        propertyElement.classList.add('wildcard');
        if (property.isFlipped) {
          propertyElement.classList.add('flipped');
        }
        
        // Handle clicks for both 2-way and 10-way wildcards
        if (property.colors.length === 2) {
          propertyElement.title = 'Click to flip card';
          propertyElement.addEventListener('click', function() {
            window.MonopolyDeal.flipWildcardProperty(playerNumber, property.color, index);
          });
        } else if (property.colors[0] === 'any' || property.originalColors[0] === 'any') {
          propertyElement.title = 'Click to change color';
          propertyElement.addEventListener('click', function() {
            window.MonopolyDeal.showColorSelectionModal(playerNumber, property.color, index);
          });
        }
      }
      
      groupElement.appendChild(propertyElement);
    });
    
    propertiesElement.appendChild(groupElement);
  });
  
  // After all property groups are added, add the monopoly counter if player has at least one
  if (monopolyCount > 0) {
    const monopolyCounter = document.createElement('div');
    monopolyCounter.className = 'monopoly-counter';
    monopolyCounter.textContent = monopolyCount;
    monopolyCounter.title = `${monopolyCount} Complete Set${monopolyCount !== 1 ? 's' : ''}`;
    propertiesElement.appendChild(monopolyCounter);
    
    // Check win condition if player has 3 monopolies
    if (monopolyCount >= 3) {
      window.MonopolyDeal.showWinPopup(playerNumber);
    }
  }
  
  return true;
};

// Function to show win popup when a player gets 3 monopolies
window.MonopolyDeal.showWinPopup = function(playerNumber) {
  // Only show if we haven't already shown for this player
  if (window.MonopolyDeal.gameState.winnerDeclared) {
    return;
  }
  
  console.log(`Player ${playerNumber} wins with 3 monopolies!`);
  
  // Mark that a winner has been declared to prevent showing popup multiple times
  window.MonopolyDeal.gameState.winnerDeclared = true;
  
  // Create the win popup
  const winPopup = document.createElement('div');
  winPopup.className = 'win-popup';
  winPopup.innerHTML = `
    <div class="win-content">
      <h2>🏆 Player ${playerNumber} Wins! 🏆</h2>
      <p>Congratulations! Player ${playerNumber} has collected 3 monopolies!</p>
      <button id="new-game-btn" class="win-action-btn">New Game</button>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(winPopup);
  
  // Add event listener to the new game button
  document.getElementById('new-game-btn').addEventListener('click', function() {
    winPopup.remove();
    window.MonopolyDeal.startGame();
  });
  
  // Disable draw and end turn buttons
  if (window.MonopolyDeal.elements.drawButton) {
    window.MonopolyDeal.elements.drawButton.disabled = true;
  }
  if (window.MonopolyDeal.elements.endTurnButton) {
    window.MonopolyDeal.elements.endTurnButton.disabled = true;
  }
  
  return true;
};

window.MonopolyDeal.updateGameStatus = function(message) {
  console.log(`Updating game status: ${message}`);
  if (window.MonopolyDeal.elements.gameStatus) {
    window.MonopolyDeal.elements.gameStatus.textContent = message;
  } else {
    console.error('Game status element not found');
  }
};

window.MonopolyDeal.addToHistory = function(message) {
  console.log(`Adding to history: ${message}`);
  
  // Limit history to 20 entries to prevent excessive growth
  const MAX_HISTORY_ENTRIES = 20;
  
  // Add to game state history array
  window.MonopolyDeal.gameState.history.push(message);
  
  // Trim if too long
  if (window.MonopolyDeal.gameState.history.length > MAX_HISTORY_ENTRIES) {
    window.MonopolyDeal.gameState.history = window.MonopolyDeal.gameState.history.slice(-MAX_HISTORY_ENTRIES);
  }
  
  if (window.MonopolyDeal.elements.gameHistory) {
    // Clear existing history container
    const historyContainer = window.MonopolyDeal.elements.gameHistory;
    
    // First, clear the history to avoid duplicate entries
    historyContainer.innerHTML = '';
    
    // Recreate the history in reverse order (newest at top)
    // Get a copy of the history array and reverse it
    const historyToDisplay = [...window.MonopolyDeal.gameState.history].reverse();
    
    // Add entries to the DOM
    historyToDisplay.forEach((historyMessage, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
      historyItem.textContent = historyMessage;
      historyContainer.appendChild(historyItem);
    });
    
    // Scroll to top to ensure newest message is visible
    historyContainer.scrollTop = 0;
  } else {
    console.error('Game history element not found');
  }
};

// Calculate rent for properties based on color and set completeness
window.MonopolyDeal.calculateRentForProperties = function(playerNumber, color) {
  console.log(`Calculating rent for ${color} properties for player ${playerNumber}...`);
  const properties = window.MonopolyDeal.gameState.players[playerNumber].properties[color];
  
  if (!properties || properties.length === 0) {
    return 0;
  }
  
  // Required properties for a complete set
  const requiredProperties = {
    'brown': 2,
    'blue': 2,
    'green': 3,
    'red': 3,
    'yellow': 3,
    'orange': 3,
    'pink': 3,
    'light-blue': 3,
    'utility': 2,
    'railroad': 4
  };
  
  // Rent values based on the number of cards in the set
  // Each entry is an array where index represents the number of cards (starting from 1)
  const rentValues = {
    'brown': [1, 2],                 // 1 card: 1M, 2 cards: 2M
    'blue': [3, 8],                  // 1 card: 3M, 2 cards: 8M
    'green': [2, 4, 7],              // 1 card: 2M, 2 cards: 4M, 3 cards: 7M
    'light-blue': [1, 2, 3],         // 1 card: 1M, 2 cards: 2M, 3 cards: 3M
    'orange': [1, 3, 5],             // 1 card: 1M, 2 cards: 3M, 3 cards: 5M
    'pink': [1, 2, 4],               // 1 card: 1M, 2 cards: 2M, 3 cards: 4M
    'red': [2, 3, 6],                // 1 card: 2M, 2 cards: 3M, 3 cards: 6M
    'yellow': [2, 4, 6],             // 1 card: 2M, 2 cards: 4M, 3 cards: 6M
    'utility': [1, 2],               // 1 card: 1M, 2 cards: 2M
    'railroad': [1, 2, 3, 4]         // 1 card: 1M, 2 cards: 2M, 3 cards: 3M, 4 cards: 4M
  };
  
  // Get the number of cards in the set, but cap it at the required number for a full set
  const cardCount = Math.min(properties.length, requiredProperties[color] || properties.length);
  
  // Get the rent value based on the card count
  // Array is 0-indexed, but our card count starts at 1, so we subtract 1
  const rentValue = rentValues[color] ? (rentValues[color][cardCount - 1] || 1) : 1;
  
  console.log(`Rent for ${color} properties: $${rentValue}M (${properties.length} cards, cap at ${requiredProperties[color]} for full set)`);
  
  return rentValue;
};

// Helper function to check if a player can interact with cards
window.MonopolyDeal.canPlayerInteract = function(playerNumber) {
  // Can interact if:
  // 1. It's the player's turn
  // 2. Current perspective is the player's perspective
  return (
    window.MonopolyDeal.gameState.currentPlayer === playerNumber &&
    window.MonopolyDeal.currentPerspective === playerNumber
  );
};

// Place an action card on the action pile
window.MonopolyDeal.placeActionCard = function(card) {
  console.log(`Placing action card on action pile: ${card.name}`);
  
  // Store the card in the game state
  window.MonopolyDeal.gameState.lastActionCard = card;
  
  // Also add to discard pile (for game mechanics)
  window.MonopolyDeal.gameState.discardPile.push(card);
  
  // Update the action pile UI
  const actionPile = window.MonopolyDeal.elements.actionPile;
  if (actionPile) {
    // Clear existing cards
    actionPile.innerHTML = '';
    
    // Create card element based on the action card
    const cardElement = document.createElement('div');
    cardElement.className = 'card action-card';
    
    // Get the image path for the card
    const imagePath = window.MonopolyDeal.getCardImagePath(card);
    
    if (imagePath) {
      // Use card image
      cardElement.style.backgroundImage = `url('${imagePath}')`;
      cardElement.style.backgroundSize = 'cover';
      cardElement.style.backgroundPosition = 'center';
      cardElement.style.backgroundRepeat = 'no-repeat';
    } else {
      // Fallback to text display
      cardElement.innerHTML = `
        <div class="action-name">${card.name}</div>
        <div class="action-description">${card.description}</div>
        <div class="action-value">$${card.value}M</div>`;
    }
    
    // Add card to the action pile
    actionPile.appendChild(cardElement);
  }
};

// Display a payment notification
window.MonopolyDeal.showPaymentNotification = function(amount, reason = '', fromPlayer, toPlayer) {
  console.log(`Payment notification: $${amount}M from Player ${fromPlayer} to Player ${toPlayer} for ${reason}`);
  
  // Update the game status message instead of showing a popup
  window.MonopolyDeal.updateGameStatus(`Waiting for Player ${fromPlayer} to pay $${amount}M to Player ${toPlayer} for ${reason}`);
  
  // Add to game history
  window.MonopolyDeal.addToHistory(`Player ${fromPlayer} must pay $${amount}M to Player ${toPlayer} for ${reason}`);
};

// Export functions explicitly
window.MonopolyDeal.setupElements = window.MonopolyDeal.setupElements;
window.MonopolyDeal.startGame = window.MonopolyDeal.startGame;
window.MonopolyDeal.shuffleDeck = window.MonopolyDeal.shuffleDeck;
window.MonopolyDeal.dealCard = window.MonopolyDeal.dealCard;
window.MonopolyDeal.drawCardsForTurn = window.MonopolyDeal.drawCardsForTurn;
window.MonopolyDeal.playCard = window.MonopolyDeal.playCard;
window.MonopolyDeal.endTurn = window.MonopolyDeal.endTurn;
window.MonopolyDeal.discardCard = window.MonopolyDeal.discardCard;
window.MonopolyDeal.checkWinCondition = window.MonopolyDeal.checkWinCondition;
window.MonopolyDeal.countCompleteSets = window.MonopolyDeal.countCompleteSets;
window.MonopolyDeal.updatePlayerHandUI = window.MonopolyDeal.updatePlayerHandUI;
window.MonopolyDeal.updatePlayerMoneyUI = window.MonopolyDeal.updatePlayerMoneyUI;
window.MonopolyDeal.updatePlayerPropertiesUI = window.MonopolyDeal.updatePlayerPropertiesUI;
window.MonopolyDeal.updateGameStatus = window.MonopolyDeal.updateGameStatus;
window.MonopolyDeal.addToHistory = window.MonopolyDeal.addToHistory;
window.MonopolyDeal.showActionCardModal = window.MonopolyDeal.showActionCardModal;
window.MonopolyDeal.hideActionCardModal = window.MonopolyDeal.hideActionCardModal;
window.MonopolyDeal.playActionCardAsMoney = window.MonopolyDeal.playActionCardAsMoney;
window.MonopolyDeal.playPassGoCard = window.MonopolyDeal.playPassGoCard;
window.MonopolyDeal.playDebtCollectorCard = window.MonopolyDeal.playDebtCollectorCard;
window.MonopolyDeal.playRentCard = window.MonopolyDeal.playRentCard;
window.MonopolyDeal.playBirthdayCard = window.MonopolyDeal.playBirthdayCard;
window.MonopolyDeal.calculatePlayerAssetValue = window.MonopolyDeal.calculatePlayerAssetValue;
window.MonopolyDeal.requestPayment = window.MonopolyDeal.requestPayment;
window.MonopolyDeal.showPaymentIndicator = window.MonopolyDeal.showPaymentIndicator;
window.MonopolyDeal.removePaymentIndicator = window.MonopolyDeal.removePaymentIndicator;
window.MonopolyDeal.processSelectedPayment = window.MonopolyDeal.processSelectedPayment;
window.MonopolyDeal.togglePaymentAsset = window.MonopolyDeal.togglePaymentAsset;
window.MonopolyDeal.calculateRentForProperties = window.MonopolyDeal.calculateRentForProperties;
window.MonopolyDeal.canPlayerInteract = window.MonopolyDeal.canPlayerInteract;
window.MonopolyDeal.placeActionCard = window.MonopolyDeal.placeActionCard;

// Process payment directly from the player's money UI (without modal)
window.MonopolyDeal.processPayment = function() {
  console.log('Payment functionality removed - needs to be reimplemented');
  
  // Show an informational message to the user
  window.MonopolyDeal.showTemporaryMessage('Payment functionality has been removed and needs to be reimplemented.', 3000);
  
  // Keep the payment pending state active
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) {
    console.error('No payment request found!');
    return;
  }
  
  // Update game status to indicate payment is still required
  window.MonopolyDeal.updateGameStatus(`Payment functionality removed. Player ${paymentRequest.fromPlayer} still needs to pay $${paymentRequest.amount}M to Player ${paymentRequest.toPlayer}`);
  
  return false;
};

// Function to flip a wildcard property
window.MonopolyDeal.flipWildcardProperty = function(playerNumber, currentColor, cardIndex) {
  console.log(`Flipping wildcard property for player ${playerNumber} from ${currentColor} group at index ${cardIndex}`);
  
  // Get the player's properties
  const playerProperties = window.MonopolyDeal.gameState.players[playerNumber].properties;
  
  // Get the specific card
  const card = playerProperties[currentColor][cardIndex];
  
  // Verify it's a wildcard with multiple colors
  if (!card || !card.wildcard || !card.originalColors || card.originalColors.length <= 1) {
    console.warn("This is not a valid multicolor wildcard property");
    return false;
  }
  
  // Find the next color in the original colors list
  let nextColor;
  
  if (card.originalColors.length === 2) {
    // Simple swap between the two colors
    nextColor = card.originalColors.find(color => color !== currentColor);
    
    // Toggle the flipped state
    card.isFlipped = !card.isFlipped;
    
    // Update the card's image in the DOM
    const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
    if (cardElement) {
      const newImagePath = window.MonopolyDeal.getCardImagePath(card);
      cardElement.style.backgroundImage = `url('${newImagePath}')`;
    }
  } else {
    // Rotate through all colors for multi-color wildcards
    const currentColorIndex = card.originalColors.indexOf(card.activeColor || currentColor);
    const nextColorIndex = (currentColorIndex + 1) % card.originalColors.length;
    nextColor = card.originalColors[nextColorIndex];
  }
  
  console.log(`Switching from ${currentColor} to ${nextColor}`);
  
  // Remove the card from the current color group
  playerProperties[currentColor].splice(cardIndex, 1);
  
  // Update the card's active color and swap the secondary color
  card.activeColor = nextColor;
  card.color = nextColor;
  
  // If it's a dual-color card, we need to properly swap primary and secondary colors
  if (card.originalColors.length === 2) {
    card.secondaryColor = currentColor; // The current color becomes the secondary color
  }
  
  // Initialize the next color group if it doesn't exist
  if (!playerProperties[nextColor]) {
    playerProperties[nextColor] = [];
  }
  
  // Add the card to the next color group
  playerProperties[nextColor].push(card);
  
  // Check if any wildcards need to be reassigned after flipping
  window.MonopolyDeal.handleWildcardReassignment(playerNumber);
  
  // Update the UI
  window.MonopolyDeal.updatePlayerPropertiesUI(playerNumber);
  
  // Update game status
  window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} switched a wildcard property from ${currentColor} to ${nextColor}`);
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} switched a wildcard property from ${currentColor} to ${nextColor}`);
  
  return true;
};

// Show action response options (like Just Say No) when an action targets a player
window.MonopolyDeal.showActionResponseOptions = function() {
  console.log('Showing action response options...');
  
  const actionResponse = window.MonopolyDeal.gameState.actionResponse;
  
  // Only show if an action is pending
  if (!actionResponse.pending) {
    console.log('No action response pending');
    return false;
  }
  
  // Update UI based on whose perspective we're in
  const currentPerspective = window.MonopolyDeal.currentPerspective;
  
  // Create a response UI container if it doesn't exist
  let responseContainer = document.getElementById('action-response-container');
  if (!responseContainer) {
    responseContainer = document.createElement('div');
    responseContainer.id = 'action-response-container';
    responseContainer.className = 'action-response-container';
    document.querySelector('.right-sidebar .sidebar-content').appendChild(responseContainer);
  }
  
  // Clear any existing content
  responseContainer.innerHTML = '';
  
  // If we're in the perspective of the player who needs to respond
  if (currentPerspective === actionResponse.fromPlayer) {
    // Create the response UI
    const headerEl = document.createElement('h3');
    headerEl.textContent = 'Action Pending';
    responseContainer.appendChild(headerEl);
    
    // Show what action is being responded to
    const actionInfoEl = document.createElement('div');
    actionInfoEl.className = 'action-info';
    
    // Format based on action type
    let actionDescription = '';
    switch(actionResponse.type) {
      case 'payment':
        actionDescription = `Player ${actionResponse.toPlayer} is requesting payment of $${actionResponse.payload.amount}M`;
        break;
      default:
        actionDescription = `Player ${actionResponse.toPlayer} is taking action against you`;
        break;
    }
    
    actionInfoEl.textContent = actionDescription;
    responseContainer.appendChild(actionInfoEl);
    
    // Add waiting message to make it clear the game is waiting
    const waitingMsg = document.createElement('div');
    waitingMsg.className = 'response-waiting';
    waitingMsg.textContent = 'Game is waiting for your response';
    responseContainer.appendChild(waitingMsg);
    
    // Create question prompt
    const questionEl = document.createElement('div');
    questionEl.className = 'response-question';
    questionEl.textContent = 'Use "Just Say No" to block this action?';
    responseContainer.appendChild(questionEl);
    
    // Check if player has Just Say No card
    const hasJustSayNo = window.MonopolyDeal.playerHasJustSayNo(currentPerspective);
    
    // Create a vertical tab with buttons
    const buttonsTab = document.createElement('div');
    buttonsTab.className = 'response-tab';
    
    // Yes button (Use Just Say No)
    const yesBtn = document.createElement('button');
    yesBtn.className = 'response-btn just-say-no-btn';
    yesBtn.textContent = 'Yes, Use "Just Say No"';
    yesBtn.disabled = !hasJustSayNo;
    yesBtn.title = hasJustSayNo ? 'Use Just Say No card' : 'You don\'t have a Just Say No card';
    yesBtn.addEventListener('click', function() {
      window.MonopolyDeal.useJustSayNo();
    });
    
    // No button (Accept Action)
    const noBtn = document.createElement('button');
    noBtn.className = 'response-btn proceed-btn';
    noBtn.textContent = 'No, Accept the Action';
    noBtn.title = 'Accept the action and continue';
    noBtn.addEventListener('click', function() {
      window.MonopolyDeal.acceptAction();
    });
    
    // Add buttons to tab (stacked vertically)
    buttonsTab.appendChild(yesBtn);
    buttonsTab.appendChild(noBtn);
    responseContainer.appendChild(buttonsTab);
    
    // If player doesn't have Just Say No, show a message
    if (!hasJustSayNo) {
      const noCardMsg = document.createElement('div');
      noCardMsg.className = 'no-card-message';
      noCardMsg.textContent = 'You don\'t have a Just Say No card in your hand';
      responseContainer.appendChild(noCardMsg);
    }
    
    // Make container visible
    responseContainer.classList.add('visible');
  } else {
    // If we're in the perspective of the action initiator
    if (currentPerspective === actionResponse.toPlayer) {
      // Show waiting message
      const headerEl = document.createElement('h3');
      headerEl.textContent = 'Action Pending';
      responseContainer.appendChild(headerEl);
      
      const waitingMsgEl = document.createElement('div');
      waitingMsgEl.className = 'waiting-message';
      waitingMsgEl.textContent = `Waiting for Player ${actionResponse.fromPlayer} to respond...`;
      responseContainer.appendChild(waitingMsgEl);
      
      // Add description of possible responses
      const responseInfoEl = document.createElement('div');
      responseInfoEl.className = 'response-info';
      responseInfoEl.textContent = `Player ${actionResponse.fromPlayer} may use a Just Say No card or accept your action.`;
      responseContainer.appendChild(responseInfoEl);
      
      // Make container visible
      responseContainer.classList.add('visible');
    } else {
      // Not relevant to current perspective
      responseContainer.classList.remove('visible');
    }
  }
  
  return true;
};

// Check if a player has a Just Say No card in their hand
window.MonopolyDeal.playerHasJustSayNo = function(playerNumber) {
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  if (!player || !player.hand) return false;
  
  return player.hand.some(card => 
    card.type === 'action' && 
    card.action === window.MonopolyDeal.ActionTypes.JUST_SAY_NO
  );
};

// Handle using a Just Say No card
window.MonopolyDeal.useJustSayNo = function() {
  console.log('Using Just Say No card...');
  
  const actionResponse = window.MonopolyDeal.gameState.actionResponse;
  const currentPlayer = actionResponse.fromPlayer; // Player responding to the action
  
  // Find Just Say No card in player's hand
  const player = window.MonopolyDeal.gameState.players[currentPlayer];
  const justSayNoIndex = player.hand.findIndex(card => 
    card.type === 'action' && 
    card.action === window.MonopolyDeal.ActionTypes.JUST_SAY_NO
  );
  
  if (justSayNoIndex === -1) {
    console.warn('Player does not have a Just Say No card');
    window.MonopolyDeal.updateGameStatus('You do not have a Just Say No card');
    return false;
  }
  
  // Remove Just Say No card from hand
  const justSayNoCard = player.hand.splice(justSayNoIndex, 1)[0];
  
  // Add to the discard pile
  window.MonopolyDeal.gameState.discardPile.push(justSayNoCard);
  
  // Increment the Just Say No chain
  actionResponse.justSayNoChain++;
  
  // Update game status
  window.MonopolyDeal.updateGameStatus(`Player ${currentPlayer} used Just Say No against Player ${actionResponse.toPlayer}'s action!`);
  window.MonopolyDeal.addToHistory(`Player ${currentPlayer} used Just Say No to block ${actionResponse.type} from Player ${actionResponse.toPlayer}`);
  
  // Swap the action response roles (action initiator can now counter with another Just Say No)
  const temp = actionResponse.fromPlayer;
  actionResponse.fromPlayer = actionResponse.toPlayer;
  actionResponse.toPlayer = temp;
  
  // Update UI
  window.MonopolyDeal.updateAllPlayerUIs();
  window.MonopolyDeal.showActionResponseOptions();
  
  return true;
};

// Handle accepting the action (no Just Say No)
window.MonopolyDeal.acceptAction = function() {
  console.log('Accepting action...');
  
  const actionResponse = window.MonopolyDeal.gameState.actionResponse;
  
  // Handle based on action type
  switch(actionResponse.type) {
    case 'payment':
      // If the original action was payment and it's accepted,
      // proceed with payment UI
      window.MonopolyDeal.updateGameStatus(`Player ${actionResponse.fromPlayer} must pay $${actionResponse.payload.amount}M to Player ${actionResponse.toPlayer}`);
      window.MonopolyDeal.addToHistory(`Player ${actionResponse.fromPlayer} accepted the payment request`);
      
      // Clear action response but keep payment pending
      window.MonopolyDeal.gameState.actionResponse.pending = false;
      
      // If Just Say No chain is even, action proceeds; if odd, action is cancelled
      if (actionResponse.justSayNoChain % 2 === 1) {
        // Odd number of Just Say No cards, action is cancelled
        window.MonopolyDeal.cancelPayment();
        window.MonopolyDeal.updateGameStatus(`Action cancelled after ${actionResponse.justSayNoChain} Just Say No ${actionResponse.justSayNoChain === 1 ? 'card' : 'cards'}`);
        window.MonopolyDeal.addToHistory(`Action cancelled by Just Say No chain`);
      } else {
        // Show payment modal if action proceeds
        window.MonopolyDeal.showPaymentModal();
      }
      break;
      
    default:
      // For other action types, just complete the action
      window.MonopolyDeal.updateGameStatus(`Player ${actionResponse.fromPlayer} accepted Player ${actionResponse.toPlayer}'s action`);
      window.MonopolyDeal.addToHistory(`Player ${actionResponse.fromPlayer} accepted the action`);
      
      // Clear action response
      window.MonopolyDeal.gameState.actionResponse.pending = false;
      break;
  }
  
  // Update UI
  window.MonopolyDeal.updateAllPlayerUIs();
  
  // Hide response options
  const responseContainer = document.getElementById('action-response-container');
  if (responseContainer) {
    responseContainer.classList.remove('visible');
  }
  
  return true;
};

// Cancel a payment in progress
window.MonopolyDeal.cancelPayment = function() {
  console.log('Cancelling payment...');
  
  // Clear payment request
  window.MonopolyDeal.gameState.paymentPending = false;
  window.MonopolyDeal.gameState.paymentRequest = null;
  window.MonopolyDeal.gameState.selectedPaymentAssets = {
    money: [],
    properties: []
  };
  
  // Clear action response
  window.MonopolyDeal.gameState.actionResponse = {
    pending: false,
    type: null,
    fromPlayer: null,
    toPlayer: null,
    justSayNoChain: 0,
    actionCard: null,
    payload: null
  };
  
  // Update UI
  window.MonopolyDeal.updateAllPlayerUIs();
  
  return true;
};

// Update button states based on game state
window.MonopolyDeal.updateButtonStates = function() {
  const gameStarted = window.MonopolyDeal.gameState.gameStarted;
  const currentPlayer = window.MonopolyDeal.gameState.currentPlayer;
  const hasDrawnCards = window.MonopolyDeal.gameState.hasDrawnCards;
  const paymentPending = window.MonopolyDeal.gameState.paymentPending;
  const currentPerspective = window.MonopolyDeal.currentPerspective;
  const actionResponsePending = window.MonopolyDeal.gameState.actionResponse.pending;
  
  // Get button references
  const startButton = window.MonopolyDeal.elements.startButton;
  const drawButton = window.MonopolyDeal.elements.drawButton;
  const endTurnButton = window.MonopolyDeal.elements.endTurnButton;
  const switchPerspectiveButton = window.MonopolyDeal.elements.switchPerspectiveButton;
  
  // Start button: Disabled if game already started
  if (startButton) {
    startButton.disabled = gameStarted;
  }
  
  // Draw button: Enabled only if it's the current player's turn,
  // the current perspective matches, game started, cards haven't been drawn yet,
  // and no payment is pending or action response is pending
  if (drawButton) {
    drawButton.disabled = !gameStarted || 
                          currentPerspective !== currentPlayer ||
                          hasDrawnCards ||
                          paymentPending ||
                          actionResponsePending;
  }
  
  // End turn button: Enabled only if it's the current player's turn,
  // the current perspective matches, game started, cards have been drawn,
  // and no payment is pending or action response is pending
  if (endTurnButton) {
    endTurnButton.disabled = !gameStarted || 
                            currentPerspective !== currentPlayer ||
                            !hasDrawnCards ||
                            paymentPending ||
                            actionResponsePending;
  }
  
  // Switch perspective button: Always enabled if game started
  if (switchPerspectiveButton) {
    switchPerspectiveButton.disabled = !gameStarted;
    switchPerspectiveButton.textContent = `Switch to Player ${currentPerspective === 1 ? '2' : '1'}'s View`;
    switchPerspectiveButton.title = `Switch to Player ${currentPerspective === 1 ? '2' : '1'}'s perspective`;
  }
  
  // Update action response UI
  if (actionResponsePending) {
    window.MonopolyDeal.showActionResponseOptions();
  }
  
  return true;
};

console.log('GameState.js loaded successfully!'); 

// Show color selection modal for full wildcard property
window.MonopolyDeal.showColorSelectionModal = function(playerNumber, currentColor, cardIndex) {
  try {
    console.log(`Showing color selection modal for player ${playerNumber}'s wildcard property`);
    
    // Get the player's properties
    const playerProperties = window.MonopolyDeal.gameState.players[playerNumber].properties;
    
    // Check if properties exist
    if (!playerProperties || !playerProperties[currentColor]) {
      console.error(`Invalid properties or color group: ${playerNumber}, ${currentColor}`);
      return false;
    }
    
    // Get the specific card
    const card = playerProperties[currentColor][cardIndex];
    
    // Verify it's a full wildcard
    if (!card || !card.wildcard || !card.originalColors || !card.originalColors.includes('any')) {
      console.warn("This is not a valid full wildcard property");
      return false;
    }
    
    // Create or get the modal
    let modal = document.getElementById('color-selection-modal');
    let modalBody;
    
    // If modal doesn't exist, create it completely fresh
    if (!modal) {
      console.log("Creating new color selection modal");
      modal = document.createElement('div');
      modal.id = 'color-selection-modal';
      modal.className = 'modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      
      // Add header
      const header = document.createElement('div');
      header.className = 'modal-header';
      header.innerHTML = `
        <h2>Select Property Group</h2>
        <span class="close-modal">&times;</span>
      `;
      modalContent.appendChild(header);
      
      // Add body
      modalBody = document.createElement('div');
      modalBody.className = 'modal-body';
      modalContent.appendChild(modalBody);
      
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      console.log("Created new modal with body:", modalBody);
    } else {
      // Modal exists, make sure it has a modal-body or create one
      modalBody = modal.querySelector('.modal-body');
      
      if (!modalBody) {
        console.log("Modal exists but body not found, creating new modal body");
        // Find the modal content container
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) {
          console.error("Modal content container not found, recreating entire modal");
          // If modal content not found, remove and recreate the entire modal
          modal.remove();
          return window.MonopolyDeal.showColorSelectionModal(playerNumber, currentColor, cardIndex);
        }
        
        // Create new body element
        modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalContent.appendChild(modalBody);
        console.log("Created new modal body in existing modal");
      }
    }
    
    // Verify modal body exists before proceeding
    if (!modalBody) {
      console.error("Failed to create or find modal body element");
      return false;
    }
    
    // Clear existing content
    modalBody.innerHTML = '';
    
    // Add title or info text
    const infoText = document.createElement('div');
    infoText.className = 'wildcard-info-text';
    infoText.textContent = 'Select a property group or return to unassigned:';
    modalBody.appendChild(infoText);
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'wildcard-button-container';
    
    // Always add the "any" option at the top - this is the key fix!
    // Only show this option if the card isn't already in the "any" group
    if (currentColor !== 'any') {
      const anyButton = document.createElement('button');
      anyButton.className = 'wildcard-color-button any-button';
      anyButton.textContent = 'Unassigned (Any)';
      
      // Add rainbow indicator for 'any'
      const indicator = document.createElement('span');
      indicator.className = 'color-indicator rainbow-indicator';
      indicator.style.background = 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)';
      anyButton.prepend(indicator);
      
      anyButton.addEventListener('click', () => {
        window.MonopolyDeal.changeWildcardColor(playerNumber, currentColor, cardIndex, 'any');
        window.MonopolyDeal.hideColorSelectionModal();
      });
      
      buttonContainer.appendChild(anyButton);
    }
    
    // Filter for property sets that have at least 1 card, and exclude the current color
    const availableColors = Object.keys(playerProperties).filter(color => {
      // Skip the current color that the wildcard is already in and the 'any' group (handled separately above)
      if (color === currentColor || color === 'any') return false;
      
      // Only include colors with at least one property card
      return playerProperties[color] && playerProperties[color].length > 0;
    });
    
    if (availableColors.length === 0 && currentColor === 'any') {
      modalBody.innerHTML = '<div class="empty-message">You have no property sets to add this wildcard to.</div>';
    } else {
      // Add buttons for each available color
      availableColors.forEach(color => {
        const button = document.createElement('button');
        button.className = `wildcard-color-button ${color}-button`;
        button.textContent = color.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Add color indicator
        const indicator = document.createElement('span');
        indicator.className = `color-indicator ${color}-indicator`;
        button.prepend(indicator);
        
        // Count properties in this color group
        const propertyCount = playerProperties[color] ? playerProperties[color].length : 0;
        
        // Add property count
        const countSpan = document.createElement('span');
        countSpan.className = 'property-count';
        countSpan.textContent = `(${propertyCount})`;
        button.appendChild(countSpan);
        
        button.addEventListener('click', () => {
          window.MonopolyDeal.changeWildcardColor(playerNumber, currentColor, cardIndex, color);
          window.MonopolyDeal.hideColorSelectionModal();
        });
        
        buttonContainer.appendChild(button);
      });
      
      modalBody.appendChild(buttonContainer);
    }
      
    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'wildcard-cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      window.MonopolyDeal.hideColorSelectionModal();
    });
    
    modalBody.appendChild(cancelButton);
    
    // Add close button functionality
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.onclick = () => window.MonopolyDeal.hideColorSelectionModal();
    }
    
    // Show modal
    modal.style.display = 'flex';
    console.log("Successfully displayed color selection modal");
    
    return true;
  } catch (error) {
    console.error("Error in showColorSelectionModal:", error);
    window.MonopolyDeal.showTemporaryMessage("Error showing color selection. Try again.");
    return false;
  }
};

// Hide color selection modal
window.MonopolyDeal.hideColorSelectionModal = function() {
  const modal = document.getElementById('color-selection-modal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Function to exit wildcard selection mode - no longer needed
window.MonopolyDeal.exitWildcardSelectionMode = function() {
  console.log('Exiting wildcard selection mode (deprecated)');
  return true;
};

// Function to handle wildcard selection mode - no longer needed
window.MonopolyDeal.enterWildcardSelectionMode = function() {
  console.log('Entering wildcard selection mode (deprecated)');
  return true;
};

// Change wildcard color and move it to the new property group
window.MonopolyDeal.changeWildcardColor = function(playerNumber, currentColor, cardIndex, newColor) {
  console.log(`Changing wildcard color from ${currentColor} to ${newColor}`);
  
  // Get the player's properties
  const playerProperties = window.MonopolyDeal.gameState.players[playerNumber].properties;
  
  // Get the specific card
  const card = playerProperties[currentColor][cardIndex];
  
  // Verify it's a wildcard
  if (!card || !card.wildcard) {
    console.warn("This is not a valid wildcard property");
    return false;
  }
  
  // Remove the card from the current color group
  playerProperties[currentColor].splice(cardIndex, 1);
  
  // Update the card's color properties
  card.color = newColor;
  card.activeColor = newColor;
  
  // Initialize the new color group if it doesn't exist
  if (!playerProperties[newColor]) {
    playerProperties[newColor] = [];
  }
  
  // Add the card to the new color group
  playerProperties[newColor].push(card);
  
  // Check if any wildcards need to be reassigned after changing color
  window.MonopolyDeal.handleWildcardReassignment(playerNumber);
  
  // Update the UI
  window.MonopolyDeal.updatePlayerPropertiesUI(playerNumber);
  
  // Update game status
  window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} assigned a wildcard property to the ${newColor} group`);
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} assigned a wildcard property to the ${newColor} group`);
  
  return true;
};

// Add event listener to close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('color-selection-modal');
  if (modal && event.target === modal) {
    window.MonopolyDeal.hideColorSelectionModal();
  }
});

// Calculate the total value of a player's available assets (excluding 10-way wildcards)
window.MonopolyDeal.calculateAvailableAssets = function(playerNumber) {
  console.log(`========== Calculating available asset value for player ${playerNumber} (excluding protected wildcards) ==========`);
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  let totalValue = 0;
  
  // Add money
  console.log(`Money cards: ${player.money.length}`);
  player.money.forEach(card => {
    totalValue += parseInt(card.value);
    console.log(`  Money card: $${card.value}M`);
  });
  
  // Add properties (excluding 10-way wildcards)
  console.log(`Checking properties by color:`);
  Object.keys(player.properties).forEach(color => {
    console.log(`  Color group: ${color} - ${player.properties[color].length} cards`);
    player.properties[color].forEach(card => {
      // Skip 10-way wildcard properties
      if (card.wildcard && card.originalColors && 
          (card.originalColors.includes('any') || card.originalColors[0] === 'any')) {
        console.log(`  * PROTECTED: 10-way wildcard worth $${card.value}M - "${card.name}"`);
        return;
      }
      
      totalValue += parseInt(card.value);
      console.log(`  * Property: ${card.name} - $${card.value}M`);
    });
  });
  
  console.log(`Player ${playerNumber} has available assets worth $${totalValue}M (excluding protected wildcards)`);
  console.log(`==========================================================`);
  return totalValue;
};

// Take all available assets from one player (except 10-way wildcards)
window.MonopolyDeal.takeAllAvailableAssets = function(fromPlayerNumber, toPlayerNumber) {
  console.log(`========== Taking all available assets from Player ${fromPlayerNumber} to Player ${toPlayerNumber} ==========`);
  
  const fromPlayer = window.MonopolyDeal.gameState.players[fromPlayerNumber];
  const toPlayer = window.MonopolyDeal.gameState.players[toPlayerNumber];
  
  if (!fromPlayer || !toPlayer) {
    console.error('Invalid player numbers!');
    return false;
  }
  
  // Calculate initial assets for logging
  const initialFromTotal = window.MonopolyDeal.calculateAvailableAssets(fromPlayerNumber);
  console.log(`Player ${fromPlayerNumber} starting with $${initialFromTotal}M in available assets`);
  
  // Transfer all money cards
  console.log(`Transferring money cards (${fromPlayer.money.length} cards):`);
  while (fromPlayer.money.length > 0) {
    const moneyCard = fromPlayer.money[0];
    toPlayer.money.push(moneyCard);
    fromPlayer.money.splice(0, 1);
    console.log(`  Transferred money card worth $${moneyCard.value}M from Player ${fromPlayerNumber} to Player ${toPlayerNumber}`);
  }
  
  // Transfer all property cards (except 10-way wildcards)
  console.log(`Transferring property cards by color group:`);
  Object.keys(fromPlayer.properties).forEach(color => {
    console.log(`  Color group: ${color} - ${fromPlayer.properties[color].length} cards`);
    
    // Process each property in reverse order to handle array splicing
    for (let i = fromPlayer.properties[color].length - 1; i >= 0; i--) {
      const propertyCard = fromPlayer.properties[color][i];
      
      // Skip 10-way wildcard properties
      if (propertyCard.wildcard && propertyCard.originalColors && 
          (propertyCard.originalColors.includes('any') || propertyCard.originalColors[0] === 'any')) {
        console.log(`  * PROTECTED: Skipping 10-way wildcard property "${propertyCard.name}"`);
        continue;
      }
      
      // Ensure recipient has the color array
      if (!toPlayer.properties[color]) {
        toPlayer.properties[color] = [];
      }
      
      // Add to recipient and remove from sender
      toPlayer.properties[color].push(propertyCard);
      fromPlayer.properties[color].splice(i, 1);
      
      console.log(`  * Transferred ${color} property "${propertyCard.name}" worth $${propertyCard.value}M`);
    }
  });
  
  // Calculate final assets for logging
  const finalFromTotal = window.MonopolyDeal.calculateAvailableAssets(fromPlayerNumber);
  console.log(`Player ${fromPlayerNumber} now has $${finalFromTotal}M in available assets (should be 0 plus protected wildcards)`);
  console.log(`==========================================================`);
  
  // Update actions left counter after transferring assets
  window.MonopolyDeal.updateActionsLeftCounter();
  
  return true;
};

// Export the new functions
window.MonopolyDeal.calculateAvailableAssets = window.MonopolyDeal.calculateAvailableAssets;
window.MonopolyDeal.takeAllAvailableAssets = window.MonopolyDeal.takeAllAvailableAssets;
window.MonopolyDeal.hasAnyAvailableAssets = window.MonopolyDeal.hasAnyAvailableAssets;

// Check if a player has any available assets (money or properties, excluding 10-way wildcards)
window.MonopolyDeal.hasAnyAvailableAssets = function(playerNumber) {
  console.log(`Checking if player ${playerNumber} has any available assets...`);
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  
  // Check if player has any money
  if (player.money.length > 0) {
    console.log(`Player ${playerNumber} has money cards: ${player.money.length}`);
    return true;
  }
  
  // Check if player has any properties (excluding 10-way wildcards)
  for (const color in player.properties) {
    for (const property of player.properties[color]) {
      // Skip 10-way wildcard properties
      if (property.wildcard && property.originalColors && 
          (property.originalColors.includes('any') || property.originalColors[0] === 'any')) {
        continue;
      }
      
      // Found a regular property
      console.log(`Player ${playerNumber} has available property: ${property.name}`);
      return true;
    }
  }
  
  console.log(`Player ${playerNumber} has no available assets (no money and no non-wildcard properties)`);
  return false;
};

// Export the new functions
window.MonopolyDeal.calculateAvailableAssets = window.MonopolyDeal.calculateAvailableAssets;
window.MonopolyDeal.takeAllAvailableAssets = window.MonopolyDeal.takeAllAvailableAssets;
window.MonopolyDeal.hasAnyAvailableAssets = window.MonopolyDeal.hasAnyAvailableAssets;

// Update the actions left counter
window.MonopolyDeal.updateActionsLeftCounter = function() {
  const actionsLeftCounter = document.getElementById('actions-left-counter');
  const currentPlayerIndicator = document.getElementById('current-player-indicator');
  
  if (!actionsLeftCounter || !currentPlayerIndicator) return;
  
  // Update the current player indicator
  const currentPlayer = window.MonopolyDeal.gameState.currentPlayer;
  currentPlayerIndicator.textContent = `Player ${currentPlayer}`;
  
  // If cards haven't been drawn yet, show "Draw"
  if (!window.MonopolyDeal.gameState.hasDrawnCards) {
    actionsLeftCounter.textContent = "Draw";
    actionsLeftCounter.classList.remove('zero');
    return;
  }
  
  // Simply show remaining actions (3 - cards played)
  const maxActionsPerTurn = 3;
  const actionsPlayed = window.MonopolyDeal.gameState.cardsPlayedThisTurn;
  const actionsLeft = Math.max(0, maxActionsPerTurn - actionsPlayed);
  
  // Just display the number directly
  actionsLeftCounter.textContent = actionsLeft;
  
  // Add 'zero' class only if no actions left
  if (actionsLeft === 0) {
    actionsLeftCounter.classList.add('zero');
  } else {
    actionsLeftCounter.classList.remove('zero');
  }
};

// Export the function
window.MonopolyDeal.updateActionsLeftCounter = window.MonopolyDeal.updateActionsLeftCounter;

// Helper function to get card image path
window.MonopolyDeal.getCardImagePath = function(card) {
  if (card.type === 'money') {
    let filename;
    switch (card.value) {
      case 1:
        filename = '1million';
        break;
      case 2:
        filename = '2million';
        break;
      case 3:
        filename = '3million';
        break;
      case 4:
        filename = '4million';
        break;
      case 5:
        filename = '5million';
        break;
      case 10:
        filename = '10million';
        break;
      default:
        return null;
    }
    return `images/cards/${filename}.jpg`;
  }
  
  if (card.type === 'property') {
    let filename;
    if (card.wildcard) {
      // Use the imageCode directly if available
      if (card.imageCode) {
        filename = card.imageCode;
        // Add _flipped suffix if card is flipped
        if (card.isFlipped) {
          filename += '_flipped';
        }
      } else if (card.colors && card.colors[0] === 'any') {
        filename = 'propertywildcard';
      }
    } else {
      // Regular properties - exact filenames from directory
      const propertyNameMap = {
        'St. James Place': 'stjamesplace',
        'St. Charles Place': 'stcharlesplace',
        'States Avenue': 'statesavenue',
        'Virginia Avenue': 'virginiaavenue',
        'Tennessee Avenue': 'tennesseeavenue',
        'New York Avenue': 'newyorkavenue',
        'Kentucky Avenue': 'kentuckyavenue',
        'Indiana Avenue': 'indianaavenue',
        'Illinois Avenue': 'illinoisavenue',
        'Atlantic Avenue': 'atlanticavenue',
        'Ventnor Avenue': 'ventnoravenue',
        'Marvin Gardens': 'marvingardens',
        'Pacific Avenue': 'pacificavenue',
        'North Carolina Avenue': 'northcarolinaavenue',
        'Pennsylvania Avenue': 'pennsylvaniaavenue',
        'Park Place': 'parkplace',
        'Boardwalk': 'boardwalk',
        'Reading Railroad': 'readingrailroad',
        'Pennsylvania Railroad': 'pennsylvaniarailroad',
        'B. & O. Railroad': 'b&orailroad',
        'Short Line': 'shortline',
        'Electric Company': 'electriccompany',
        'Water Works': 'waterworks',
        'Mediterranean Avenue': 'mediterraneanavenue',
        'Baltic Avenue': 'balticavenue',
        'Oriental Avenue': 'orientalavenue',
        'Vermont Avenue': 'vermontavenue',
        'Connecticut Avenue': 'connecticutavenue'
      };
      filename = propertyNameMap[card.name];
      if (!filename) {
        console.error('Unknown property name:', card.name);
        return null;
      }
    }
    return `images/cards/${filename}.jpg`;
  }
  
  if (card.type === 'action') {
    let filename;
    switch (card.action) {
      case 'pass-go':
        filename = 'passgo';
        break;
      case 'deal-breaker':
        filename = 'dealbreaker';
        break;
      case 'sly-deal':
        filename = 'slydeal';
        break;
      case 'forced-deal':
        filename = 'forceddeal';
        break;
      case 'debt-collector':
        filename = 'debtcollector';
        break;
      case 'birthday':
        filename = 'itsmybirthday';
        break;
      case 'just-say-no':
        filename = 'justsayno';
        break;
      case 'house':
        filename = 'house';
        break;
      case 'hotel':
        filename = 'hotel';
        break;
      case 'double-rent':
        filename = 'doubletherent';
        break;
      case 'wild-rent':
        filename = 'rentwild';
        break;
      case 'property-rent':
        switch (card.rentType) {
          case 'brown-light-blue':
            filename = 'rentlbbr';
            break;
          case 'purple-orange':
            filename = 'rentop';
            break;
          case 'red-yellow':
            filename = 'rentry';
            break;
          case 'green-blue':
            filename = 'rentbg';
            break;
          case 'railroad-utility':
            filename = 'rentut';
            break;
          default:
            return null;
        }
        break;
      default:
        return null;
    }
    return `images/cards/${filename}.jpg`;
  }
  
  return null;
};

// Get the color for money cards based on value
window.MonopolyDeal.getMoneyColor = function(value) {
  switch (parseInt(value)) {
    case 1:
      return '#C5E1A5'; // Light green
    case 2:
      return '#AED581'; // Slightly darker green
    case 3:
      return '#9CCC65'; // Medium green
    case 4:
      return '#8BC34A'; // Standard green
    case 5:
      return '#7CB342'; // Darker green
    case 10:
      return '#689F38'; // Darkest green
    default:
      return '#DCEDC8'; // Very light green fallback
  }
};

// Helper function to increment cards played and update the counter
window.MonopolyDeal.incrementCardsPlayed = function() {
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  window.MonopolyDeal.updateActionsLeftCounter();
  console.log(`Cards played this turn: ${window.MonopolyDeal.gameState.cardsPlayedThisTurn}`);
};

// Handle wildcard reassignment when they're no longer part of a set
window.MonopolyDeal.handleWildcardReassignment = function(playerNumber) {
  console.log(`Checking if wildcards need to be reassigned for player ${playerNumber}`);
  
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  if (!player || !player.properties) return false;
  
  let reassignmentMade = false;
  
  // We're not doing any reassignment of 2-way wildcards now
  // The 2-way wildcards should stay in their original color groups
  // and be flippable between the two colors they represent
  
  // Only 10-way wildcards will be reassigned to the 'any' group
  // and they need to be explicitly moved by the player using the color selection modal
  
  return reassignmentMade;
};

// Play Sly Deal card
window.MonopolyDeal.playSlyDeal = function(playerNumber, cardIndex, targetPlayer, targetColor, targetPropertyIndex) {
  console.log(`Playing Sly Deal card for player ${playerNumber} against player ${targetPlayer} for ${targetColor} property at index ${targetPropertyIndex}`);
  
  const player = window.MonopolyDeal.gameState.players[playerNumber];
  const card = player.hand[cardIndex];
  
  // Verify it's a Sly Deal card
  if (!card || card.type !== 'action' || card.action !== 'sly-deal') {
    console.error('Invalid Sly Deal card');
    return false;
  }
  
  // Verify the target player and property exist
  const targetPlayerObj = window.MonopolyDeal.gameState.players[targetPlayer];
  if (!targetPlayerObj || !targetPlayerObj.properties || 
      !targetPlayerObj.properties[targetColor] || 
      !targetPlayerObj.properties[targetColor][targetPropertyIndex]) {
    console.error('Invalid target player or property');
    return false;
  }
  
  // Verify the property isn't part of a complete set
  if (window.MonopolyDeal.isFullPropertySet(targetPlayer, targetColor)) {
    console.error('Cannot steal from a complete property set');
    return false;
  }
  
  // Verify the property isn't a 10-way wildcard
  const targetProperty = targetPlayerObj.properties[targetColor][targetPropertyIndex];
  if (targetProperty.wildcard && targetProperty.originalColors && 
      (targetProperty.originalColors.includes('any') || targetProperty.originalColors[0] === 'any')) {
    console.error('Cannot steal a 10-way wildcard property');
    return false;
  }
  
  // Set up the action response system for Just Say No
  window.MonopolyDeal.gameState.actionResponse = {
    pending: true,
    type: 'property-steal',
    fromPlayer: targetPlayer,  // Player who will lose the property (target of the action)
    toPlayer: playerNumber,    // Player who will receive the property (initiator of the action)
    justSayNoChain: 0,
    actionCard: card,
    payload: { color: targetColor, index: targetPropertyIndex }
  };
  
  // Update game status
  window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played Sly Deal against Player ${targetPlayer} for ${targetColor} property. Waiting for response...`);
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} played Sly Deal against Player ${targetPlayer} for ${targetColor} property`);
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Place card in action pile
  window.MonopolyDeal.placeActionCard(card);
  
  // Increment cards played this turn
  window.MonopolyDeal.incrementCardsPlayed();
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  window.MonopolyDeal.updateActionsLeftCounter();
  
  // Show response options to the target player
  window.MonopolyDeal.showActionResponseOptions();
  
  return true;
};

// Execute Sly Deal action (steal a single property)
window.MonopolyDeal.executeSlyDealAction = function() {
  const actionResponse = window.MonopolyDeal.gameState.actionResponse;
  if (!actionResponse || actionResponse.type !== 'property-steal') {
    console.error('Invalid action response for Sly Deal');
    return false;
  }
  
  const fromPlayer = window.MonopolyDeal.gameState.players[actionResponse.fromPlayer];
  const toPlayer = window.MonopolyDeal.gameState.players[actionResponse.toPlayer];
  const targetColor = actionResponse.payload.color;
  const targetIndex = actionResponse.payload.index;
  
  // Check if target property still exists
  if (!fromPlayer.properties[targetColor] || !fromPlayer.properties[targetColor][targetIndex]) {
    console.error('Target property no longer exists');
    window.MonopolyDeal.completeActionResponse();
    return false;
  }
  
  // Get the property card
  const property = fromPlayer.properties[targetColor][targetIndex];
  
  // Create target color group if it doesn't exist for receiver
  if (!toPlayer.properties[targetColor]) {
    toPlayer.properties[targetColor] = [];
  }
  
  // Transfer the property
  toPlayer.properties[targetColor].push(property);
  fromPlayer.properties[targetColor].splice(targetIndex, 1);
  
  // Check if any wildcards need to be reassigned after property transfer
  window.MonopolyDeal.handleWildcardReassignment(actionResponse.fromPlayer);
  
  // Update UI
  window.MonopolyDeal.updatePlayerPropertiesUI(actionResponse.fromPlayer);
  window.MonopolyDeal.updatePlayerPropertiesUI(actionResponse.toPlayer);
  
  // Update game status
  window.MonopolyDeal.updateGameStatus(`Player ${actionResponse.toPlayer} successfully stole a ${targetColor} property from Player ${actionResponse.fromPlayer}`);
  window.MonopolyDeal.addToHistory(`Player ${actionResponse.toPlayer} stole a ${targetColor} property from Player ${actionResponse.fromPlayer}`);
  
  // Complete the action response flow
  window.MonopolyDeal.completeActionResponse();
  
  // Check if this action resulted in a win
  window.MonopolyDeal.checkForWin(actionResponse.toPlayer);
  
  return true;
};

// Execute Deal Breaker action (steal a complete set)
window.MonopolyDeal.executeDealBreakerAction = function() {
  const actionResponse = window.MonopolyDeal.gameState.actionResponse;
  if (!actionResponse || actionResponse.type !== 'property-steal-set') {
    console.error('Invalid action response for Deal Breaker');
    return false;
  }
  
  const fromPlayer = window.MonopolyDeal.gameState.players[actionResponse.fromPlayer];
  const toPlayer = window.MonopolyDeal.gameState.players[actionResponse.toPlayer];
  const targetSet = actionResponse.payload.color;
  
  // Check if target set still exists and is complete
  if (!fromPlayer.properties[targetSet] || !window.MonopolyDeal.isFullPropertySet(actionResponse.fromPlayer, targetSet)) {
    console.error('Target property set is no longer valid');
    window.MonopolyDeal.completeActionResponse();
    return false;
  }
  
  // Create target property array if it doesn't exist
  if (!toPlayer.properties[targetSet]) {
    toPlayer.properties[targetSet] = [];
  }
  
  // Transfer all properties in the set
  const propertiesToTransfer = [...fromPlayer.properties[targetSet]];
  
  propertiesToTransfer.forEach(property => {
    toPlayer.properties[targetSet].push(property);
  });
  
  // Clear the properties from the source player
  fromPlayer.properties[targetSet] = [];
  
  // Check if any wildcards need to be reassigned
  window.MonopolyDeal.handleWildcardReassignment(actionResponse.fromPlayer);
  
  // Update UI
  window.MonopolyDeal.updatePlayerPropertiesUI(actionResponse.fromPlayer);
  window.MonopolyDeal.updatePlayerPropertiesUI(actionResponse.toPlayer);
  
  // Update game status
  window.MonopolyDeal.updateGameStatus(`Player ${actionResponse.toPlayer} successfully stole the ${targetSet} set from Player ${actionResponse.fromPlayer}`);
  window.MonopolyDeal.addToHistory(`Player ${actionResponse.toPlayer} stole the ${targetSet} set from Player ${actionResponse.fromPlayer}`);
  
  // Complete the action response flow
  window.MonopolyDeal.completeActionResponse();
  
  // Check if this action resulted in a win
  window.MonopolyDeal.checkForWin(actionResponse.toPlayer);
  
  return true;
};