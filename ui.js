// UI helper functions for Monopoly Deal
console.log('UI.js loading...');

// Ensure MonopolyDeal namespace exists
window.MonopolyDeal = window.MonopolyDeal || {};

// Update all UI elements for a player
window.MonopolyDeal.updatePlayerUI = function(playerNumber) {
  console.log(`Updating all UI elements for player ${playerNumber}...`);
  
  // Update all aspects of the player's UI
  window.MonopolyDeal.updatePlayerHandUI(playerNumber);
  window.MonopolyDeal.updatePlayerMoneyUI(playerNumber);
  window.MonopolyDeal.updatePlayerPropertiesUI(playerNumber);
};

// Export functions
window.MonopolyDeal.updatePlayerUI = window.MonopolyDeal.updatePlayerUI;

console.log('UI.js loaded successfully!'); 