# Monopoly Deal - Product Context

## Purpose

The Monopoly Deal web game exists to provide a digital version of the popular card game that can be played locally without requiring the physical cards. It offers the full gameplay experience of the original card game in a convenient web-based format.

## Problem Solved

This implementation solves several problems:

1. Accessibility - Allows players to enjoy Monopoly Deal without owning the physical cards
2. Convenience - No need to shuffle, deal, or manage physical cards
3. Mobility - Can be played on any device with a web browser
4. Rules enforcement - Automatically enforces the rules, preventing common mistakes
5. Learning tool - Helps new players learn the game with visual cues and automatic guidance

## User Experience Goals

The game aims to provide a smooth and intuitive experience with the following characteristics:

### For New Players

- Clear, visual representation of all game elements
- Informative messages explaining what actions are available
- Visual cues for valid moves and turn progression
- Game history to understand what has happened

### For Experienced Players

- Quick, streamlined gameplay
- Minimal clicks required for common actions
- Ability to play from either player's perspective
- Visual feedback that mimics the physical card game

## Core Gameplay Flow

1. **Game Start**

   - Players click "Start New Game"
   - 5 cards are dealt to each player
   - Player 1 starts the first turn

2. **Turn Progression**

   - Current player draws 2 cards
   - Player can play up to 3 cards from their hand
   - Cards can be played as properties, money, or for their action effects
   - Player ends their turn
   - Turn passes to the opponent

3. **Card Interactions**
   - Property cards can be collected in sets
   - Money cards build a bank to pay for rents and charges
   - Action cards allow special moves like stealing properties or collecting rent
   - Winning occurs when a player collects 3 complete property sets

## Design Principles

- **Clarity** - Game state should be immediately obvious
- **Feedback** - Actions should have clear visual and textual feedback
- **Consistency** - Similar actions should work in consistent ways
- **Forgiveness** - Players should be able to cancel actions before they're finalized
- **Guidance** - The UI should suggest what to do next

## User Personas

### Casual Gamer

- Wants quick entertainment
- May not know all the rules
- Appreciates visual cues and guidance
- Plays occasionally in short sessions

### Board Game Enthusiast

- Knows the physical card game well
- Values accurate representation of the rules
- Wants efficient UI with minimal hand-holding
- May play frequently and for longer sessions

### Family Players

- May play with children or less experienced players
- Value the educational aspect of the game
- Appreciate clear turn structure and rule enforcement
- May switch players during a session
