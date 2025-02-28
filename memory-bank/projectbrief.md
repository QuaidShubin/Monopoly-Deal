# Monopoly Deal Card Game - Project Brief

## Project Overview

A web-based implementation of the popular Monopoly Deal card game, allowing two players to play against each other in the same browser window or in separate tabs.

## Core Requirements

### Game Mechanics

- Implement the full 106-card deck from the Monopoly Deal game
- Support 2-player turn-based gameplay
- Deal 5 cards initially to each player
- Allow players to draw 2 cards at the start of their turn
- Allow playing up to 3 cards per turn
- Support all card types:
  - Property cards (can be played as properties or money)
  - Money cards
  - Action cards (rent, deal breaker, forced deal, etc.)
- Implement property sets and winning condition (3 complete property sets of different colors)

### User Interface

- Clear visual representation of game state
- Hand management for both players
- Property set management
- Money pile management
- Draw and discard piles
- Game history log
- Turn status indicators
- Win condition checking

### Technical Features

- Client-side JavaScript implementation
- No server required (local play)
- Cross-browser tab synchronization using localStorage
- Support for playing from both Player 1 and Player 2 perspectives
- Responsive design for different screen sizes

## Project Scope

This project aims to provide a functional digital version of the Monopoly Deal card game for local play. It does not include features such as:

- Online multiplayer with separate players on different devices
- AI opponents
- Game saving/loading (beyond browser tab synchronization)
- Custom card creation

## Success Criteria

- Players can start a new game and play to completion
- All card types function according to the official rules
- Game correctly identifies winning conditions
- UI clearly represents all game elements
- Game state correctly synchronizes between browser tabs
- Players can play from either perspective
