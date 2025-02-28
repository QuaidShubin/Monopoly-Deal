// Monopoly Deal Game Loader - Helper for when main scripts fail
console.log('Loading gameLoader.js...');

// Initialize the MonopolyDeal namespace if it doesn't exist
window.MonopolyDeal = window.MonopolyDeal || {};

// Game Loader functionality
window.MonopolyDeal.GameLoader = {
    // Check if necessary functions exist
    checkFunctions: function() {
        console.log('GameLoader: Checking if necessary functions exist');
        
        const requiredFunctions = [
            'initializeDeck',
            'getMoneyColor',
            'getCardById',
            'canPlayCard',
            'updateMoneyPilesUI'
        ];
        
        const missing = [];
        
        requiredFunctions.forEach(func => {
            if (typeof window.MonopolyDeal[func] !== 'function') {
                missing.push(func);
                console.warn(`Missing function: ${func}`);
            }
        });
        
        return { missing, allAvailable: missing.length === 0 };
    },
    
    // Fallbacks for critical functions
    fallbacks: {
        // Fallback to initialize deck
        initializeDeck: function() {
            console.log('GameLoader: Using fallback initializeDeck');
            const deck = [];
            
            // Simple fallback with minimal cards
            // Money cards
            for (let i = 0; i < 6; i++) deck.push({ type: 'money', value: 1, id: `money_1_${i}` });
            for (let i = 0; i < 5; i++) deck.push({ type: 'money', value: 2, id: `money_2_${i}` });
            for (let i = 0; i < 3; i++) deck.push({ type: 'money', value: 3, id: `money_3_${i}` });
            
            return deck;
        },
        
        // Fallback for getting money color
        getMoneyColor: function(value) {
            const colors = {
                1: '#90caf9',
                2: '#a5d6a7',
                3: '#ffcc80',
                4: '#ce93d8',
                5: '#ef9a9a',
                10: '#fff59d'
            };
            return colors[value] || '#e0e0e0';
        },
        
        // Fallback for getting card by ID
        getCardById: function(cardId) {
            const deck = this.initializeDeck();
            return deck.find(card => card.id === cardId);
        },
        
        // Fallback for checking if a card can be played
        canPlayCard: function(card, gameState, playerIndex) {
            if (!gameState.started) {
                return { valid: false, message: 'Game has not started' };
            }
            if (gameState.currentPlayer !== playerIndex) {
                return { valid: false, message: 'Not your turn' };
            }
            return { valid: true, message: 'Card can be played' };
        },
        
        // Fallback for updating money piles UI
        updateMoneyPilesUI: function(playerNumber) {
            const moneyPilesContainer = document.getElementById(`player${playerNumber}MoneyPiles`);
            if (!moneyPilesContainer) return;
            
            moneyPilesContainer.innerHTML = '';
            const player = window.MonopolyDeal.gameState.players[playerNumber];
            
            Object.entries(player.moneyPiles).forEach(([value, count]) => {
                if (count > 0) {
                    const pileElement = document.createElement('div');
                    pileElement.className = 'money-pile';
                    pileElement.style.backgroundColor = this.getMoneyColor(parseInt(value));
                    pileElement.innerHTML = `
                        <span class="money-value">$${value}M</span>
                        <span class="money-count">x${count}</span>
                    `;
                    moneyPilesContainer.appendChild(pileElement);
                }
            });
        }
    },
    
    // Install fallbacks for missing functions
    installFallbacks: function() {
        console.log('GameLoader: Checking for missing functions and installing fallbacks if needed');
        const { missing } = this.checkFunctions();
        
        missing.forEach(funcName => {
            if (this.fallbacks[funcName]) {
                console.log(`GameLoader: Installing fallback for ${funcName}`);
                window.MonopolyDeal[funcName] = this.fallbacks[funcName].bind(this.fallbacks);
            }
        });
    }
};

// Wait for DOM and other scripts to load, then check and install fallbacks if needed
setTimeout(() => {
    console.log('GameLoader: Checking for missing functions and installing fallbacks if needed');
    window.MonopolyDeal.GameLoader.installFallbacks();
}, 1000);

console.log('gameLoader.js loaded successfully!'); 