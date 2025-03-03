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
  DOUBLE_RENT: 'double-rent',
  WILD_RENT: 'wild-rent',
  PROPERTY_RENT: 'property-rent'
};

// Define specific rent card types
window.MonopolyDeal.RentTypes = {
  BROWN_LIGHT_BLUE: 'brown-light-blue',
  PURPLE_ORANGE: 'purple-orange', // purple is pink in our implementation
  RED_YELLOW: 'red-yellow',
  GREEN_BLUE: 'green-blue',
  RAILROAD_UTILITY: 'railroad-utility',
  WILD: 'wild'
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
    // Add money cards - total of 20 cards worth $57M
    // $1M - 6 cards
    for (let i = 0; i < 6; i++) deck.push({ type: 'money', value: 1, id: `money_1_${i}` });
    // $2M - 5 cards
    for (let i = 0; i < 5; i++) deck.push({ type: 'money', value: 2, id: `money_2_${i}` });
    // $3M - 3 cards
    for (let i = 0; i < 3; i++) deck.push({ type: 'money', value: 3, id: `money_3_${i}` });
    // $4M - 3 cards
    for (let i = 0; i < 3; i++) deck.push({ type: 'money', value: 4, id: `money_4_${i}` });
    // $5M - 2 cards
    for (let i = 0; i < 2; i++) deck.push({ type: 'money', value: 5, id: `money_5_${i}` });
    // $10M - 1 card
    deck.push({ type: 'money', value: 10, id: 'money_10_0' });

    // Add property cards - 28 total standard properties
    const properties = [
      // Brown (2 cards, 1M each)
      { color: 'brown', name: 'Baltic Avenue', value: 1 },
      { color: 'brown', name: 'Mediterranean Avenue', value: 1 },
      
      // Light Blue (3 cards, 1M each)
      { color: 'light-blue', name: 'Connecticut Avenue', value: 1 },
      { color: 'light-blue', name: 'Vermont Avenue', value: 1 },
      { color: 'light-blue', name: 'Oriental Avenue', value: 1 },
      
      // Pink (3 cards, 2M each) - Note: Pink = Purple in the original game
      { color: 'pink', name: 'St. Charles Place', value: 2 },
      { color: 'pink', name: 'Virginia Avenue', value: 2 },
      { color: 'pink', name: 'States Avenue', value: 2 },
      
      // Orange (3 cards, 2M each)
      { color: 'orange', name: 'New York Avenue', value: 2 },
      { color: 'orange', name: 'St. James Place', value: 2 },
      { color: 'orange', name: 'Tennessee Avenue', value: 2 },
      
      // Red (3 cards, 3M each)
      { color: 'red', name: 'Kentucky Avenue', value: 3 },
      { color: 'red', name: 'Indiana Avenue', value: 3 },
      { color: 'red', name: 'Illinois Avenue', value: 3 },
      
      // Yellow (3 cards, 3M each)
      { color: 'yellow', name: 'Ventnor Avenue', value: 3 },
      { color: 'yellow', name: 'Marvin Gardens', value: 3 },
      { color: 'yellow', name: 'Atlantic Avenue', value: 3 },
      
      // Green (3 cards, 4M each)
      { color: 'green', name: 'Pacific Avenue', value: 4 },
      { color: 'green', name: 'North Carolina Avenue', value: 4 },
      { color: 'green', name: 'Pennsylvania Avenue', value: 4 },
      
      // Blue (2 cards, 4M each)
      { color: 'blue', name: 'Boardwalk', value: 4 },
      { color: 'blue', name: 'Park Place', value: 4 },
      
      // Utility (2 cards, 2M each)
      { color: 'utility', name: 'Electric Company', value: 2 },
      { color: 'utility', name: 'Water Works', value: 2 },
      
      // Railroad (4 cards, 2M each)
      { color: 'railroad', name: 'Reading Railroad', value: 2 },
      { color: 'railroad', name: 'Pennsylvania Railroad', value: 2 },
      { color: 'railroad', name: 'B. & O. Railroad', value: 2 },
      { color: 'railroad', name: 'Short Line', value: 2 }
    ];

    // Add property wildcards - 11 total
    const propertyWildcards = [
      // Orange & Pink (2 copies) – Bank Value: $2M
      { colors: ['orange', 'pink'], name: 'Orange & Pink Wildcard', value: 2, count: 2, imageCode: 'wildop', topColor: 'orange' },
      
      // Light Blue & Brown (1 copy) – Bank Value: $1M
      { colors: ['light-blue', 'brown'], name: 'Light Blue & Brown Wildcard', value: 1, count: 1, imageCode: 'wildlbbr', topColor: 'light-blue' },
      
      // Light Blue & Railroad (1 copy) – Bank Value: $2M
      { colors: ['light-blue', 'railroad'], name: 'Light Blue & Railroad Wildcard', value: 2, count: 1, imageCode: 'wildlbt', topColor: 'light-blue' },
      
      // Blue & Green (1 copy) – Bank Value: $4M
      { colors: ['blue', 'green'], name: 'Blue & Green Wildcard', value: 4, count: 1, imageCode: 'wildbg', topColor: 'blue' },
      
      // Railroad & Green (1 copy) – Bank Value: $4M
      { colors: ['railroad', 'green'], name: 'Railroad & Green Wildcard', value: 4, count: 1, imageCode: 'wildgt', topColor: 'green' },
      
      // Red & Yellow (2 copies) – Bank Value: $3M
      { colors: ['red', 'yellow'], name: 'Red & Yellow Wildcard', value: 3, count: 2, imageCode: 'wildry', topColor: 'red' },
      
      // Utility & Railroad (1 copy) – Bank Value: $4M
      { colors: ['utility', 'railroad'], name: 'Utility & Railroad Wildcard', value: 4, count: 1, imageCode: 'wildut', topColor: 'utility' },
      
      // Multicolor Wildcard (2 copies) – Bank Value: $0M
      { colors: ['any'], name: 'Property Wildcard (Any Color)', value: 0, count: 2, imageCode: 'propertywildcard' }
    ];

    // Add standard properties to deck
    properties.forEach((prop, index) => {
      deck.push({
        type: 'property',
        ...prop,
        id: `property_${prop.color}_${index}`
      });
    });
    
    // Add property wildcards to deck
    let wildcardIndex = 0;
    propertyWildcards.forEach(wildcard => {
      for (let i = 0; i < wildcard.count; i++) {
        deck.push({
          type: 'property',
          wildcard: true,
          color: wildcard.topColor || wildcard.colors[0],
          secondaryColor: wildcard.colors.length > 1 ? (wildcard.topColor ? wildcard.colors.find(c => c !== wildcard.topColor) : wildcard.colors[1]) : null,
          colors: wildcard.colors,
          name: wildcard.name,
          value: wildcard.value,
          imageCode: wildcard.imageCode,
          isFlipped: false,
          id: `property_wildcard_${wildcardIndex}`
        });
        wildcardIndex++;
      }
    });

    // Add action cards - 34 total
    const actions = [
      // Pass Go - 10 cards
      { action: window.MonopolyDeal.ActionTypes.PASS_GO, name: 'Pass Go', description: 'Draw 2 extra cards from the draw pile', value: 1, count: 10 },
      
      // Deal Breaker - 2 cards
      { action: window.MonopolyDeal.ActionTypes.DEAL_BREAKER, name: 'Deal Breaker', description: 'Steal a complete set from one opponent', value: 5, count: 2 },
      
      // Just Say No - 3 cards
      { action: window.MonopolyDeal.ActionTypes.JUST_SAY_NO, name: 'Just Say No', description: 'Cancel any action card used against you (including another Just Say No)', value: 4, count: 3 },
      
      // Sly Deal - 3 cards
      { action: window.MonopolyDeal.ActionTypes.SLY_DEAL, name: 'Sly Deal', description: 'Steal one property from an opponent (not from a completed set)', value: 3, count: 3 },
      
      // Forced Deal - 3 cards
      { action: window.MonopolyDeal.ActionTypes.FORCED_DEAL, name: 'Force Deal', description: 'Swap one of your properties with one from an opponent', value: 3, count: 4 },
      
      // Debt Collector - 3 cards
      { action: window.MonopolyDeal.ActionTypes.DEBT_COLLECTOR, name: 'Debt Collector', description: 'Demand $5M from one opponent', value: 3, count: 3 },
      
      // It's My Birthday - 3 cards
      { action: window.MonopolyDeal.ActionTypes.BIRTHDAY, name: 'It\'s My Birthday', description: 'All opponents must pay you $2M each', value: 2, count: 3 },
      
      // House - 3 cards
      { action: window.MonopolyDeal.ActionTypes.HOUSE, name: 'House', description: 'Place on a completed set to increase rent', value: 3, count: 3 },
      
      // Hotel - 3 cards
      { action: window.MonopolyDeal.ActionTypes.HOTEL, name: 'Hotel', description: 'Upgrade a set that already has a House for even higher rent', value: 4, count: 3 },
      
      // Double The Rent - 2 cards
      { action: window.MonopolyDeal.ActionTypes.DOUBLE_RENT, name: 'Double The Rent', description: 'When played with a Rent card, it doubles the rent charged', value: 1, count: 2 }
    ];

    // Add rent cards - 13 total
    const rentCards = [
      // Purple & Orange (2 copies) - $1M Bank Value
      { action: window.MonopolyDeal.ActionTypes.PROPERTY_RENT, rentType: window.MonopolyDeal.RentTypes.PURPLE_ORANGE, name: 'Rent: Pink & Orange', description: 'Charge rent for Pink or Orange properties', value: 1, count: 2, colors: ['pink', 'orange'] },
      
      // Railroad & Utility (2 copies) - $1M Bank Value
      { action: window.MonopolyDeal.ActionTypes.PROPERTY_RENT, rentType: window.MonopolyDeal.RentTypes.RAILROAD_UTILITY, name: 'Rent: Railroad & Utility', description: 'Charge rent for Railroad or Utility properties', value: 1, count: 2, colors: ['railroad', 'utility'] },
      
      // Green & Dark Blue (2 copies) - $1M Bank Value
      { action: window.MonopolyDeal.ActionTypes.PROPERTY_RENT, rentType: window.MonopolyDeal.RentTypes.GREEN_BLUE, name: 'Rent: Green & Blue', description: 'Charge rent for Green or Blue properties', value: 1, count: 2, colors: ['green', 'blue'] },
      
      // Brown & Light Blue (2 copies) - $1M Bank Value
      { action: window.MonopolyDeal.ActionTypes.PROPERTY_RENT, rentType: window.MonopolyDeal.RentTypes.BROWN_LIGHT_BLUE, name: 'Rent: Brown & Light Blue', description: 'Charge rent for Brown or Light Blue properties', value: 1, count: 2, colors: ['brown', 'light-blue'] },
      
      // Red & Yellow (2 copies) - $1M Bank Value
      { action: window.MonopolyDeal.ActionTypes.PROPERTY_RENT, rentType: window.MonopolyDeal.RentTypes.RED_YELLOW, name: 'Rent: Red & Yellow', description: 'Charge rent for Red or Yellow properties', value: 1, count: 2, colors: ['red', 'yellow'] },
      
      // Wild Rent (Any Color, but one opponent at a time) - 3 copies, $3M Bank Value
      { action: window.MonopolyDeal.ActionTypes.WILD_RENT, rentType: window.MonopolyDeal.RentTypes.WILD, name: 'Wild Rent', description: 'Charge rent for properties of any one color', value: 3, count: 3, colors: ['any'] }
    ];

    // Add action cards to deck
    actions.forEach(actionCard => {
      for (let i = 0; i < actionCard.count; i++) {
        deck.push({
          type: 'action',
          ...actionCard,
          id: `action_${actionCard.action}_${i}`
        });
      }
    });
    
    // Add rent cards to deck
    rentCards.forEach(rentCard => {
      for (let i = 0; i < rentCard.count; i++) {
        deck.push({
          type: 'action',
          ...rentCard,
          id: `action_${rentCard.action}_${rentCard.rentType}_${i}`
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