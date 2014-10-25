/*

  Strategies for the hero are contained within the "moves" object as
  name-value pairs, like so:

    //...
    ambusher : function(gamedData, helpers){
      // implementation of strategy.
    },
    heWhoLivesToFightAnotherDay: function(gamedData, helpers){
      // implementation of strategy.
    },
    //...other strategy definitions.

  The "moves" object only contains the data, but in order for a specific
  strategy to be implemented we MUST set the "move" variable to a
  definite property.  This is done like so:

  move = moves.heWhoLivesToFightAnotherDay;

  You MUST also export the move function, in order for your code to run
  So, at the bottom of this code, keep the line that says:

  module.exports = move;

  The "move" function must return "North", "South", "East", "West", or "Stay"
  (Anything else will be interpreted by the game as "Stay")

  The "move" function should accept two arguments that the website will be
  passing in:
    - a "gameData" object which holds all information about the current state
      of the battle

    - a "helpers" object, which contains useful helper functions
      - check out the helpers.js file to see what is available to you

    (the details of these objects can be found on javascriptbattle.com/#rules)

  Such is the power of Javascript!!!

*/

// Strategy definitions
var moves = {
  // Aggressor
  aggressor: function(gameData, helpers) {
    // Here, we ask if your hero's health is below 30
    if (gameData.activeHero.health <= 30){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go attack someone...anyone.
      return helpers.findNearestEnemy(gameData);
    }
  },

  // Health Nut
  healthNut:  function(gameData, helpers) {
    // Here, we ask if your hero's health is below 75
    if (gameData.activeHero.health <= 75){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go mine some diamonds!!!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // Balanced
  balanced: function(gameData, helpers){
    //FIXME : fix;
    return null;
  },

  // The "Northerner"
  // This hero will walk North.  Always.
  northener : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    return 'North';
  },

  // The "Blind Man"
  // This hero will walk in a random direction each turn.
  blindMan : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    var choices = ['North', 'South', 'East', 'West'];
    return choices[Math.floor(Math.random()*4)];
  },

  // The "Priest"
  // This hero will heal nearby friendly champions.
  priest : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 60) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestTeamMember(gameData);
    }
  },

  // The "Unwise Assassin"
  // This hero will attempt to kill the closest enemy hero. No matter what.
  unwiseAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 30) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestEnemy(gameData);
    }
  },

  // The "Careful Assassin"
  // This hero will attempt to kill the closest weaker enemy hero.
  carefulAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 50) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestWeakerEnemy(gameData);
    }
  },

  // The "Safe Diamond Miner"
  // This hero will attempt to capture enemy diamond mines.
  safeDiamondMiner : function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });
    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // The "Selfish Diamond Miner"
  // This hero will attempt to capture diamond mines (even those owned by teammates).
  selfishDiamondMiner :function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });

    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestUnownedDiamondMine(gameData);
    }
  },

  // The "Coward"
  // This hero will try really hard not to die.
  coward : function(gameData, helpers) {
    return helpers.findNearestHealthWell(gameData);
  },

  // Andrew MacFie custom strategy 
  custom : function (gameData, helpers) {
    // health threshold for running to a well
    var minHealth = 76,
    // distance for counting "nearby" enemies
        enemyDist = 2;

    var hero = gameData.activeHero,
        board = gameData.board;
    var dft = hero.distanceFromTop;
    var dfl = hero.distanceFromLeft;
    var directions = ['North', 'East', 'South', 'West'];

    // there are adjacent enemies
    var adjEnemies = false,
    // the health of the weakest adjacent enemy
        weakestHealth = Number.POSITIVE_INFINITY,
    // the direction to the weakest adjacent enemy
        weakestDir = null;

    // there is an adjacent well
    var adjWell = false,
    // the direction to any adjacent well
        wellDir = null;

    // compute adjEnemies, weakestHealth, weakestDir, adjWell, wellDir
    directions.forEach(function (direction) {
      var nextTile = helpers.getTileNearby(board, dft, dfl, direction);
      if (nextTile && nextTile.type === 'Hero' && nextTile.team !== hero.team) {
        adjEnemies = true;
        if (!weakestDir || nextTile.health < weakestHealth) {
          weakestHealth = nextTile.health;
          weakestDir = direction;
        }
      }

      if (nextTile && nextTile.type === 'HealthWell') {
        adjWell = true;
        wellDir = direction;
      }
    });

    // if adjacent enemies
    if (adjEnemies) {
      // if there's a well nearby, I can't kill anyone this turn, and I need
      // health
      if (adjWell && weakestHealth > 30 && hero.health <= 70) {
        // go to the well
        return wellDir;
      } else {
        // attack the weakest enemy
        return weakestDir;
      }
    }

    // if health < minHealth
    //   go to closest well with minimal nearby enemies
    var wellPathDir = helpers.findNearestTileWithMinEnemies(
      gameData, 
      hero, 
      enemyDist,
      function (searchTile) {
        return searchTile.type === 'HealthWell';
      }
    );
    if (hero.health < minHealth) {
      return wellPathDir;
    }
    
    // dir to closest uncapped mine with minimal nearby enemies
    var minePathDir = helpers.findNearestTileWithMinEnemies(
      gameData, 
      hero, 
      enemyDist,
      function (searchTile) {
        if (searchTile.type === 'DiamondMine') {
          if (searchTile.owner) {
            return searchTile.owner.team !== hero.team;
          } else {
            return true;
          }
        } else {
          return false;
        }
      }
    );

    // if there's a mine to go to
    if (minePathDir) {
      // go to the mine
      return minePathDir;
    } else {
      // go to a well
      return wellPathDir;
    }
  }

 };

//  Set our hero's strategy
var move = moves.custom;

// Export the move function here
module.exports = move;

