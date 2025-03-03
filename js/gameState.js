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
  history: []
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
      history: []
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

// Play a card from hand
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
  
  // Process card based on type
  switch (card.type) {
    case 'money':
      player.money.push(card);
      window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played ${card.value}M as money`);
      window.MonopolyDeal.addToHistory(`Player ${playerNumber} played ${card.value}M as money`);
      break;
      
    case 'property':
      // Check if it's a wildcard property with multiple colors
      if (card.wildcard && card.colors && card.colors.length > 1) {
        // For wildcard properties, add additional information to track
        card.activeColor = card.color; // Track which color is currently active
        card.isWildcard = true; // Mark this as a wildcard (for easier filtering later)
        card.originalColors = [...card.colors]; // Store original color options
        console.log(`Playing wildcard property with colors: ${card.colors.join(', ')}, active color: ${card.activeColor}`);
      } else if (card.wildcard && card.colors && card.colors[0] === 'any') {
        // For full wildcard property (any color)
        card.isWildcard = true;
        card.originalColors = ['any']; // This is a special case
        card.color = 'any'; // Start with 'any' as the color
        card.activeColor = 'any';
        console.log(`Playing full wildcard property that can be any color`);
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
  
  // Increment cards played this turn
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  window.MonopolyDeal.updatePlayerMoneyUI(playerNumber);
  window.MonopolyDeal.updatePlayerPropertiesUI(playerNumber);
  window.MonopolyDeal.updateActionsLeftCounter();
  
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
  
  // Create card preview
  cardPreviewElement.innerHTML = '';
  const cardElement = document.createElement('div');
  cardElement.className = 'card action-card';
  
  // Enhanced display for rent cards
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
      const opponentTotalValue = window.MonopolyDeal.calculatePlayerAssetValue(opponentNumber);
      const opponentHasAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentNumber);
      
      // Only disable if opponent has no assets at all
      if (!opponentHasAssets) {
        debtCollectorButton.disabled = true;
        debtCollectorButton.textContent += ' (Opponent has no available assets)';
      } else if (opponentTotalValue < 5) {
        // If they can't pay the full amount, show a warning but still allow the action
        debtCollectorButton.textContent += ' (Insufficient funds - will take all available assets)';
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
          rentButton.textContent = `Collect rent for ${color} properties`;
          
          // Calculate rent value based on property count
          const rentValue = window.MonopolyDeal.calculateRentForProperties(playerNumber, color);
          rentButton.textContent += ` ($${rentValue}M)`;
          
          // Check if opponent has any assets to pay
          const opponentNumber = playerNumber === 1 ? 2 : 1;
          const opponentTotalValue = window.MonopolyDeal.calculatePlayerAssetValue(opponentNumber);
          const opponentHasAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentNumber);
          
          // Only disable if opponent has no assets at all
          if (!opponentHasAssets) {
            rentButton.disabled = true;
            rentButton.textContent += ' (Opponent has no available assets)';
          } else if (opponentTotalValue < rentValue) {
            // If they can't pay the full amount, show a warning but still allow the action
            rentButton.textContent += ' (Insufficient funds - will take all available assets)';
            hasValidRentTarget = true;
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
          rentButton.textContent = `Collect rent for ${color} properties`;
          
          // Calculate rent value based on property count
          const rentValue = window.MonopolyDeal.calculateRentForProperties(playerNumber, color);
          rentButton.textContent += ` ($${rentValue}M)`;
          
          // Check if opponent has any assets to pay
          const opponentNumber = playerNumber === 1 ? 2 : 1;
          const opponentTotalValue = window.MonopolyDeal.calculatePlayerAssetValue(opponentNumber);
          const opponentHasAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentNumber);
          
          // Only disable if opponent has no assets at all
          if (!opponentHasAssets) {
            rentButton.disabled = true;
            rentButton.textContent += ' (Opponent has no available assets)';
          } else if (opponentTotalValue < rentValue) {
            // If they can't pay the full amount, show a warning but still allow the action
            rentButton.textContent += ' (Insufficient funds - will take all available assets)';
            hasValidWildRentTarget = true;
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
          rentButton.textContent = `Collect rent for ${color} properties`;
          
          // Calculate rent value based on property count
          const rentValue = window.MonopolyDeal.calculateRentForProperties(playerNumber, color);
          rentButton.textContent += ` ($${rentValue}M)`;
          
          // Check if opponent has any assets to pay
          const opponentNumber = playerNumber === 1 ? 2 : 1;
          const opponentTotalValue = window.MonopolyDeal.calculatePlayerAssetValue(opponentNumber);
          const opponentHasAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentNumber);
          
          // Only disable if opponent has no assets at all
          if (!opponentHasAssets) {
            rentButton.disabled = true;
            rentButton.textContent += ' (Opponent has no available assets)';
          } else if (opponentTotalValue < rentValue) {
            // If they can't pay the full amount, show a warning but still allow the action
            rentButton.textContent += ' (Insufficient funds - will take all available assets)';
            hasValidRentTargetLegacy = true;
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
      const opponentBirthdayValue = window.MonopolyDeal.calculatePlayerAssetValue(opponentForBirthday);
      const opponentHasBirthdayAssets = window.MonopolyDeal.hasAnyAvailableAssets(opponentForBirthday);
      
      // Only disable if opponent has no assets at all
      if (!opponentHasBirthdayAssets) {
        birthdayButton.disabled = true;
        birthdayButton.textContent += ' (Opponent has no available assets)';
      } else if (opponentBirthdayValue < 2) {
        // If they can't pay the full amount, show a warning but still allow the action
        birthdayButton.textContent += ' (Insufficient funds - will take all available assets)';
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
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  
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
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  
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
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  
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
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  
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
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  
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
  
  // Switch to the perspective of the player who needs to respond
  window.MonopolyDeal.currentPerspective = fromPlayer;
  
  // Update UI
  window.MonopolyDeal.updateAllPlayerUIs();
  
  // Show response options when in target player's perspective
  window.MonopolyDeal.showActionResponseOptions();
  
  return true;
};

// Show the payment modal with all selectable assets
window.MonopolyDeal.showPaymentModal = function() {
  console.log('Showing payment modal...');
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) {
    console.error('No payment request found!');
    return;
  }

  // Calculate total available assets
  const availableAssets = window.MonopolyDeal.calculateAvailableAssets(paymentRequest.fromPlayer);
  console.log(`Total available assets: $${availableAssets}M, Required amount: $${paymentRequest.amount}M`);

  // If available assets are less than or equal to required amount, automatically transfer all
  if (availableAssets <= paymentRequest.amount) {
    console.log('Available assets less than or equal to required amount - automatically transferring all assets');
    window.MonopolyDeal.takeAllAvailableAssets(paymentRequest.fromPlayer, paymentRequest.toPlayer);
    
    // Show message to user
    window.MonopolyDeal.showTemporaryMessage(`Automatically transferred all available assets ($${availableAssets}M) as payment`, 3000);
    
    // Update game status
    if (availableAssets < paymentRequest.amount) {
      window.MonopolyDeal.updateGameStatus(`Player ${paymentRequest.fromPlayer} made a partial payment of $${availableAssets}M to Player ${paymentRequest.toPlayer} (all available assets)`);
      window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} made a partial payment of $${availableAssets}M (all available assets)`);
    } else {
      window.MonopolyDeal.updateGameStatus(`Player ${paymentRequest.fromPlayer} paid $${availableAssets}M to Player ${paymentRequest.toPlayer}`);
      window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} paid $${availableAssets}M`);
    }
    
    // Reset payment state
    window.MonopolyDeal.gameState.paymentPending = false;
    window.MonopolyDeal.gameState.paymentMode = false;
    window.MonopolyDeal.gameState.paymentRequest = null;
    window.MonopolyDeal.gameState.selectedPaymentAssets = {
      money: [],
      properties: []
    };
    
    // Return to the perspective of the player whose turn it is
    const currentPlayer = window.MonopolyDeal.gameState.currentPlayer;
    if (window.MonopolyDeal.currentPerspective !== currentPlayer) {
      window.MonopolyDeal.currentPerspective = currentPlayer;
      window.MonopolyDeal.updateAllPlayerUIs();
    }
    
    return;
  }

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
  
  // Reset progress bar
  const progressBar = document.getElementById('payment-progress-bar');
  if (progressBar) {
    progressBar.style.width = '0%';
    progressBar.classList.remove('sufficient');
  }
  
  // Set up modal close button - prevent closing until payment is complete
  const closeButton = paymentModal.querySelector('.close');
  if (closeButton) {
    // Remove existing listeners by replacing the element
    const newCloseButton = closeButton.cloneNode(true);
    closeButton.parentNode.replaceChild(newCloseButton, closeButton);
    
    // Add new listener that prevents closing
    newCloseButton.addEventListener('click', function() {
      window.MonopolyDeal.showTemporaryMessage('You must complete the payment before closing this window.', 3000);
    });
  }
  
  // Set up payment confirm button
  const confirmButton = document.getElementById('payment-confirm-btn');
  if (confirmButton) {
    // Reset button state
    confirmButton.disabled = true;
    confirmButton.textContent = 'Pay';
    
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
  
  // Add empty message if no assets
  if (fromPlayer.money.length === 0) {
    moneyContainer.innerHTML = '<div class="empty-message">No money cards available.</div>';
    return;
  }
  
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
      decrementButton.addEventListener('click', function() {
        // Find first selected card of this denomination
        for (let i = 0; i < denominationGroups[value].cards.length; i++) {
          const cardInfo = denominationGroups[value].cards[i];
          if (cardInfo.selected) {
            window.MonopolyDeal.togglePaymentAsset('money', cardInfo.index);
            break;
          }
        }
      });
      
      // Count display
      const selectionCount = document.createElement('span');
      selectionCount.className = 'selection-count';
      selectionCount.textContent = denominationGroups[value].selectedCount;
      
      // Increment button
      const incrementButton = document.createElement('button');
      incrementButton.className = 'selection-button increment';
      incrementButton.textContent = '+';
      incrementButton.disabled = denominationGroups[value].selectedCount === denominationGroups[value].count;
      incrementButton.addEventListener('click', function() {
        // Find first unselected card of this denomination and select it
        for (let i = 0; i < denominationGroups[value].cards.length; i++) {
          const cardInfo = denominationGroups[value].cards[i];
          if (!cardInfo.selected) {
            window.MonopolyDeal.togglePaymentAsset('money', cardInfo.index);
            break;
          }
        }
      });
      
      controlsElement.appendChild(decrementButton);
      controlsElement.appendChild(selectionCount);
      controlsElement.appendChild(incrementButton);
      
      denominationBox.appendChild(controlsElement);
      
      // Add selection class if any cards are selected
      if (denominationGroups[value].selectedCount > 0) {
        denominationBox.classList.add('selected');
      }
      
      moneyContainer.appendChild(denominationBox);
    }
  });
  
  // Check if player has any properties
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
      
      // Skip 10-way wildcard properties (they cannot be given as payment)
      if (property.wildcard && property.originalColors && 
          (property.originalColors.includes('any') || property.originalColors[0] === 'any')) {
        // Create property card with special styling
        const cardElement = document.createElement('div');
        cardElement.className = `card property-card ${color}-property protected-wildcard`;
        cardElement.innerHTML = `
          <div class="property-name">${property.name}</div>
          <div class="property-value">$${property.value}M</div>
          <div class="property-protected-overlay">Protected</div>`;
        cardElement.dataset.color = color;
        cardElement.dataset.index = i;
        
        // Add a tooltip or informational hover effect
        cardElement.title = "This full wildcard property cannot be given as payment";
        
        propertiesContainer.appendChild(cardElement);
        continue; // Skip to the next property
      }
      
      // Create normal property card
      const cardElement = document.createElement('div');
      cardElement.className = `card property-card ${color}-property payment-selectable`;
      cardElement.innerHTML = `
        <div class="property-name">${property.name}</div>
        <div class="property-value">$${property.value}M</div>`;
      cardElement.dataset.color = color;
      cardElement.dataset.index = i;
      
      // Add wildcard data attribute if it's a wildcard
      if (property.wildcard && property.originalColors) {
        cardElement.classList.add('property-wildcard');
        cardElement.dataset.colors = property.originalColors.join('-');
        
        // For any-color wildcards, use special data attribute
        if (property.originalColors.includes('any') || property.originalColors[0] === 'any') {
          cardElement.dataset.colors = 'any';
        }
      }
      
      // Check if this property is already selected
      const isSelected = window.MonopolyDeal.gameState.selectedPaymentAssets.properties.some(
        p => p.color === color && p.index === i
      );
      
      if (isSelected) {
        cardElement.classList.add('payment-selected');
      }
      
      // Add selection overlay
      const overlay = document.createElement('div');
      overlay.className = 'payment-overlay';
      overlay.textContent = 'Select';
      cardElement.appendChild(overlay);
      
      // Add click handler
      cardElement.addEventListener('click', function() {
        window.MonopolyDeal.togglePaymentAsset('property', i, color);
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
  console.log(`Selected payment total: $${selectedTotal}M of $${paymentRequest.amount}M required`);
  
  // Transfer selected assets (even if insufficient)
  console.log(`Transferring ${window.MonopolyDeal.gameState.selectedPaymentAssets.money.length} money cards and ${window.MonopolyDeal.gameState.selectedPaymentAssets.properties.length} property cards`);
  
  // Sort indices in descending order so we remove from back to front
  const moneyIndices = [...window.MonopolyDeal.gameState.selectedPaymentAssets.money].sort((a, b) => b - a);
  
  // Transfer money cards
  moneyIndices.forEach(index => {
    if (fromPlayer.money[index]) {
      // Get the card
      const card = fromPlayer.money[index];
      
      // Add to recipient
      toPlayer.money.push(card);
      
      // Remove from sender (using splice to remove at specific index)
      fromPlayer.money.splice(index, 1);
      
      console.log(`Transferred money card worth $${card.value}M from Player ${paymentRequest.fromPlayer} to Player ${paymentRequest.toPlayer}`);
    }
  });
  
  // Sort property indices by color and then by index (descending)
  const propertyTransfers = [...window.MonopolyDeal.gameState.selectedPaymentAssets.properties];
  
  // Group properties by color
  const transfersByColor = {};
  propertyTransfers.forEach(transfer => {
    if (!transfersByColor[transfer.color]) {
      transfersByColor[transfer.color] = [];
    }
    transfersByColor[transfer.color].push(transfer.index);
  });
  
  // Transfer properties (for each color, sort indices in descending order)
  for (const color in transfersByColor) {
    const indices = transfersByColor[color].sort((a, b) => b - a);
    
    indices.forEach(index => {
      if (fromPlayer.properties[color] && fromPlayer.properties[color][index]) {
        // Get the property card
        const propertyCard = fromPlayer.properties[color][index];
        
        // Ensure recipient has the color array
        if (!toPlayer.properties[color]) {
          toPlayer.properties[color] = [];
        }
        
        // Add to recipient
        toPlayer.properties[color].push(propertyCard);
        
        // Remove from sender
        fromPlayer.properties[color].splice(index, 1);
        
        console.log(`Transferred ${color} property "${propertyCard.name}" worth $${propertyCard.value}M from Player ${paymentRequest.fromPlayer} to Player ${paymentRequest.toPlayer}`);
      }
    });
  }
  
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
  
  // Update game status based on payment amount
  if (selectedTotal < paymentRequest.amount) {
    window.MonopolyDeal.updateGameStatus(`Player ${paymentRequest.fromPlayer} made a partial payment of $${selectedTotal}M to Player ${paymentRequest.toPlayer} (short by $${paymentRequest.amount - selectedTotal}M)`);
    window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} made a partial payment of $${selectedTotal}M to Player ${paymentRequest.toPlayer}`);
  } else {
    window.MonopolyDeal.updateGameStatus(`Payment of $${selectedTotal}M completed from Player ${paymentRequest.fromPlayer} to Player ${paymentRequest.toPlayer}`);
    window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} paid $${selectedTotal}M to Player ${paymentRequest.toPlayer}`);
  }
  
  // Show success notification
  window.MonopolyDeal.showTemporaryMessage('Payment processed!', 2000);
  
  // Return to the perspective of the player whose turn it is
  const currentPlayer = window.MonopolyDeal.gameState.currentPlayer;
  if (window.MonopolyDeal.currentPerspective !== currentPlayer) {
    window.MonopolyDeal.currentPerspective = currentPlayer;
    window.MonopolyDeal.updateAllPlayerUIs();
  }
  
  return true;
};

// Toggle selection of an asset for payment
window.MonopolyDeal.togglePaymentAsset = function(type, index, color = null) {
  console.log(`Toggling payment asset: ${type} at index ${index}${color ? ' color ' + color : ''}`);
  
  // Calculate current selected total
  let currentTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
  console.log(`Current payment total: $${currentTotal}M`);
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) {
    console.error('No payment request found!');
    return;
  }
  
  // Get card value being toggled
  let cardValue = 0;
  
  if (type === 'money') {
    const player = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
    const card = player.money[index];
    
    if (card) {
      cardValue = card.value;
    } else {
      console.error(`Money card at index ${index} not found!`);
      return;
    }
  } else if (type === 'property') {
    const player = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
    if (player.properties[color] && player.properties[color][index]) {
      cardValue = player.properties[color][index].value;
    } else {
      console.error(`Property card at color ${color}, index ${index} not found!`);
      return;
    }
  }
  
  // Check if this card is already selected
  let selectedAssets;
  let isAlreadySelected = false;
  
  if (type === 'money') {
    selectedAssets = window.MonopolyDeal.gameState.selectedPaymentAssets.money;
    isAlreadySelected = selectedAssets.includes(index);
  } else if (type === 'property') {
    selectedAssets = window.MonopolyDeal.gameState.selectedPaymentAssets.properties;
    isAlreadySelected = selectedAssets.some(p => p.color === color && p.index === index);
  }
  
  // Deselecting: Always allow this
  if (isAlreadySelected) {
    console.log(`Deselecting ${type} asset`);
    
    if (type === 'money') {
      // Remove from selected assets
      window.MonopolyDeal.gameState.selectedPaymentAssets.money = selectedAssets.filter(i => i !== index);
    } else if (type === 'property') {
      // Remove from selected properties
      window.MonopolyDeal.gameState.selectedPaymentAssets.properties = selectedAssets.filter(
        p => !(p.color === color && p.index === index)
      );
    }
  } 
  // Selecting: Check if we're already at or over payment amount
  else {
    console.log(`Selecting ${type} asset worth $${cardValue}M`);
    
    // Check if adding this card would exceed payment, but only warn if it's significantly over
    if (currentTotal >= paymentRequest.amount && cardValue > 1) {
      console.log(`Warning: Current total $${currentTotal}M already meets or exceeds payment amount $${paymentRequest.amount}M`);
      
      // Show warning if this would be significantly over the required amount
      if (currentTotal + cardValue > paymentRequest.amount * 1.5) {
        const overAmount = currentTotal + cardValue - paymentRequest.amount;
        window.MonopolyDeal.showTemporaryMessage(
          `You would be overpaying by $${overAmount}M. Are you sure?`,
          3000
        );
      }
    }
    
    // Add to selected assets
    if (type === 'money') {
      window.MonopolyDeal.gameState.selectedPaymentAssets.money.push(index);
    } else if (type === 'property') {
      window.MonopolyDeal.gameState.selectedPaymentAssets.properties.push({
        color: color,
        index: index
      });
    }
  }
  
  // Update payment UI in the modal
  window.MonopolyDeal.updatePaymentUI();
  
  // Also update player UIs to reflect selection changes
  window.MonopolyDeal.updatePlayerMoneyUI(paymentRequest.fromPlayer);
  window.MonopolyDeal.updatePlayerPropertiesUI(paymentRequest.fromPlayer);
};

// Update the payment UI elements
window.MonopolyDeal.updatePaymentUI = function() {
  console.log('Updating payment UI...');
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) return;
  
  // Get selected total
  const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
  const hasFullAmount = selectedTotal >= paymentRequest.amount;
  
  // Update current amount
  const currentAmountElement = document.getElementById('payment-current-amount');
  if (currentAmountElement) {
    currentAmountElement.textContent = selectedTotal;
  }
  
  // Update required amount
  const requiredAmountElement = document.getElementById('payment-required-amount');
  if (requiredAmountElement) {
    requiredAmountElement.textContent = paymentRequest.amount;
  }
  
  // Update progress bar
  const progressBar = document.getElementById('payment-progress-bar');
  if (progressBar) {
    const progressPercentage = Math.min(100, (selectedTotal / paymentRequest.amount) * 100);
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
    confirmButton.disabled = !hasFullAmount;
    confirmButton.textContent = hasFullAmount ? 'Pay' : `Select $${paymentRequest.amount}M`;
  }
  
  // Repopulate payment selection containers if needed
  window.MonopolyDeal.populatePaymentSelectionContainers();
};

// Update the payment confirm button state based on selected total
window.MonopolyDeal.updatePaymentButtonState = function() {
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) return;
  
  // Calculate selected total
  const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
  const hasSelection = selectedTotal > 0;
  
  // Update payment status display
  document.getElementById('payment-selected-amount').textContent = selectedTotal;
  document.getElementById('payment-required-amount').textContent = paymentRequest.amount;
  
  // Update progress bar
  const progressBar = document.getElementById('payment-progress-bar');
  if (progressBar) {
    const percentage = Math.min(100, (selectedTotal / paymentRequest.amount) * 100);
    progressBar.style.width = `${percentage}%`;
    
    if (selectedTotal >= paymentRequest.amount) {
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
      
      if (selectedTotal >= paymentRequest.amount) {
        confirmButton.textContent = `Send Full Payment ($${selectedTotal}M)`;
      } else {
        confirmButton.textContent = `Send Partial Payment ($${selectedTotal}M of $${paymentRequest.amount}M)`;
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
    
    denominationContainer.appendChild(box);
  });
  
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

// Required properties for a complete set
const REQUIRED_PROPERTIES = {
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

window.MonopolyDeal.updatePlayerPropertiesUI = function(playerNumber) {
  console.log(`Updating properties UI for player ${playerNumber}...`);
  
  const propertiesElement = playerNumber === 1 ? 
    document.getElementById('opponent-properties') : 
    document.getElementById('player-properties');
  
  if (!propertiesElement) {
    console.error(`Properties element for player ${playerNumber} not found`);
    return false;
  }
  
  const playerProperties = window.MonopolyDeal.gameState.players[playerNumber].properties;
  propertiesElement.innerHTML = '';
  
  // Create property groups for each color
  Object.keys(playerProperties).forEach(color => {
    const properties = playerProperties[color];
    if (properties.length === 0) return;
    
    const groupElement = document.createElement('div');
    groupElement.className = `property-group ${color}-group`;
    
    // Check if this color group forms a monopoly
    const requiredCount = REQUIRED_PROPERTIES[color] || 3; // Default to 3 if not specified
    let effectiveCount = 0;
    
    // Count regular properties and wildcards
    properties.forEach(property => {
      if (property.wildcard) {
        // For 10-way wildcards (can be any color)
        if (property.originalColors && property.originalColors.includes('any')) {
          effectiveCount++;
        }
        // For 2-way wildcards
        else if (property.originalColors && property.originalColors.length === 2) {
          effectiveCount++;
        }
      } else {
        effectiveCount++;
      }
    });
    
    // Add monopoly class if we have enough properties
    if (effectiveCount >= requiredCount) {
      groupElement.classList.add('monopoly');
    }
    
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
      } else {
        // Fallback to text display
        propertyElement.innerHTML = `
          <div class="property-name">${property.name}</div>
          <div class="property-value">$${property.value}M</div>`;
      }
      
      // Simple wildcard handling - just check if it's a wildcard and add click handler
      if (property.wildcard && property.colors) {
        propertyElement.classList.add('wildcard');
        
        // For 10-way wildcards
        if (property.colors[0] === 'any' || property.originalColors[0] === 'any') {
          propertyElement.addEventListener('click', function() {
            window.MonopolyDeal.showColorSelectionModal(playerNumber, color, index);
          });
        }
        // For 2-way wildcards
        else if (property.colors.length === 2) {
          propertyElement.addEventListener('click', function() {
            window.MonopolyDeal.flipWildcardProperty(playerNumber, color, index);
          });
        }
      }
      
      groupElement.appendChild(propertyElement);
    });
    
    propertiesElement.appendChild(groupElement);
  });
  
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
  
  // Base rent values by color
  const baseRentValues = {
    'brown': 1,
    'light-blue': 1,
    'pink': 2,
    'orange': 2,
    'red': 3,
    'yellow': 3,
    'green': 4,
    'blue': 4,
    'utility': 1,
    'railroad': 2
  };
  
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
  
  const baseRent = baseRentValues[color] || 1;
  const isCompleteSet = properties.length >= requiredProperties[color];
  
  // Calculate rent based on set completeness
  // 1 card: base rent
  // 2+ cards but incomplete set: 2x base rent
  // Complete set: 4x base rent
  let rentMultiplier = 1;
  
  if (isCompleteSet) {
    rentMultiplier = 4; // Complete set is 4x base rent
  } else if (properties.length > 1) {
    rentMultiplier = 2; // 2+ cards but incomplete is 2x base rent
  }
  
  const rentValue = baseRent * rentMultiplier;
  console.log(`Rent for ${color} properties: $${rentValue}M (${properties.length} cards, complete: ${isCompleteSet})`);
  
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
  console.log(`Showing color selection modal for player ${playerNumber}'s wildcard property`);
  
  // Get the player's properties
  const playerProperties = window.MonopolyDeal.gameState.players[playerNumber].properties;
  
  // Get the specific card
  const card = playerProperties[currentColor][cardIndex];
  
  // Verify it's a full wildcard
  if (!card || !card.wildcard || !card.originalColors || !card.originalColors.includes('any')) {
    console.warn("This is not a valid full wildcard property");
    return false;
  }
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('color-selection-modal');
  if (!modal) {
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
    const body = document.createElement('div');
    body.className = 'modal-body';
    modalContent.appendChild(body);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  
  const modalBody = modal.querySelector('.modal-body');
  modalBody.innerHTML = '';
  
  // Get all colors where player has properties
  const availableColors = Object.entries(playerProperties)
    .filter(([color, props]) => props.length > 0 && color !== currentColor)
    .map(([color]) => color);
  
  if (availableColors.length === 0) {
    modalBody.innerHTML = '<div class="empty-message">You have no property sets to add this wildcard to.</div>';
    return;
  }
  
  // Create color options grid
  const colorGrid = document.createElement('div');
  colorGrid.className = 'color-options';
  
  availableColors.forEach(color => {
    const option = document.createElement('div');
    option.className = 'color-option';
    option.dataset.color = color;
    
    // Count properties in this color group
    const propertyCount = playerProperties[color].length;
    
    option.innerHTML = `
      <div class="color-indicator ${color}-indicator"></div>
      <div class="color-info">
        <div class="color-name">${color.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
        <div class="property-count">${propertyCount} ${propertyCount === 1 ? 'Property' : 'Properties'}</div>
      </div>
    `;
    
    option.addEventListener('click', () => {
      window.MonopolyDeal.changeWildcardColor(playerNumber, currentColor, cardIndex, color);
      window.MonopolyDeal.hideColorSelectionModal();
    });
    
    colorGrid.appendChild(option);
  });
  
  modalBody.appendChild(colorGrid);
  
  // Add close button functionality
  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.onclick = () => window.MonopolyDeal.hideColorSelectionModal();
  
  // Show modal
  modal.style.display = 'flex';
  
  return true;
};

// Hide color selection modal
window.MonopolyDeal.hideColorSelectionModal = function() {
  const modal = document.getElementById('color-selection-modal');
  if (modal) {
    modal.style.display = 'none';
  }
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