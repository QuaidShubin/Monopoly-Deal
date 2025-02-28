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
  
  // Update UI for all players
  window.MonopolyDeal.updateAllPlayerUIs();
  
  // Show payment indicator
  window.MonopolyDeal.showPaymentIndicator();
  
  // Update game status
  window.MonopolyDeal.updateGameStatus(`Player ${fromPlayerNumber} must pay $${amount}M to Player ${toPlayerNumber} for ${reason}`);
  window.MonopolyDeal.addToHistory(`Player ${toPlayerNumber} requested $${amount}M payment from Player ${fromPlayerNumber}`);
};

// Show payment indicator
window.MonopolyDeal.showPaymentIndicator = function() {
  console.log('Showing payment indicator...');
  // Remove existing indicator if any
  window.MonopolyDeal.removePaymentIndicator();
  
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  
  if (!paymentRequest) {
    console.error('No payment request found!');
    return;
  }
  
  // Check if we should use modal or indicator based on whether we're in the payment player's perspective
  if (window.MonopolyDeal.currentPerspective === paymentRequest.fromPlayer) {
    // Show the built-in payment modal
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
      console.log('Showing payment modal');
      
      // Set up the payment modal
      document.getElementById('payment-amount').textContent = paymentRequest.amount;
      document.getElementById('payment-selected-amount').textContent = '0';
      document.getElementById('payment-required-amount').textContent = paymentRequest.amount;
      document.getElementById('payment-reason').textContent = paymentRequest.reason || '';
      
      // Make sure progress bar is empty initially
      const progressBar = document.getElementById('payment-progress-bar');
      if (!progressBar) {
        // Create a progress bar if one doesn't exist
        const progressContainer = document.createElement('div');
        progressContainer.className = 'payment-progress';
        
        const newProgressBar = document.createElement('div');
        newProgressBar.id = 'payment-progress-bar';
        newProgressBar.className = 'payment-progress-bar';
        newProgressBar.style.width = '0%';
        
        progressContainer.appendChild(newProgressBar);
        
        // Add it to the modal body
        const modalBody = paymentModal.querySelector('.modal-body');
        if (modalBody) {
          const paymentTotal = modalBody.querySelector('.payment-total');
          if (paymentTotal) {
            modalBody.insertBefore(progressContainer, paymentTotal.nextSibling);
            console.log('Created and added progress bar to payment modal');
          }
        }
      } else {
        progressBar.style.width = '0%';
        progressBar.classList.remove('sufficient');
      }
      
      // Empty the containers
      const moneyContainer = document.getElementById('payment-money-container');
      const propertiesContainer = document.getElementById('payment-properties-container');
      
      if (moneyContainer) moneyContainer.innerHTML = '';
      if (propertiesContainer) propertiesContainer.innerHTML = '';
      
      // Get player data
      const fromPlayer = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
      
      // *** COMPLETELY REWIRE THE CONFIRM BUTTON ***
      const confirmButton = document.getElementById('payment-confirm-btn');
      if (confirmButton) {
        // First, reset button state
        confirmButton.disabled = true;
        confirmButton.style.backgroundColor = '#aaa';
        confirmButton.style.cursor = 'not-allowed';
        confirmButton.style.transform = 'scale(1)';
        confirmButton.style.boxShadow = 'none';
        confirmButton.style.opacity = '0.8';
        confirmButton.style.fontWeight = 'normal';
        confirmButton.textContent = 'Confirm Payment';
        
        // Remove all existing event listeners by cloning and replacing
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
        
        // Add click handler to the new button
        newConfirmButton.addEventListener('click', function(event) {
          event.preventDefault();
          console.log('Payment confirm button clicked, button disabled state:', this.disabled);
          
          // Process payment regardless of disabled state as a safety measure
          console.log('Processing payment...');
          window.MonopolyDeal.processSelectedPayment();
          
          // Explicitly close the modal
          paymentModal.style.display = 'none';
          document.body.classList.remove('modal-open');
        });
      }
      
      // *** REWIRE THE CANCEL BUTTON ***
      const cancelButton = document.getElementById('payment-cancel-btn');
      if (cancelButton) {
        // Remove existing listeners
        const newCancelButton = cancelButton.cloneNode(true);
        cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
        
        // Add click listener
        newCancelButton.addEventListener('click', function(event) {
          event.preventDefault();
          console.log('Payment cancelled');
          paymentModal.style.display = 'none';
          document.body.classList.remove('modal-open');
        });
      }
      
      // Add money cards
      fromPlayer.money.forEach((card, index) => {
        const moneyCard = document.createElement('div');
        moneyCard.className = `card money-card money-${card.value}-card payment-selectable`;
        
        const overlayElement = document.createElement('div');
        overlayElement.className = 'payment-overlay';
        overlayElement.textContent = `$${card.value}M`;
        moneyCard.appendChild(overlayElement);
        
        moneyCard.innerHTML += `<div class="card-value">$${card.value}M</div>`;
        
        moneyCard.addEventListener('click', function() {
          // Toggle selection class
          this.classList.toggle('payment-selected');
          // Update asset selection
          window.MonopolyDeal.togglePaymentAsset('money', index);
        });
        
        if (moneyContainer) moneyContainer.appendChild(moneyCard);
      });
      
      // Add property cards
      Object.entries(fromPlayer.properties).forEach(([color, cards]) => {
        cards.forEach((card, index) => {
          const propertyCard = document.createElement('div');
          propertyCard.className = `card property-card ${color}-property payment-selectable`;
          
          const overlayElement = document.createElement('div');
          overlayElement.className = 'payment-overlay';
          overlayElement.textContent = `$${card.value}M`;
          propertyCard.appendChild(overlayElement);
          
          propertyCard.innerHTML += `
            <div class="property-color ${color}"></div>
            <div class="property-name">${card.name}</div>
            <div class="property-value">$${card.value}M</div>
          `;
          
          propertyCard.addEventListener('click', function() {
            // Toggle selection class
            this.classList.toggle('payment-selected');
            // Update asset selection
            window.MonopolyDeal.togglePaymentAsset('property', index, color);
          });
          
          if (propertiesContainer) propertiesContainer.appendChild(propertyCard);
        });
      });
      
      // Show the modal
      paymentModal.style.display = 'flex';
      document.body.classList.add('modal-open');
    } else {
      console.error('Payment modal element not found!');
    }
  } else {
    // Create payment info UI
    const paymentInfo = document.createElement('div');
    paymentInfo.id = 'payment-info';
    paymentInfo.className = 'payment-info';
    
    // Add payment message with clearer formatting
    const paymentMessage = document.createElement('div');
    paymentMessage.className = 'payment-message';
    paymentMessage.innerHTML = `
      <div class="payment-reason">${paymentRequest.reason || 'Payment Request'}</div>
      <div class="payment-details">
        <strong>Player ${paymentRequest.fromPlayer}</strong> must pay 
        <strong>$${paymentRequest.amount}M</strong> to 
        <strong>Player ${paymentRequest.toPlayer}</strong>
      </div>
    `;
    
    paymentInfo.appendChild(paymentMessage);
    
    // Add to the document body
    document.body.appendChild(paymentInfo);
  }
  
  // Update button states
  window.MonopolyDeal.updateButtonStates();
};

// Remove payment indicator
window.MonopolyDeal.removePaymentIndicator = function() {
  const existingIndicator = document.getElementById('payment-info');
  if (existingIndicator) {
    existingIndicator.remove();
  }
};

// Process the selected payment assets
window.MonopolyDeal.processSelectedPayment = function() {
  console.log('Processing selected payment...');
  
  // Get payment state
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  const selectedAssets = window.MonopolyDeal.gameState.selectedPaymentAssets;
  
  // Validate payment request and selected assets
  if (!paymentRequest) {
    console.error('No payment request found!');
    return;
  }
  
  const fromPlayer = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
  const toPlayer = window.MonopolyDeal.gameState.players[paymentRequest.toPlayer];
  
  if (!fromPlayer || !toPlayer) {
    console.error('Player not found!');
    return;
  }
  
  // Calculate total payment amount
  let paymentTotal = 0;
  
  // Add up money values
  selectedAssets.money.forEach(idx => {
    if (fromPlayer.money[idx]) {
      const moneyCard = fromPlayer.money[idx];
      paymentTotal += parseInt(moneyCard.value);
    }
  });
  
  // Add up property values
  selectedAssets.properties.forEach(prop => {
    if (fromPlayer.properties[prop.color] && fromPlayer.properties[prop.color][prop.index]) {
      const propertyCard = fromPlayer.properties[prop.color][prop.index];
      paymentTotal += parseInt(propertyCard.value);
    }
  });
  
  const isFullPayment = paymentTotal >= paymentRequest.amount;
  
  // Sort indices in descending order to remove from the end first
  selectedAssets.money.sort((a, b) => b - a);
  
  // Transfer money
  selectedAssets.money.forEach(index => {
    if (index >= 0 && index < fromPlayer.money.length) {
      const card = fromPlayer.money.splice(index, 1)[0];
      toPlayer.money.push(card);
    }
  });
  
  // Transfer properties (process in descending order to avoid index issues)
  selectedAssets.properties.sort((a, b) => {
    if (a.color !== b.color) return 0;
    return b.index - a.index;
  });
  
  selectedAssets.properties.forEach(prop => {
    if (fromPlayer.properties[prop.color] && prop.index >= 0 && prop.index < fromPlayer.properties[prop.color].length) {
      const card = fromPlayer.properties[prop.color].splice(prop.index, 1)[0];
      
      // Initialize property color group if it doesn't exist for recipient
      if (!toPlayer.properties[prop.color]) {
        toPlayer.properties[prop.color] = [];
      }
      
      toPlayer.properties[prop.color].push(card);
    }
  });
  
  // Update UI
  window.MonopolyDeal.updateAllPlayerUIs();
  
  // Update game status with appropriate message
  if (isFullPayment) {
    window.MonopolyDeal.updateGameStatus(`Player ${paymentRequest.fromPlayer} paid Player ${paymentRequest.toPlayer} $${paymentRequest.amount}M for ${paymentRequest.reason}`);
    window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} paid Player ${paymentRequest.toPlayer} $${paymentRequest.amount}M`);
  } else {
    window.MonopolyDeal.updateGameStatus(`Player ${paymentRequest.fromPlayer} made a partial payment of $${paymentTotal}M to Player ${paymentRequest.toPlayer} for ${paymentRequest.reason}`);
    window.MonopolyDeal.addToHistory(`Player ${paymentRequest.fromPlayer} made a partial payment of $${paymentTotal}M to Player ${paymentRequest.toPlayer}`);
  }
  
  // IMPORTANT: Close the payment modal - multiple ways to ensure it works
  // 1. Direct modal close
  const paymentModal = document.getElementById('payment-modal');
  if (paymentModal) {
    console.log('Closing payment modal after processing payment');
    paymentModal.style.display = 'none';
  }
  
  // 2. Remove modal-open class from body
  document.body.classList.remove('modal-open');
  
  // 3. Remove any payment info elements
  const paymentInfo = document.getElementById('payment-info');
  if (paymentInfo) {
    paymentInfo.remove();
  }
  
  // Reset payment state
  window.MonopolyDeal.gameState.paymentMode = false;
  window.MonopolyDeal.gameState.paymentPending = false;
  window.MonopolyDeal.gameState.paymentRequest = null;
  window.MonopolyDeal.gameState.selectedPaymentAssets = { money: [], properties: [] };
  
  // Remove payment indicator
  window.MonopolyDeal.removePaymentIndicator();
  
  // Update button states
  window.MonopolyDeal.updateButtonStates();
  
  // Check for win condition
  window.MonopolyDeal.checkWinCondition(paymentRequest.toPlayer);
};

// Toggle selection of an asset for payment
window.MonopolyDeal.togglePaymentAsset = function(type, index, color = null) {
  console.log(`Toggling payment asset: ${type} ${color ? color + ' ' : ''}index ${index}`);
  
  const selectedAssets = window.MonopolyDeal.gameState.selectedPaymentAssets;
  const paymentRequest = window.MonopolyDeal.gameState.paymentRequest;
  const fromPlayer = window.MonopolyDeal.gameState.players[paymentRequest.fromPlayer];
  
  // Calculate current selected total before making changes
  let currentSelectedTotal = 0;
  
  // Add up current money values
  selectedAssets.money.forEach(idx => {
    const moneyCard = fromPlayer.money[idx];
    currentSelectedTotal += parseInt(moneyCard.value);
  });
  
  // Add up current property values
  selectedAssets.properties.forEach(prop => {
    const propertyCard = fromPlayer.properties[prop.color][prop.index];
    currentSelectedTotal += parseInt(propertyCard.value);
  });
  
  // Check if we're deselecting an asset
  let isDeselecting = false;
  
  if (type === 'money') {
    isDeselecting = selectedAssets.money.includes(index);
  } else if (type === 'property' && color) {
    isDeselecting = selectedAssets.properties.some(p => p.color === color && p.index === index);
  }
  
  // If we're trying to select (not deselect) and we already have enough, prevent it
  const amountNeeded = paymentRequest.amount;
  if (!isDeselecting && currentSelectedTotal >= amountNeeded) {
    console.log('Payment already sufficient, cannot select more assets unless something is deselected first');
    window.MonopolyDeal.updateGameStatus('Payment amount satisfied. Deselect something first to make changes.');
    return false;
  }
  
  // Now proceed with the toggle operation
  if (type === 'money') {
    const existingIndex = selectedAssets.money.indexOf(index);
    if (existingIndex === -1) {
      // Select it
      selectedAssets.money.push(index);
      console.log(`Selected money card at index ${index}`);
    } else {
      // Deselect it
      selectedAssets.money.splice(existingIndex, 1);
      console.log(`Deselected money card at index ${index}`);
    }
  } 
  // Handle property assets
  else if (type === 'property' && color) {
    const existingIndex = selectedAssets.properties.findIndex(
      p => p.color === color && p.index === index
    );
    
    if (existingIndex === -1) {
      // Select it
      selectedAssets.properties.push({ color, index });
      console.log(`Selected ${color} property at index ${index}`);
    } else {
      // Deselect it
      selectedAssets.properties.splice(existingIndex, 1);
      console.log(`Deselected ${color} property at index ${index}`);
    }
  }
  
  // Calculate selected total
  let selectedTotal = 0;
  
  // Add up money values
  selectedAssets.money.forEach(idx => {
    const moneyCard = fromPlayer.money[idx];
    selectedTotal += parseInt(moneyCard.value);
    console.log(`Added money card value: $${moneyCard.value}M`);
  });
  
  // Add up property values
  selectedAssets.properties.forEach(prop => {
    const propertyCard = fromPlayer.properties[prop.color][prop.index];
    selectedTotal += parseInt(propertyCard.value);
    console.log(`Added property card value: $${propertyCard.value}M`);
  });
  
  const stillNeeded = Math.max(0, amountNeeded - selectedTotal);
  const isPaymentSufficient = selectedTotal >= amountNeeded;
  // Check if any assets are selected at all
  const hasSelectedAssets = selectedAssets.money.length > 0 || selectedAssets.properties.length > 0;
  
  console.log(`Selected total: $${selectedTotal}M, Required: $${amountNeeded}M, Still needed: $${stillNeeded}M, Sufficient: ${isPaymentSufficient}, Has selected assets: ${hasSelectedAssets}`);
  
  // Log all available modal elements for debugging
  console.log('Modal elements:', {
    'payment-selected-amount': document.getElementById('payment-selected-amount'),
    'payment-progress-bar': document.getElementById('payment-progress-bar'),
    'payment-confirm-btn': document.getElementById('payment-confirm-btn'),
    'payment-modal': document.getElementById('payment-modal')
  });
  
  // Update payment selected amount - check both in the regular UI and in the modal
  let selectedAmountElement = document.getElementById('payment-selected-amount');
  if (selectedAmountElement) {
    // Format properly with currency symbol and 'M' suffix (but HTML already has $ and M, so just use the number)
    selectedAmountElement.textContent = selectedTotal;
    console.log(`Updated selected amount display to: ${selectedTotal}`);
  } else {
    console.error('Selected amount element not found!');
  }
  
  // Update required amount display
  const requiredAmountElement = document.getElementById('payment-required-amount');
  if (requiredAmountElement) {
    requiredAmountElement.textContent = amountNeeded;
    console.log(`Updated required amount display to: ${amountNeeded}`);
  }
  
  // Update progress bar - look in both places
  let progressBar = document.getElementById('payment-progress-bar');
  if (!progressBar) {
    // Try finding it in the dynamically created payment info
    const paymentInfo = document.getElementById('payment-info');
    if (paymentInfo) {
      progressBar = paymentInfo.querySelector('.payment-progress-bar');
      console.log('Found progress bar in payment-info:', progressBar);
    }
  }
  
  if (progressBar) {
    // Calculate percentage and update width
    const percentage = Math.min(100, (selectedTotal / amountNeeded) * 100);
    progressBar.style.width = `${percentage}%`;
    console.log(`Updated progress bar width to: ${percentage}%`);
    
    // Update class based on payment sufficiency
    if (isPaymentSufficient) {
      console.log('Payment is sufficient, adding sufficient class to progress bar');
      progressBar.classList.add('sufficient');
    } else {
      console.log('Payment is insufficient, removing sufficient class from progress bar');
      progressBar.classList.remove('sufficient');
    }
  } else {
    console.error('Progress bar element not found in any location!');
  }
  
  // If confirmButton is found, update its state
  let confirmButton = document.getElementById('payment-confirm-btn');
  if (confirmButton) {
    // IMPORTANT: Get a fresh reference to the button that's actually in the DOM
    // This ensures we're targeting the right element after any cloning/replacement
    const liveConfirmButton = document.getElementById('payment-confirm-btn');
    
    if (liveConfirmButton) {
      // Enable the button as long as at least one asset is selected
      liveConfirmButton.disabled = !hasSelectedAssets;
      console.log(`Set confirm button disabled state to: ${!hasSelectedAssets}, hasSelectedAssets: ${hasSelectedAssets}`);
      
      // Force style changes for better visibility
      if (hasSelectedAssets) {
        // Use blue color when the player has selected assets
        liveConfirmButton.style.backgroundColor = '#1e88e5';
        liveConfirmButton.style.cursor = 'pointer';
        liveConfirmButton.style.transform = 'scale(1.05)';
        liveConfirmButton.style.boxShadow = '0 0 12px rgba(30, 136, 229, 0.7)';
        liveConfirmButton.style.opacity = '1';
        liveConfirmButton.style.fontWeight = 'bold';
        
        // Force enable the button to ensure it's clickable
        liveConfirmButton.disabled = false;
        liveConfirmButton.removeAttribute('disabled');
        
        // Add a pulsing animation if payment is not sufficient
        if (!isPaymentSufficient) {
          liveConfirmButton.textContent = `Pay Partial Amount ($${selectedTotal}M)`;
        } else {
          liveConfirmButton.textContent = 'Confirm Payment';
        }
        
        // Ensure button is responding to clicks by checking and re-attaching the click handler if needed
        if (!liveConfirmButton._hasPaymentClickHandler) {
          liveConfirmButton.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Payment confirm button clicked from dynamic handler');
            window.MonopolyDeal.processSelectedPayment();
          });
          liveConfirmButton._hasPaymentClickHandler = true;
        }
      } else {
        liveConfirmButton.style.backgroundColor = '#aaa';
        liveConfirmButton.style.cursor = 'not-allowed';
        liveConfirmButton.style.transform = 'scale(1)';
        liveConfirmButton.style.boxShadow = 'none';
        liveConfirmButton.style.opacity = '0.8';
        liveConfirmButton.style.fontWeight = 'normal';
        liveConfirmButton.textContent = 'Confirm Payment';
      }
    } else {
      console.error('Live confirm button not found in DOM!');
    }
  } else {
    console.error('Confirm button element not found in any location!');
  }
  
  // Update UI status indicators in money and property sections
  window.MonopolyDeal.updatePaymentStatusIndicators(paymentRequest.fromPlayer, stillNeeded, hasSelectedAssets, isPaymentSufficient);
  
  // Update UI for the player
  window.MonopolyDeal.updatePlayerMoneyUI(paymentRequest.fromPlayer);
  window.MonopolyDeal.updatePlayerPropertiesUI(paymentRequest.fromPlayer);
  
  return true;
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
  
  // Get the correct elements based on perspective and player number
  let handElement;
  
  // When the current perspective matches the player number, show in "player-hand" (bottom)
  // Otherwise show in "opponent-hand" (top)
  if (playerNumber === window.MonopolyDeal.currentPerspective) {
    handElement = document.getElementById('player-hand');
    console.log(`Using player-hand element for player ${playerNumber} (current perspective)`);
  } else {
    handElement = document.getElementById('opponent-hand');
    console.log(`Using opponent-hand element for player ${playerNumber} (not current perspective)`);
  }
  
  if (!handElement) {
    console.error(`Hand element for player ${playerNumber} not found`);
    return false;
  }
  
  const hand = window.MonopolyDeal.gameState.players[playerNumber].hand;
  handElement.innerHTML = '';
  
  // In spectator mode, don't show any cards at all - just show card counts
  if (window.MonopolyDeal.currentPerspective === 3) {
    console.log(`Spectator mode: Showing only card count for player ${playerNumber}`);
    
    const spectatorMessage = document.createElement('div');
    spectatorMessage.className = 'spectator-message';
    spectatorMessage.textContent = `Player ${playerNumber} has ${hand.length} cards`;
    spectatorMessage.style.textAlign = 'center';
    spectatorMessage.style.padding = '20px';
    spectatorMessage.style.fontSize = '16px';
    spectatorMessage.style.color = '#555';
    spectatorMessage.style.fontStyle = 'italic';
    
    handElement.appendChild(spectatorMessage);
    return true;
  }
  
  // Show cards based on perspective
  if (playerNumber !== window.MonopolyDeal.currentPerspective) {
    console.log(`Showing ${hand.length} face-down cards for player ${playerNumber}`);
    
    // Add counter for number of cards
    if (hand.length > 0) {
      const counterElement = document.createElement('div');
      counterElement.className = 'card-counter';
      counterElement.textContent = `${hand.length} cards`;
      counterElement.style.position = 'absolute';
      counterElement.style.top = '5px';
      counterElement.style.right = '5px';
      counterElement.style.background = 'rgba(0,0,0,0.7)';
      counterElement.style.color = 'white';
      counterElement.style.padding = '2px 5px';
      counterElement.style.borderRadius = '3px';
      counterElement.style.fontSize = '14px';
      
      handElement.appendChild(counterElement);
    }
    
    // Show face-down cards
    hand.forEach(() => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card card-back';
      cardElement.textContent = 'Monopoly Deal';
      cardElement.style.cursor = 'not-allowed';
      
      handElement.appendChild(cardElement);
    });
  } else {
    // Show actual cards for the current perspective's player
    console.log(`Showing ${hand.length} actual cards for player ${playerNumber}`);
    
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
      
      handElement.appendChild(cardElement);
    });
    
    // Add discard mode indicator if needed
    if (window.MonopolyDeal.gameState.discardMode && 
        playerNumber === window.MonopolyDeal.gameState.currentPlayer) {
      const discardInfo = document.createElement('div');
      discardInfo.className = 'discard-info';
      discardInfo.textContent = `Discard ${window.MonopolyDeal.gameState.cardsToDiscard} more cards`;
      handElement.appendChild(discardInfo);
    }
  }
  
  return true;
};

window.MonopolyDeal.updatePlayerMoneyUI = function(playerNumber) {
  console.log(`Updating money UI for player ${playerNumber}...`);
  
  // Get the correct elements based on perspective and player number
  let moneyElement;
  
  // When the current perspective matches the player number, show in "player-money" (bottom)
  // Otherwise show in "opponent-money" (top)
  if (playerNumber === window.MonopolyDeal.currentPerspective) {
    moneyElement = document.getElementById('player-money');
    console.log(`Using player-money element for player ${playerNumber} (current perspective)`);
  } else {
    moneyElement = document.getElementById('opponent-money');
    console.log(`Using opponent-money element for player ${playerNumber} (not current perspective)`);
  }
  
  if (!moneyElement) {
    console.error(`Money element for player ${playerNumber} not found`);
    return false;
  }
  
  const money = window.MonopolyDeal.gameState.players[playerNumber].money;
  moneyElement.innerHTML = '';
  
  // In spectator mode, only show count of money cards
  if (window.MonopolyDeal.currentPerspective === 3) {
    const spectatorMessage = document.createElement('div');
    spectatorMessage.className = 'spectator-message';
    spectatorMessage.textContent = `Player ${playerNumber} has ${money.length} money cards`;
    spectatorMessage.style.textAlign = 'center';
    spectatorMessage.style.padding = '10px';
    spectatorMessage.style.fontSize = '14px';
    spectatorMessage.style.color = '#555';
    spectatorMessage.style.fontStyle = 'italic';
    
    moneyElement.appendChild(spectatorMessage);
    return true;
  }
  
  let totalValue = 0;
  
  // Check if in payment mode and this is the paying player
  const isPaymentMode = window.MonopolyDeal.gameState.paymentMode;
  const isPayingPlayer = isPaymentMode && 
                         window.MonopolyDeal.gameState.paymentRequest && 
                         window.MonopolyDeal.gameState.paymentRequest.fromPlayer === playerNumber;
  const selectedAssets = window.MonopolyDeal.gameState.selectedPaymentAssets;
  
  money.forEach((card, index) => {
    totalValue += parseInt(card.value);
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card money-card played';
    
    // Add payment-selectable class if in payment mode and this is the paying player
    if (isPayingPlayer && window.MonopolyDeal.currentPerspective === playerNumber) {
      cardElement.className += ' payment-selectable';
      
      // Check if this card is already selected for payment
      if (selectedAssets.money.includes(index)) {
        cardElement.className += ' payment-selected';
      }
      
      // Add payment overlay
      const overlayElement = document.createElement('div');
      overlayElement.className = 'payment-overlay';
      overlayElement.textContent = `$${card.value}M`;
      cardElement.appendChild(overlayElement);
      
      // Add click event to select for payment
      cardElement.addEventListener('click', function() {
        window.MonopolyDeal.togglePaymentAsset('money', index);
      });
    }
    
    cardElement.style.backgroundColor = window.MonopolyDeal.getMoneyColor(card.value);
    cardElement.innerHTML += `<div class="card-value">$${card.value}M</div>`;
    
    moneyElement.appendChild(cardElement);
  });
  
  // Add total value display
  const totalElement = document.createElement('div');
  totalElement.className = 'money-total';
  totalElement.textContent = `Total: $${totalValue}M`;
  moneyElement.appendChild(totalElement);
  
  return true;
};

window.MonopolyDeal.updatePlayerPropertiesUI = function(playerNumber) {
  console.log(`Updating properties UI for player ${playerNumber}...`);
  
  // Get the correct elements based on perspective and player number
  let propertiesElement;
  
  // When the current perspective matches the player number, show in "player-properties" (bottom)
  // Otherwise show in "opponent-properties" (top)
  if (playerNumber === window.MonopolyDeal.currentPerspective) {
    propertiesElement = document.getElementById('player-properties');
    console.log(`Using player-properties element for player ${playerNumber} (current perspective)`);
  } else {
    propertiesElement = document.getElementById('opponent-properties');
    console.log(`Using opponent-properties element for player ${playerNumber} (not current perspective)`);
  }
  
  if (!propertiesElement) {
    console.error(`Properties element for player ${playerNumber} not found`);
    return false;
  }
  
  const properties = window.MonopolyDeal.gameState.players[playerNumber].properties;
  propertiesElement.innerHTML = '';
  
  // In spectator mode, only show summary of properties
  if (window.MonopolyDeal.currentPerspective === 3) {
    const colorGroups = Object.keys(properties);
    const totalProperties = colorGroups.reduce((total, color) => total + properties[color].length, 0);
    
    const spectatorMessage = document.createElement('div');
    spectatorMessage.className = 'spectator-message';
    spectatorMessage.textContent = `Player ${playerNumber} has ${totalProperties} properties in ${colorGroups.length} color groups`;
    spectatorMessage.style.textAlign = 'center';
    spectatorMessage.style.padding = '10px';
    spectatorMessage.style.fontSize = '14px';
    spectatorMessage.style.color = '#555';
    spectatorMessage.style.fontStyle = 'italic';
    
    propertiesElement.appendChild(spectatorMessage);
    return true;
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
    colorGroupElement.className = `property-group ${color}-group`;
    
    // Add header for the color group
    const headerElement = document.createElement('div');
    headerElement.className = 'property-group-header';
    headerElement.textContent = `${color.charAt(0).toUpperCase() + color.slice(1)} Properties`;
    colorGroupElement.appendChild(headerElement);
    
    // Add each property card
    cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = `card property-card ${color}-property played`;
      
      // Add payment-selectable class if in payment mode and this is the paying player
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
      
      colorGroupElement.appendChild(cardElement);
    });
    
    propertiesElement.appendChild(colorGroupElement);
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
  // 3. Not in spectator mode
  return (
    window.MonopolyDeal.gameState.currentPlayer === playerNumber &&
    window.MonopolyDeal.currentPerspective === playerNumber &&
    window.MonopolyDeal.currentPerspective !== 3
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