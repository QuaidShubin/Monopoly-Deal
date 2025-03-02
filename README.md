# Monopoly Deal Card Game

A web-based implementation of the Monopoly Deal card game with simplified game logic.

## Project Structure

```
monopoly-deal/
├── index.html          # Main game interface
├── styles.css          # Game styling
├── cards.js            # Card definitions and card-related functions
├── gameState.js        # Game state management
├── ui.js               # UI helper functions
└── scripts.js          # Main game logic and UI handlers
```

## Game Features

### Core Functionality

- Start a new game
- Draw cards on your turn
- Play property cards to your property sets
- Play money cards to your money piles
- Play action cards (simplified implementation)
- End your turn
- Switch perspective between players using keyboard shortcuts (1 for Player 1, 2 for Player 2)
- Toggle opponent cards visibility (debug feature)

### Card System

- Property cards
- Money cards
- Action cards (simplified implementation)

### Game State Management

- Player hands
- Property collections
- Money piles
- Turn management
- Payment requests

### UI Components

- Player areas
- Card display
- Money pile visualization
- Game status messages
- Action buttons
- Debug controls
- Enhanced payment interface with denomination selection

## How to Play

1. Click "Start New Game" to begin
2. On your turn:
   - Click the Draw Pile to draw 2 cards
   - Click on cards in your hand to play them (up to 3 per turn)
   - Choose to play cards as properties, money, or actions
   - Click "End Turn" when you're done
3. Making payments:
   - When a payment is requested, the paying player will see a payment interface
   - Use the + and - buttons to select money cards by denomination
   - A progress bar shows how much of the required payment has been selected
   - Click "MAKE PAYMENT" when the required amount is selected

## Simplified Game Logic

This version features a simplified implementation focusing on:

- Core game mechanics
- Clear property display
- Basic turn structure
- Card type preservation
- Intuitive payment system

Action card effects are implemented in a simplified manner, with the focus on the visual representation and game flow rather than complex action logic.

## Development

### Setup

1. Clone the repository
2. Open index.html in a modern web browser
3. Start playing!

### Debugging

- Check browser console for detailed logging
- Game state is saved in `window.MonopolyDeal.gameState`
- Switch player perspective using the button in the header or keyboard shortcuts (1 for Player 1, 2 for Player 2)
- Toggle opponent cards visibility using the "Show Opponent Cards" button

## Code Organization

### MonopolyDeal Namespace

All game functionality is organized under the `window.MonopolyDeal` namespace:

```javascript
window.MonopolyDeal = {
  gameState: {}, // Game state data
  elements: {}, // UI element references
  // Core functions
  startGame: function () {},
  drawCardsForTurn: function () {},
  playCard: function () {},
  // ... other functions
};
```

## Recent Enhancements

- Improved payment UI with denomination selection
- Visual payment progress tracking
- Keyboard shortcuts for perspective switching
- Enhanced animations and visual feedback
- Fixed button positioning and UI layout
- Space-efficient horizontal money display layout
- Reduced height of denomination boxes for better space utilization
- Simplified money display with "Money:" label followed by denominations and total
- Removed perspective indicators for cleaner UI
- Removed payment button and infrastructure (placeholder for custom implementation)
- Responsive design improvements for smaller screens

## License

MIT License - See LICENSE file for details
