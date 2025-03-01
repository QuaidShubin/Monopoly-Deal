# Monopoly Deal - Technical Context

## Technologies Used

### Frontend

- **HTML5**: Structural framework for the game UI
- **CSS3**: Styling for all game elements, including cards and game board
- **JavaScript (ES6+)**: Core game logic and interactivity
- **LocalStorage API**: Browser storage for cross-tab game state synchronization

### Development Tools

- **Git**: Version control
- **Modern Browser DevTools**: For debugging and testing

## Development Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser
3. Make changes to the code
4. Refresh the browser to see updates

No build process, bundling, or transpilation is required, making the development process straightforward.

## Technical Constraints

### Browser Compatibility

- Requires modern browsers that support ES6+ features
- LocalStorage support required for cross-tab functionality
- CSS Grid and Flexbox used extensively for layout

### Performance Considerations

- Card animations kept lightweight to ensure smooth gameplay
- DOM manipulations minimized during gameplay for performance
- Game state updates batched where possible

### Limitations

- No server-side persistence (all data stored in browser)
- No multiplayer support across different devices
- No offline application capabilities beyond the browser's cache

## Code Structure

### File Organization

```
monopoly-deal/
├── index.html      # Main HTML structure
├── styles.css      # All styles
├── scripts.js      # Main game logic
├── cards.js        # Card definitions
├── gameState.js    # Game state management
└── ui.js           # UI helper functions
```

### Key Objects and Functions

#### Game State Management

- `gameState`: Central state object
- `resetGameState()`: Resets the game to initial state
- `saveGameState()`: Persists state to localStorage
- `loadGameState()`: Retrieves state from localStorage

#### Card Management

- `initializeDeck()`: Creates and initializes the deck
- `shuffleDeck()`: Randomizes card order
- `dealCard()`: Moves a card from deck to player hand
- `getCardById()`: Retrieves a card by its ID
- `createCardElement()`: Creates DOM element for a card

#### Player Actions

- `drawCard()`: Handles drawing cards from the deck
- `playCard()`: Processes a card being played
- `playPropertyCard()`: Handles playing a property card
- `playActionCard()`: Handles playing an action card
- `playCardAsMoney()`: Handles playing a card as money
- `endTurn()`: Handles turn transitions

#### Payment System

- `requestPayment()`: Initiates payment request from one player to another
- `showPaymentIndicator()`: Displays the payment UI for the paying player
- `togglePaymentAsset()`: Handles selection/deselection of assets for payment
- `processSelectedPayment()`: Transfers selected assets between players

#### UI Management

- `updatePlayerUI()`: Updates all UI elements for a player
- `updatePlayerHandUI()`: Updates the hand display
- `updatePlayerPropertiesUI()`: Updates property display
- `updateMoneyPilesUI()`: Updates money pile display
- `updateCenterStatus()`: Updates status message
- `addToHistory()`: Adds entry to game history

## Data Structures

### Card Object

```javascript
{
  id: 'unique_id',           // Unique identifier
  type: 'property|money|action', // Card type
  name: 'Card Name',         // Display name
  color: 'blue',             // For property cards
  value: 5,                  // Monetary value
  actionType: 'rent',        // For action cards
  isWildcard: false,         // For wildcard properties
  colors: ['blue', 'green'], // For dual-color wildcards
  rent: [1, 3, 5]            // Rent values based on set completeness
}
```

### Game State Object

```javascript
{
  gameStarted: true,          // Game in progress flag
  currentPlayer: 1,           // Current player (1 or 2)
  deck: [ /* card objects */ ],            // Cards in deck
  discardPile: [ /* card objects */ ],     // Discarded cards
  cardsPlayedThisTurn: 0,     // Cards played this turn
  cardsDrawnThisTurn: 0,      // Cards drawn this turn
  hasDrawnCards: false,       // If current player has drawn
  discardMode: false,         // If player is in discard mode
  cardsToDiscard: 0,          // Number of cards to discard
  paymentRequest: null,       // Payment request object (to, from, amount)
  paymentMode: false,         // If in payment mode
  paymentPending: false,      // If payment is pending
  selectedPaymentAssets: { money: [], properties: [] },  // Selected payment assets
  players: {
    1: {
      hand: [ /* card objects */ ],          // Cards in hand
      properties: { color: [ /* cards */ ] },    // Property cards played
      money: [ /* card objects */ ]          // Money cards played
    },
    2: {
      // Same structure as player 1
    }
  }
}
```

## UI Component Hierarchy

```
Game Container
├── Game Header
│   ├── Title
│   ├── Game Info
│   └── Start Button
├── Game Layout
│   ├── Controls Sidebar
│   │   ├── Draw Pile
│   │   ├── Discard Pile
│   │   └── End Turn Button
│   ├── Game Board
│   │   ├── Player 2 Area
│   │   │   ├── Player Info
│   │   │   ├── Money Piles
│   │   │   ├── Hand
│   │   │   └── Properties
│   │   ├── Center Area
│   │   └── Player 1 Area
│   │       ├── Properties
│   │       ├── Hand
│   │       ├── Money Piles
│   │       └── Player Info
│   └── History Sidebar
│       └── Game History Log
└── Modals
    ├── Card Action Modal
    └── Payment Modal
        ├── Payment Header
        ├── Progress Bar
        ├── Payment Selection
        └── Payment Actions
```

## Technical Debt and Future Improvements

### Known Technical Debt

- Some event handler duplication between card clicks
- Inconsistent state update patterns across different actions
- Limited error handling for edge cases
- Need for better separation between game logic and UI

### Future Technical Improvements

- Implementing a proper MVC pattern
- Adding unit tests for game logic
- Creating a proper build process for optimization
- Adding proper module system (ES modules)
- Improving accessibility features

## Recent Technical Changes

- Redesigned payment modal with improved UX
- Added progress bar visualization for payment completion
- Simplified payment flow with better feedback
- Improved CSS for payment-related components
- Enhanced payment asset selection visual feedback
