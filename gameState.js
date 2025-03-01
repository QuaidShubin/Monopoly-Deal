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
      switchPerspectiveButton: document.getElementById('switch-perspective-btn')
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
  for (let i = 0; i < 2; i++) {
    window.MonopolyDeal.dealCard(playerNumber);
  }
  
  window.MonopolyDeal.gameState.hasDrawnCards = true;
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  
  if (window.MonopolyDeal.elements.drawButton) {
    window.MonopolyDeal.elements.drawButton.disabled = true;
  }
  if (window.MonopolyDeal.elements.endTurnButton) {
    window.MonopolyDeal.elements.endTurnButton.disabled = false;
  }
  
  window.MonopolyDeal.updateGameStatus(`Player ${playerNumber}'s turn. You can play up to 3 cards`);
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} drew 2 cards`);
  
  return true;
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
      // Initialize property color group if it doesn't exist
      if (!player.properties[card.color]) {
        player.properties[card.color] = [];
      }
      player.properties[card.color].push(card);
      window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played ${card.name} property`);
      window.MonopolyDeal.addToHistory(`Player ${playerNumber} played ${card.name} property`);
      
      // Check for win condition after playing property
      window.MonopolyDeal.checkWinCondition(playerNumber);
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
  const cancelButton = document.getElementById('modal-cancel-btn');
  
  // Set card name
  cardNameElement.textContent = card.name;
  
  // Create card preview
  cardPreviewElement.innerHTML = '';
  const cardElement = document.createElement('div');
  cardElement.className = 'card action-card';
  cardElement.innerHTML = `
    <div class="action-name">${card.name}</div>
    <div class="action-description">${card.description}</div>
    <div class="action-value">$${card.value}M</div>`;
  cardPreviewElement.appendChild(cardElement);
  
  // Clear previous options
  optionsContainer.innerHTML = '';
  
  // Add play as money option
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
      
      // Check if opponent has enough assets to pay
      const opponentNumber = playerNumber === 1 ? 2 : 1;
      const opponentTotalValue = window.MonopolyDeal.calculatePlayerAssetValue(opponentNumber);
      
      if (opponentTotalValue < 5) {
        debtCollectorButton.disabled = true;
        debtCollectorButton.textContent += ' (Opponent cannot pay)';
      }
      
      debtCollectorButton.addEventListener('click', function() {
        if (!debtCollectorButton.disabled) {
          window.MonopolyDeal.playDebtCollectorCard(playerNumber, cardIndex);
          window.MonopolyDeal.hideActionCardModal();
        }
      });
      optionsContainer.appendChild(debtCollectorButton);
      break;
      
    case window.MonopolyDeal.ActionTypes.RENT:
      // Group properties by color to determine valid rent options
      const playerProperties = window.MonopolyDeal.gameState.players[playerNumber].properties;
      let hasValidRentTarget = false;
      
      Object.keys(playerProperties).forEach(color => {
        if (playerProperties[color].length > 0) {
          const rentButton = document.createElement('button');
          rentButton.className = 'action-option-btn play-action';
          rentButton.textContent = `Collect rent for ${color} properties`;
          
          // Calculate rent value based on property count
          const rentValue = window.MonopolyDeal.calculateRentForProperties(playerNumber, color);
          rentButton.textContent += ` ($${rentValue}M)`;
          
          // Check if opponent has enough assets to pay
          const opponentNumber = playerNumber === 1 ? 2 : 1;
          const opponentTotalValue = window.MonopolyDeal.calculatePlayerAssetValue(opponentNumber);
          
          if (opponentTotalValue < rentValue) {
            rentButton.disabled = true;
            rentButton.textContent += ' (Opponent cannot pay)';
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
        noPropertiesMessage.textContent = 'You have no properties to collect rent for';
        optionsContainer.appendChild(noPropertiesMessage);
      }
      break;
      
    case window.MonopolyDeal.ActionTypes.BIRTHDAY:
      const birthdayButton = document.createElement('button');
      birthdayButton.className = 'action-option-btn play-action';
      birthdayButton.textContent = 'Collect $2M from opponent';
      
      // Check if opponent has enough assets to pay
      const opponentForBirthday = playerNumber === 1 ? 2 : 1;
      const opponentBirthdayValue = window.MonopolyDeal.calculatePlayerAssetValue(opponentForBirthday);
      
      if (opponentBirthdayValue < 2) {
        birthdayButton.disabled = true;
        birthdayButton.textContent += ' (Opponent cannot pay)';
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
  
  // Set up cancel button
  cancelButton.addEventListener('click', function() {
    window.MonopolyDeal.hideActionCardModal();
  });
  
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
  
  // Request payment from opponent
  window.MonopolyDeal.requestPayment(opponentNumber, playerNumber, 5, `Player ${playerNumber} played Debt Collector`);
  
  // Update UI
  window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played Debt Collector. Player ${opponentNumber} must pay $5M`);
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} played Debt Collector. Player ${opponentNumber} must pay $5M`);
  
  // Increment cards played this turn
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  
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
  
  // Request payment from opponent
  window.MonopolyDeal.requestPayment(opponentNumber, playerNumber, rentAmount, `Player ${playerNumber} played Rent for ${propertyColor} properties`);
  
  // Update UI
  window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played Rent for ${propertyColor} properties. Player ${opponentNumber} must pay $${rentAmount}M`);
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} played Rent for ${propertyColor} properties. Player ${opponentNumber} must pay $${rentAmount}M`);
  
  // Increment cards played this turn
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  
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
  
  // Request payment from opponent
  window.MonopolyDeal.requestPayment(opponentNumber, playerNumber, 2, `Player ${playerNumber} played Birthday`);
  
  // Update UI
  window.MonopolyDeal.updateGameStatus(`Player ${playerNumber} played Birthday. Player ${opponentNumber} must pay $2M`);
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} played Birthday. Player ${opponentNumber} must pay $2M`);
  
  // Increment cards played this turn
  window.MonopolyDeal.gameState.cardsPlayedThisTurn++;
  
  // Update UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  
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
window.MonopolyDeal.requestPayment = function(fromPlayerNumber, toPlayerNumber, amount, reason) {
  console.log(`Requesting $${amount}M payment from player ${fromPlayerNumber} to player ${toPlayerNumber}...`);
  
  // Set payment pending state to lock the game until payment is complete
  window.MonopolyDeal.gameState.paymentPending = true;
  
  // Set up payment state
  window.MonopolyDeal.gameState.paymentRequest = {
    fromPlayer: fromPlayerNumber,
    toPlayer: toPlayerNumber,
    amount: amount,
    reason: reason
  };
  
  // Clear any previously selected payment assets
  window.MonopolyDeal.gameState.selectedPaymentAssets = {
    money: [],
    properties: []
  };
  
  // Enable payment mode
  window.MonopolyDeal.gameState.paymentMode = true;
  
  // Ensure we're in the paying player's perspective
  if (window.MonopolyDeal.currentPerspective !== fromPlayerNumber) {
    window.MonopolyDeal.currentPerspective = fromPlayerNumber;
    window.MonopolyDeal.updateAllPlayerUIs();
    window.MonopolyDeal.addToHistory(`Switched to Player ${fromPlayerNumber}'s perspective to make payment`);
  }
  
  // Show payment modal
  window.MonopolyDeal.showPaymentModal();
  
  // Update game status
  window.MonopolyDeal.updateGameStatus(`Player ${fromPlayerNumber} must pay $${amount}M to Player ${toPlayerNumber} for ${reason}`);
  window.MonopolyDeal.addToHistory(`Player ${toPlayerNumber} requested $${amount}M payment from Player ${fromPlayerNumber}`);
};

// Show the payment modal with all selectable assets
window.MonopolyDeal.showPaymentModal = function() {
  console.log('Showing payment modal...');
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  
  if (!paymentRequest) {
    console.error('No payment request found!');
    return;
  }
  
  const paymentModal = document.getElementById('payment-modal');
  if (!paymentModal) {
    console.error('Payment modal element not found!');
    return;
  }
  
  // Set up the payment modal content
  document.getElementById('payment-amount').textContent = paymentRequest.amount;
  document.getElementById('payment-selected-amount').textContent = '0';
  document.getElementById('payment-required-amount').textContent = paymentRequest.amount;
  document.getElementById('payment-reason').textContent = paymentRequest.reason || '';
  
  // Reset progress bar
  const progressBar = document.getElementById('payment-progress-bar');
  if (progressBar) {
    progressBar.style.width = '0%';
    progressBar.classList.remove('sufficient');
  }
  
  // Set up modal close button
  const closeButton = paymentModal.querySelector('.close');
  if (closeButton) {
    // Remove existing listeners by replacing the element
    const newCloseButton = closeButton.cloneNode(true);
    closeButton.parentNode.replaceChild(newCloseButton, closeButton);
    
    // Add new listener
    newCloseButton.addEventListener('click', function() {
      paymentModal.style.display = 'none';
      // Note: We don't allow canceling the payment through this, it just hides the modal
      // The payment is still required - will show again if the player tries to do other actions
    });
  }
  
  // Set up payment confirm button
  const confirmButton = document.getElementById('payment-confirm-btn');
  if (confirmButton) {
    // Reset button state
    confirmButton.disabled = true;
    
    // Replace to remove existing listeners
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    
    // Add new listener
    newConfirmButton.addEventListener('click', function() {
      window.MonopolyDeal.processSelectedPayment();
    });
  }
  
  // Set up cancel button
  const cancelButton = document.getElementById('payment-cancel-btn');
  if (cancelButton) {
    // Replace to remove existing listeners
    const newCancelButton = cancelButton.cloneNode(true);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
    
    // Add new listener
    newCancelButton.addEventListener('click', function() {
      paymentModal.style.display = 'none';
      // Just hide the modal, payment is still required
    });
  }
  
  // Clear and populate payment containers
  window.MonopolyDeal.populatePaymentSelectionContainers();
  
  // Display the modal
  paymentModal.style.display = 'flex';
  
  // Ensure button state is correct (disabled until sufficient payment selected)
  window.MonopolyDeal.updatePaymentButtonState();
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
  }
  
  // Add money cards
  fromPlayer.money.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = `card money-card money-${card.value}-card payment-selectable`;
    cardElement.innerHTML = `<div class="card-value">$${card.value}M</div>`;
    cardElement.dataset.index = index;
    
    // Add selection overlay
    const overlay = document.createElement('div');
    overlay.className = 'payment-overlay';
    overlay.textContent = 'Select';
    cardElement.appendChild(overlay);
    
    // Add click handler
    cardElement.addEventListener('click', function() {
      window.MonopolyDeal.togglePaymentAsset('money', index);
    });
    
    moneyContainer.appendChild(cardElement);
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
  }
  
  // Add property cards
  for (const color in fromPlayer.properties) {
    const properties = fromPlayer.properties[color];
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      
      // Create property card
      const cardElement = document.createElement('div');
      cardElement.className = `card property-card ${color}-property payment-selectable`;
      cardElement.innerHTML = `
        <div class="property-name">${property.name}</div>
        <div class="property-value">$${property.value}M</div>
      `;
      cardElement.dataset.color = color;
      cardElement.dataset.index = i;
      
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
  
  // Check if payment is sufficient
  if (selectedTotal < paymentRequest.amount) {
    // Payment is insufficient, but we'll still allow it with a warning
    window.MonopolyDeal.showTemporaryMessage(
      `Warning: Payment is $${paymentRequest.amount - selectedTotal}M short!`,
      3000
    );
    window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} made a partial payment of $${selectedTotal}M to Player ${paymentRequest.toPlayer}`);
  } else {
    window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} paid $${selectedTotal}M to Player ${paymentRequest.toPlayer}`);
  }
  
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
  
  // Close payment modal
  const paymentModal = document.getElementById('payment-modal');
  if (paymentModal) {
    paymentModal.style.display = 'none';
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
  
  // Update game status
  window.MonopolyDeal.updateGameStatus(`Payment of $${selectedTotal}M completed from Player ${paymentRequest.fromPlayer} to Player ${paymentRequest.toPlayer}`);
  
  // Re-enable all buttons
  window.MonopolyDeal.updateButtonStates();
  
  // Show success notification
  window.MonopolyDeal.showTemporaryMessage('Payment successful!', 2000);
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
  let cardElement = null;
  
  if (type === 'money') {
    const player = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
    const card = player.money[index];
    
    if (card) {
      cardValue = card.value;
      // Find the card element in the payment modal
      cardElement = document.querySelector(`.payment-selectable[data-index="${index}"]`);
    } else {
      console.error(`Money card at index ${index} not found!`);
      return;
    }
  } else if (type === 'property') {
    const player = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
    if (player.properties[color] && player.properties[color][index]) {
      cardValue = player.properties[color][index].value;
      // Find the property card element
      cardElement = document.querySelector(`.property-card[data-color="${color}"][data-index="${index}"]`);
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
    
    // Update UI
    if (cardElement) {
      cardElement.classList.remove('payment-selected');
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
    
    // Update UI
    if (cardElement) {
      cardElement.classList.add('payment-selected');
    }
  }
  
  // Update payment UI
  window.MonopolyDeal.updatePaymentUI();
};

// Update the payment UI elements
window.MonopolyDeal.updatePaymentUI = function() {
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) return;
  
  // Calculate new total
  const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
  console.log(`New payment total: $${selectedTotal}M of $${paymentRequest.amount}M required`);
  
  // Update selected amount display
  const selectedAmountElement = document.getElementById('payment-selected-amount');
  if (selectedAmountElement) {
    selectedAmountElement.textContent = selectedTotal;
  }
  
  // Update progress bar
  const progressBar = document.getElementById('payment-progress-bar');
  if (progressBar) {
    // Calculate percentage
    const percentage = Math.min(100, (selectedTotal / paymentRequest.amount) * 100);
    progressBar.style.width = `${percentage}%`;
    
    // Add or remove sufficient class based on total
    if (selectedTotal >= paymentRequest.amount) {
      progressBar.classList.add('sufficient');
    } else {
      progressBar.classList.remove('sufficient');
    }
  }
  
  // Update confirm button state
  window.MonopolyDeal.updatePaymentButtonState();
};

// Update the payment confirm button state based on selected total
window.MonopolyDeal.updatePaymentButtonState = function() {
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  if (!paymentRequest) return;
  
  const selectedTotal = window.MonopolyDeal.calculateSelectedPaymentTotal();
  const confirmButton = document.getElementById('payment-confirm-btn');
  
  if (confirmButton) {
    // Enable button if payment is sufficient
    const isSufficient = selectedTotal >= paymentRequest.amount;
    confirmButton.disabled = !isSufficient;
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
    window.MonopolyDeal.updateGameStatus('All cards discarded. Ending turn...');
  }
  
  window.MonopolyDeal.addToHistory(`Player ${playerNumber} discarded a ${card.type} card`);
  
  // Check if we've discarded enough cards
  if (window.MonopolyDeal.gameState.cardsToDiscard === 0) {
    window.MonopolyDeal.gameState.discardMode = false;
    
    // Add a small delay before ending the turn
    setTimeout(() => {
      // End the turn now that we've discarded enough
      window.MonopolyDeal.endTurn();
    }, 1500);
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
  
  // Only show cards in currentPlayerHand if this player's perspective is active
  if (playerNumber === window.MonopolyDeal.currentPerspective) {
    currentPerspectiveHandElement.innerHTML = '';
    console.log(`Showing ${hand.length} actual cards for player ${playerNumber} (current perspective)`);
    
    hand.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.dataset.cardId = card.id;
      
      // Style based on card type
      switch (card.type) {
        case 'money':
          cardElement.className += ' money-card';
          cardElement.style.backgroundColor = window.MonopolyDeal.getMoneyColor(card.value);
          cardElement.innerHTML = `<div class="card-value">$${card.value}M</div>`;
          break;
          
        case 'property':
          cardElement.className += ` property-card ${card.color}-property`;
          cardElement.innerHTML = `
            <div class="property-name">${card.name}</div>
            <div class="property-value">$${card.value}M</div>`;
          break;
          
        case 'action':
          cardElement.className += ' action-card';
          cardElement.innerHTML = `
            <div class="action-name">${card.name}</div>
            <div class="action-description">${card.description}</div>
            <div class="action-value">$${card.value}M</div>`;
          break;
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
  
  // Add perspective indicator if this is the current perspective
  if (playerNumber === window.MonopolyDeal.currentPerspective) {
    const perspectiveIndicator = document.createElement('div');
    perspectiveIndicator.className = 'perspective-indicator active';
    perspectiveIndicator.textContent = `YOUR VIEW`;
    moneyElement.appendChild(perspectiveIndicator);
  }
  
  // Add player banner to clearly show which player this is
  const playerBanner = document.createElement('div');
  playerBanner.className = `player-banner player${playerNumber}`;
  playerBanner.textContent = `PLAYER ${playerNumber}`;
  moneyElement.appendChild(playerBanner);
  
  // Check if in payment mode and this is the paying player
  const isPaymentMode = window.MonopolyDeal.gameState.paymentMode;
  const isPayingPlayer = isPaymentMode && 
                         window.MonopolyDeal.gameState.paymentRequest && 
                         window.MonopolyDeal.gameState.paymentRequest.fromPlayer === playerNumber;
  const selectedAssets = window.MonopolyDeal.gameState.selectedPaymentAssets;
  
  // Group money cards by denomination
  const denominations = [1, 2, 3, 4, 5, 10];
  const denominationCounts = {};
  let totalValue = 0;
  
  // Initialize counts to 0
  denominations.forEach(value => {
    denominationCounts[value] = {
      count: 0,
      indices: []
    };
  });
  
  // Count card denominations and keep track of their indices
  money.forEach((card, index) => {
    const value = parseInt(card.value);
    totalValue += value;
    
    if (denominationCounts[value]) {
      denominationCounts[value].count++;
      denominationCounts[value].indices.push(index);
    }
  });
  
  // Create denomination container
  const denominationContainer = document.createElement('div');
  denominationContainer.className = 'money-denomination-container';
  
  // Create boxes for each denomination
  denominations.forEach(value => {
    const box = document.createElement('div');
    box.className = 'money-denomination-box';
    box.style.backgroundColor = window.MonopolyDeal.getMoneyColor(value);
    
    // Add count
    const countElement = document.createElement('div');
    countElement.className = 'money-denomination-count';
    countElement.textContent = denominationCounts[value].count;
    box.appendChild(countElement);
    
    // Add value
    const valueElement = document.createElement('div');
    valueElement.className = 'money-denomination-value';
    valueElement.textContent = `$${value}M`;
    box.appendChild(valueElement);
    
    // If in payment mode and this is the paying player and current perspective
    if (isPayingPlayer && window.MonopolyDeal.currentPerspective === playerNumber) {
      // Add payment-selectable class
      box.className += ' payment-selectable';
      
      // Add attributes for selection
      box.setAttribute('data-denomination', value);
      
      // Check if any cards of this denomination are selected
      const isAnySelected = denominationCounts[value].indices.some(idx => 
        selectedAssets.money.includes(idx)
      );
      
      if (isAnySelected) {
        box.classList.add('payment-selected');
      }
      
      // Add overlay for selection
      const overlayElement = document.createElement('div');
      overlayElement.className = 'payment-overlay';
      overlayElement.textContent = `$${value}M`;
      box.appendChild(overlayElement);
      
      // Add click event for payment selection
      if (denominationCounts[value].count > 0) {
        box.addEventListener('click', function() {
          const denomination = parseInt(this.getAttribute('data-denomination'));
          const indices = denominationCounts[denomination].indices;
          
          if (indices.length > 0) {
            // Toggle selection for the first available card of this denomination
            // If already selected, deselect it. If not selected, select it.
            const indexToToggle = indices.find(idx => !selectedAssets.money.includes(idx)) ?? indices[0];
            window.MonopolyDeal.togglePaymentAsset('money', indexToToggle);
          }
        });
      } else {
        box.classList.add('empty');
        box.style.opacity = '0.5';
        box.style.cursor = 'default';
      }
    }
    
    denominationContainer.appendChild(box);
  });
  
  moneyElement.appendChild(denominationContainer);
  
  // Update total value display in the compact format
  if (totalElement) {
    totalElement.textContent = totalValue;
  }
  
  return true;
};

window.MonopolyDeal.updatePlayerPropertiesUI = function(playerNumber) {
  console.log(`Updating properties UI for player ${playerNumber}...`);
  
  // Fixed positions: Player 1 always top, Player 2 always bottom
  let propertiesElement;
  
  if (playerNumber === 1) {
    // Player 1 is always in opponent area (top)
    propertiesElement = document.getElementById('opponent-properties');
    console.log(`Using opponent-properties element for Player 1 (top)`);
  } else {
    // Player 2 is always in player area (bottom)
    propertiesElement = document.getElementById('player-properties');
    console.log(`Using player-properties element for Player 2 (bottom)`);
  }
  
  if (!propertiesElement) {
    console.error(`Properties element for player ${playerNumber} not found`);
    return false;
  }
  
  const properties = window.MonopolyDeal.gameState.players[playerNumber].properties;
  propertiesElement.innerHTML = '';
  
  // Add perspective indicator if this is the current perspective
  if (playerNumber === window.MonopolyDeal.currentPerspective) {
    const perspectiveIndicator = document.createElement('div');
    perspectiveIndicator.className = 'perspective-indicator active';
    perspectiveIndicator.textContent = `YOUR VIEW`;
    propertiesElement.appendChild(perspectiveIndicator);
  }
  
  // Check if in payment mode and this is the paying player
  const isPaymentMode = window.MonopolyDeal.gameState.paymentMode;
  const isPayingPlayer = isPaymentMode && 
                         window.MonopolyDeal.gameState.paymentRequest && 
                         window.MonopolyDeal.gameState.paymentRequest.fromPlayer === playerNumber;
  
  const selectedAssets = window.MonopolyDeal.gameState.selectedPaymentAssets;
  
  // For each property color group, create a container
  Object.entries(properties).forEach(([color, cards]) => {
    const colorGroupElement = document.createElement('div');
    // Add both the property-group class and the color-specific class
    colorGroupElement.className = `property-group ${color}-group`;
    
    // Add header for the color group
    const headerElement = document.createElement('div');
    headerElement.className = 'property-group-header';
    headerElement.textContent = `${color.charAt(0).toUpperCase() + color.slice(1)}`;
    colorGroupElement.appendChild(headerElement);
    
    // Create two row containers for the cards
    const topRowElement = document.createElement('div');
    topRowElement.className = 'property-row top-row';
    
    const bottomRowElement = document.createElement('div');
    bottomRowElement.className = 'property-row bottom-row';
    
    // Add cards to rows (divide cards between the two rows)
    cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = `card property-card ${color}-property played`;
      
      // Add payment-selectable class if in payment mode and this is the paying player and current perspective
      if (isPayingPlayer && window.MonopolyDeal.currentPerspective === playerNumber) {
        cardElement.className += ' payment-selectable';
        
        // Check if this card is already selected for payment
        const isSelected = selectedAssets.properties.some(
          p => p.color === color && p.index === index
        );
        
        if (isSelected) {
          cardElement.className += ' payment-selected';
        }
        
        // Add payment overlay
        const overlayElement = document.createElement('div');
        overlayElement.className = 'payment-overlay';
        overlayElement.textContent = `$${card.value}M`;
        cardElement.appendChild(overlayElement);
        
        // Add click event to select for payment
        cardElement.addEventListener('click', function() {
          window.MonopolyDeal.togglePaymentAsset('property', index, color);
        });
      }
      
      cardElement.innerHTML += `
        <div class="property-name">${card.name}</div>
        <div class="property-value">$${card.value}M</div>`;
      
      // Determine which row to add the card to
      // First 3 cards go in the top row, the rest go in the bottom row
      if (index < 3) {
        topRowElement.appendChild(cardElement);
      } else {
        bottomRowElement.appendChild(cardElement);
      }
    });
    
    // Add rows to the property group
    colorGroupElement.appendChild(topRowElement);
    colorGroupElement.appendChild(bottomRowElement);
    
    // Only append the property group if it has cards
    if (cards.length > 0) {
      propertiesElement.appendChild(colorGroupElement);
    }
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
  window.MonopolyDeal.gameState.history.push(message);
  
  if (window.MonopolyDeal.elements.gameHistory) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = message;
    window.MonopolyDeal.elements.gameHistory.appendChild(historyItem);
    
    // Scroll to bottom
    window.MonopolyDeal.elements.gameHistory.scrollTop = window.MonopolyDeal.elements.gameHistory.scrollHeight;
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
    cardElement.innerHTML = `
      <div class="action-name">${card.name}</div>
      <div class="action-description">${card.description}</div>
      <div class="action-value">$${card.value}M</div>`;
    
    // Add card to the action pile
    actionPile.appendChild(cardElement);
  }
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

console.log('GameState.js loaded successfully!'); 