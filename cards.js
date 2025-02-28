// Card definitions and functions for Monopoly Deal
console.log('Cards.js loading...');

// Export card-related constants and functions
window.MonopolyDeal = window.MonopolyDeal || {};

// Card validation result codes
window.MonopolyDeal.CardValidationResult = {
  VALID: { code: 'VALID', message: 'Card can be played' },
  GAME_NOT_STARTED: { code: 'GAME_NOT_STARTED', message: 'Game has not started yet' },
  NOT_YOUR_TURN: { code: 'NOT_YOUR_TURN', message: 'It is not your turn' },
  CARDS_NOT_DRAWN: { code: 'CARDS_NOT_DRAWN', message: 'You must draw cards first' },
  MAX_CARDS_PLAYED: { code: 'MAX_CARDS_PLAYED', message: 'You have already played 3 cards this turn' },
  NO_VALID_TARGET: { code: 'NO_VALID_TARGET', message: 'There is no valid target for this card' },
  NO_MATCHING_PROPERTIES: { code: 'NO_MATCHING_PROPERTIES', message: 'You have no matching properties' }
};

// Define card action types
window.MonopolyDeal.ActionTypes = {
  PASS_GO: 'pass-go',
  RENT: 'rent',
  DEAL_BREAKER: 'deal-breaker',
  SLY_DEAL: 'sly-deal',
  FORCED_DEAL: 'forced-deal',
  DEBT_COLLECTOR: 'debt-collector',
  BIRTHDAY: 'birthday',
  JUST_SAY_NO: 'just-say-no',
  HOUSE: 'house',
  HOTEL: 'hotel',
  DOUBLE_RENT: 'double-rent'
};

// Helper function to get color for money cards
window.MonopolyDeal.getMoneyColor = function(value) {
  console.log('getMoneyColor called with value:', value);
  switch (parseInt(value)) {
    case 1: return '#90caf9'; // Light blue
    case 2: return '#a5d6a7'; // Light green
    case 3: return '#ffcc80'; // Light orange
    case 4: return '#ce93d8'; // Light purple
    case 5: return '#ef9a9a'; // Light red
    case 10: return '#fff59d'; // Light yellow
    default: return '#e0e0e0'; // Light grey
  }
};

// Initialize the deck of cards
window.MonopolyDeal.initializeDeck = function() {
  console.log('Initializing deck of cards...');
  const deck = [];
  
  try {
    // Add money cards
    for (let i = 0; i < 6; i++) deck.push({ type: 'money', value: 1, id: `money_1_${i}` });
    for (let i = 0; i < 5; i++) deck.push({ type: 'money', value: 2, id: `money_2_${i}` });
    for (let i = 0; i < 3; i++) deck.push({ type: 'money', value: 3, id: `money_3_${i}` });
    for (let i = 0; i < 3; i++) deck.push({ type: 'money', value: 4, id: `money_4_${i}` });
    for (let i = 0; i < 2; i++) deck.push({ type: 'money', value: 5, id: `money_5_${i}` });
    for (let i = 0; i < 1; i++) deck.push({ type: 'money', value: 10, id: `money_10_${i}` });

    // Add property cards
    const properties = [
      { color: 'brown', name: 'Baltic Avenue', value: 1 },
      { color: 'brown', name: 'Mediterranean Avenue', value: 1 },
      { color: 'blue', name: 'Boardwalk', value: 4 },
      { color: 'blue', name: 'Park Place', value: 4 },
      { color: 'green', name: 'Pacific Avenue', value: 4 },
      { color: 'green', name: 'North Carolina Avenue', value: 4 },
      { color: 'green', name: 'Pennsylvania Avenue', value: 4 },
      { color: 'red', name: 'Kentucky Avenue', value: 3 },
      { color: 'red', name: 'Indiana Avenue', value: 3 },
      { color: 'red', name: 'Illinois Avenue', value: 3 },
      { color: 'yellow', name: 'Ventnor Avenue', value: 3 },
      { color: 'yellow', name: 'Marvin Gardens', value: 3 },
      { color: 'yellow', name: 'Atlantic Avenue', value: 3 },
      { color: 'orange', name: 'New York Avenue', value: 2 },
      { color: 'orange', name: 'St. James Place', value: 2 },
      { color: 'orange', name: 'Tennessee Avenue', value: 2 },
      { color: 'pink', name: 'St. Charles Place', value: 2 },
      { color: 'pink', name: 'Virginia Avenue', value: 2 },
      { color: 'pink', name: 'States Avenue', value: 2 },
      { color: 'light-blue', name: 'Connecticut Avenue', value: 1 },
      { color: 'light-blue', name: 'Vermont Avenue', value: 1 },
      { color: 'light-blue', name: 'Oriental Avenue', value: 1 },
      { color: 'utility', name: 'Electric Company', value: 2 },
      { color: 'utility', name: 'Water Works', value: 2 },
      { color: 'railroad', name: 'Reading Railroad', value: 2 },
      { color: 'railroad', name: 'Pennsylvania Railroad', value: 2 },
      { color: 'railroad', name: 'B&O Railroad', value: 2 },
      { color: 'railroad', name: 'Short Line Railroad', value: 2 }
    ];

    properties.forEach((prop, index) => {
      deck.push({
        type: 'property',
        ...prop,
        id: `property_${prop.color}_${index}`
      });
    });

    // Add action cards
    const actions = [
      { action: window.MonopolyDeal.ActionTypes.PASS_GO, name: 'Pass Go', description: 'Draw 2 cards', value: 1, count: 10 },
      { action: window.MonopolyDeal.ActionTypes.DEAL_BREAKER, name: 'Deal Breaker', description: 'Steal a complete set', value: 5, count: 2 },
      { action: window.MonopolyDeal.ActionTypes.JUST_SAY_NO, name: 'Just Say No', description: 'Cancel another action card', value: 4, count: 3 },
      { action: window.MonopolyDeal.ActionTypes.SLY_DEAL, name: 'Sly Deal', description: 'Steal one property', value: 3, count: 3 },
      { action: window.MonopolyDeal.ActionTypes.BIRTHDAY, name: 'It\'s My Birthday', description: 'Collect $2M from each player', value: 2, count: 2 },
      { action: window.MonopolyDeal.ActionTypes.DEBT_COLLECTOR, name: 'Debt Collector', description: 'Collect $5M from one player', value: 3, count: 3 },
      { action: window.MonopolyDeal.ActionTypes.RENT, name: 'Rent', description: 'Collect rent for matching properties', value: 3, count: 4 }
    ];

    actions.forEach(actionCard => {
      for (let i = 0; i < actionCard.count; i++) {
        deck.push({
          type: 'action',
          ...actionCard,
          id: `action_${actionCard.action}_${i}`
        });
      }
    });

    console.log(`Deck initialized with ${deck.length} cards`);
    return deck;
  } catch (error) {
    console.error('Error initializing deck:', error);
    // Return a minimal deck to prevent further errors
    return [
      { type: 'money', value: 1, id: 'money_1_0' },
      { type: 'money', value: 2, id: 'money_2_0' },
      { type: 'property', color: 'blue', name: 'Boardwalk', value: 4, id: 'property_blue_0' },
      { type: 'action', action: 'pass-go', name: 'Pass Go', description: 'Draw 2 cards', value: 1, id: 'action_pass-go_0' }
    ];
  }
};

// Get card by ID
window.MonopolyDeal.getCardById = function(cardId) {
  const deck = window.MonopolyDeal.initializeDeck();
  return deck.find(card => card.id === cardId);
};

// Check if a card can be played
window.MonopolyDeal.canPlayCard = function(card, gameState, playerIndex) {
  if (!gameState.gameStarted) {
    return window.MonopolyDeal.CardValidationResult.GAME_NOT_STARTED;
  }

  if (gameState.currentPlayer !== playerIndex) {
    return window.MonopolyDeal.CardValidationResult.NOT_YOUR_TURN;
  }

  if (!gameState.hasDrawnCards) {
    return window.MonopolyDeal.CardValidationResult.CARDS_NOT_DRAWN;
  }

  if (gameState.cardsPlayedThisTurn >= 3) {
    return window.MonopolyDeal.CardValidationResult.MAX_CARDS_PLAYED;
  }

  return window.MonopolyDeal.CardValidationResult.VALID;
};

// Export functions explicitly
window.MonopolyDeal.getMoneyColor = window.MonopolyDeal.getMoneyColor;
window.MonopolyDeal.initializeDeck = window.MonopolyDeal.initializeDeck;
window.MonopolyDeal.getCardById = window.MonopolyDeal.getCardById;
window.MonopolyDeal.canPlayCard = window.MonopolyDeal.canPlayCard;

console.log('Cards.js loaded successfully!'); 