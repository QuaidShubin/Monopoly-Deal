# Monopoly Deal - Active Context

## Current Work Focus

We're currently addressing critical issues with the game's core functionality:

1. **Card Dealing**: Fixed the issue where Player 1 was not receiving cards at the start of the game.
2. **Card Action Popups**: Fixed issues with the modal system for card actions not displaying properly.
3. **Syntax Errors**: Fixed critical syntax error in the JavaScript code that was preventing the game from running properly.
4. **Game State Tracking**: Fixed issues with the game state tracking for drawn cards and playable cards.
5. **Card Playability**: Fixed critical bugs in the card playability calculation and card click handling that were preventing cards from being played.
6. **Centralized Validation System**: Implemented a robust card validation system to provide consistent, detailed error messages and eliminate "Unknown reason" errors.
7. **Code Duplication**: Removed duplicate implementation of resetGameState from scripts.js to use the single version in gameState.js.
8. **Variable Redeclaration**: Fixed "Identifier 'elements' has already been declared" error by modifying scripts.js to use the existing elements object from gameState.js.
9. **Card Reference System**: Implemented a more robust card reference system that doesn't rely on indices, which can change during gameplay
10. **Action Modal Improvements**: Enhanced the action modal system to clearly show available and unavailable options with visual indicators
11. **UI Updates**: Added styling for action options with better descriptions and visual feedback
12. **Syntax Error Fixes**: Corrected several syntax errors in the game logic
13. **Debugging Enhancements**: Added comprehensive logging throughout the codebase to trace issues
14. **Player Perspective Fixes**: Improved handling of player perspective to ensure correct card interactions
15. **Payment System**: Added payment request object to game state and implemented proper payment modal handling
16. **Discard Functionality**: Fixed discardCard function to properly handle UI updates and timeouts
17. **Debug Features**: Added "Show Opponent Cards" toggle button for easier debugging
18. **UI Organization**: Created a dedicated ui.js file for UI helper functions

## Recent Changes

### 1. Payment System Improvements

- Added payment request object to game state initialization
- Implemented hidePaymentModal function to properly clean up payment requests
- Ensured proper UI updates after payment processing
- Added proper timeout handling for payment modal display

### 2. Discard Functionality Fixes

- Fixed discardCard function to properly handle UI updates
- Added timeout to automatically update game status after discarding
- Ensured proper cleanup after discard mode ends

### 3. Debug Features

- Added "Show Opponent Cards" toggle button in the header
- Implemented CSS for showing/hiding opponent cards
- Added toggleOpponentCards function to handle the visibility toggle
- Updated UI when toggling opponent cards visibility

### 4. UI Organization

- Created ui.js file with updatePlayerUI function to centralize UI updates
- Updated file structure in README.md to reflect new organization
- Ensured proper script loading order in index.html
- Added documentation for UI helper functions

### 1. Fixed Variable Redeclaration Error

- Fixed "Uncaught SyntaxError: Identifier 'elements' has already been declared" error
- Modified scripts.js to use the existing elements object from gameState.js instead of redeclaring it
- Changed the code from using a new `const elements = {...}` declaration to updating the existing object with `elements.property = value`
- This ensures proper script loading and prevents JavaScript syntax errors in the browser

### 2. Code Duplication Clean-up

- Removed the duplicate resetGameState function from scripts.js
- Now using the single implementation from gameState.js that is properly exported
- Removed redundant hasDrawnCards assignment in startGame since resetGameState already handles it
- This simplifies codebase maintenance and eliminates potential synchronization issues

### 3. Centralized Card Validation System

- Created a new validation system in gameState.js that provides consistent card playability checking
- Added detailed validation result codes (VALID, GAME_NOT_STARTED, NOT_YOUR_TURN, etc.)
- Refactored the card click handler to use the validation system
- Updated the updatePlayerHandUI function to use the validation system for visual indicators
- Enhanced the enhancedPlayCardWithIndex function to use the validation system
- Added extensive validation debugging to track down playability issues
- This system makes error messages consistent and eliminates "Unknown reason" errors

### 4. Script Dependency Management

- Updated index.html to properly include gameState.js and cards.js before scripts.js
- Ensured that card validation functions are available globally
- Exposed validation functions through the window object for cross-file access
- Added proper module exports for environments that support modules

### 5. Enhanced Debugging

- Added super detailed debugging in the card click handler to diagnose validation issues
- Added card validation details with step-by-step checks
- Improved validation result reporting with detailed status codes and messages
- Added documentation for these improvements in README.md

### 6. Card Reference System

- Added a missing `getCardById` function to properly retrieve card objects
- Fixed issues with card references in the update UI functions
- Ensured proper handling of both object and ID-based card references

### 7. Action Modal Improvements

- Fixed the `showActionOptions` function to properly display the card action popup
- Added proper error handling and debugging for modal display
- Fixed the cancel button handling in the modal
- Enhanced the `playActionCard` function to implement specific actions based on card type
- Added support for different action types (Pass Go, Rent) in the modal options

### 8. UI Updates

- Fixed issues with the `updatePlayerHandUI` function to properly set card click handlers
- Corrected player indexing issues (using 0-based vs 1-based indices)
- Added better error handling and logging

### 9. Card Playability Fix

- Fixed a critical bug in the `isCurrentPlayerTurn` calculation in `updatePlayerHandUI`
- The bug was comparing `gameState.currentPlayer` to `playerIndex` (the player whose hand we're updating) instead of to the current player perspective
- Updated the calculation to correctly check if the current player matches the player's perspective
- Simplified the card playability logic to make it clearer and more robust
- Enhanced debugging to show the values of each condition in the playability check
- This ensures that cards are now properly playable when all other conditions are met

### 10. Card Click Handler Fixes

- Fixed data attribute handling for card index
- Added duplicate dataset.cardIndex property for better compatibility
- Enhanced logging to show the card element and its attributes
- Modified the card click handler to directly call `playCardWithIndex` with the correct index
- This bypasses the potentially problematic event target handling in `handleCardPlay`
- Added extensive debugging to trace the exact flow of card interactions

### 11. Syntax Error Fixes

- Removed an extra closing bracket in the `addSwitchPerspectiveButton` function that was causing the game to crash
- Fixed JavaScript syntax errors that were preventing the game from loading properly

### 12. Debugging Enhancements

- Added detailed debug logging in the card click handler to diagnose why cards aren't responding to clicks
- Added debug logging in the `drawCard` function to monitor the `hasDrawnCards` state flag
- Enhanced console output to better trace the game flow
- Added detailed logging for modal operations to diagnose display issues

### 13. Player Perspective Fixes

- Fixed an issue where the card playability check was inconsistent with the player perspective
- Added a new `allowCardPlay` variable that correctly handles card clicks regardless of perspective issues
- Updated the `handleCardPlay` function to properly check player perspective
- Enhanced error messages to provide more detailed information about why cards can't be played

### 5. Visual and Gameplay Enhancements

- Enhanced property card display with detailed rent information
- Implemented accurate rent calculation based on property set completeness
- Improved card styling with consistent colors for all card types
- Always hide opponent hand cards for security (removed toggle functionality)
- Added proper rent values display on property cards (1 card, 2+ cards, full set)
- Updated createCardElement function to handle all card types consistently
- Improved money card colors based on their value

### 6. Rent Calculation System

- Implemented calculateRentForProperties function to accurately calculate rent based on:
  - Property color (base rent values vary by color)
  - Number of properties in the set
  - Whether the set is complete or not
- Rent multipliers:
  - 1 card: base rent
  - 2+ cards but incomplete: 2x base rent
  - Complete set: 4x base rent
- Updated rent display in the UI to show the calculated values

### 7. Security Improvements

- Removed the ability to see opponent's hand cards
- Ensured opponent cards are always displayed as card backs
- Maintained visibility of opponent's properties and money for gameplay purposes

## Previous Investigation

We were investigating two main issues:

1. **Cards Not Responding to Clicks**: Fixed by correcting perspective handling, card playability checks, the `isCurrentPlayerTurn` calculation, and data attribute handling
2. **Action Modals Not Displaying**: Fixed by improving the modal system with better error handling and debugging

The investigation focused on these areas:

1. **Card Playability Logic**: Identifying why cards weren't playable even when all conditions seemed to be met
2. **Data Attribute Handling**: Ensuring card indexes are properly stored and retrieved
3. **Event Flow**: Tracing the path from click to card action to identify breakpoints
4. **Modal Display System**: Identifying why the action selection modal wasn't appearing when cards were played
5. **Cancel Button Handling**: Fixing issues with the cancel button not working properly in the modal
6. **Action Card Handling**: Implementing specific actions for different card types
7. **Game State Flags**: Ensuring proper tracking of game state for card playability

## Known Issues

1. **Duplicate Functions**: There are multiple implementations of some functions (e.g., `togglePlayerAreas`) causing potential conflicts
2. **State Management**: Inconsistent state updates across different game actions
3. **Error Handling**: Limited error handling for edge cases
4. **Event Bubbling**: Some click events may be captured by parent elements unintentionally

## Next Steps

### Immediate Priorities

1. **Test Card Playability Fix**: Verify that cards can now be played when all conditions are met
2. **Test Card Action Modals**: Verify that action cards now properly display their modal with correct options
3. **Test Pass Go Functionality**: Ensure that playing a Pass Go card correctly allows drawing 2 additional cards
4. **Test Rent Collection**: Verify that Rent cards display the appropriate options for collecting rent
5. **Complete Game Flow Testing**: Ensure a complete turn can be executed (draw cards, play cards, end turn)

### Medium-Term Improvements

1. **Implement More Card Actions**: Add functionality for all the different action card types
2. **Refactor Duplicate Functions**: Merge duplicate implementations and ensure consistent behavior
3. **Improve Error Handling**: Add more robust error handling throughout the codebase
4. **Enhance UI Feedback**: Add more visual cues for valid actions and game state changes

### Long-Term Goals

1. **Code Reorganization**: Better separation of concerns between game logic and UI
2. **Performance Optimization**: Reduce unnecessary DOM updates and improve rendering efficiency
3. **Enhanced Features**: Add customizable rules, game saving/loading, and potentially AI opponents

## Current Decisions

1. **Modal Architecture**: Use a consistent approach for displaying modals using the `showActionOptions` function
2. **Card Action Implementation**: Implement specific actions for each card type using a switch statement in `playActionCard`
3. **Debug-First Approach**: Add comprehensive logging to trace issues with game flow and UI interactions
4. **Error Handling**: Add progressive error handling focusing first on critical paths
5. **Direct Card Handling**: Directly call `playCardWithIndex` from the card click handler to bypass event complexities

## Technical Questions to Resolve

1. How to best implement the full range of card actions (Deal Breaker, Just Say No, etc.)?
2. What's the optimal way to handle targeting other players for card actions?
3. How should we implement the rule that you can play 3 cards per turn?
4. How to handle special cases like Double The Rent which counts as its own action?
5. What's the best approach to implement the payment system for cards like Debt Collector?
6. Should we add animation effects for card movements to enhance user experience?
7. How to handle complex action cards that require multiple steps (e.g., Deal Breaker)?
8. What's the best approach for implementing the Just Say No counter-action?
9. How to properly validate property sets for actions like Deal Breaker?
10. What's the optimal way to handle wildcard property assignments?
