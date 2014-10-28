var helpers = {};

// Returns false if the given coordinates are out of range
helpers.validCoordinates = function(board, distanceFromTop, distanceFromLeft) {
  return (!(distanceFromTop < 0 || distanceFromLeft < 0 ||
    distanceFromTop > board.lengthOfSide - 1 || 
    distanceFromLeft > board.lengthOfSide - 1));
};

// Returns the tile [direction] (North, South, East, or West) of the given X/Y
// coordinate
helpers.getTileNearby = function(board, distanceFromTop, distanceFromLeft, 
    direction) {

  // These are the X/Y coordinates
  var fromTopNew = distanceFromTop;
  var fromLeftNew = distanceFromLeft;

  // This associates the cardinal directions with an X or Y coordinate
  if (direction === 'North') {
    fromTopNew -= 1;
  } else if (direction === 'East') {
    fromLeftNew += 1;
  } else if (direction === 'South') {
    fromTopNew += 1;
  } else if (direction === 'West') {
    fromLeftNew -= 1;
  } else {
    return false;
  }

  // If the coordinates of the tile nearby are valid, return the tile object at
  // those coordinates
  if (helpers.validCoordinates(board, fromTopNew, fromLeftNew)) {
    return board.tiles[fromTopNew][fromLeftNew];
  } else {
    return false;
  }
};

// Returns an object with certain properties of the nearest object we are
// looking for
helpers.findNearestObjectDirectionAndDistance = function(board, fromTile, 
    tileCallback) {

  // Storage queue to keep track of places the fromTile has been
  var queue = [];

  //Keeps track of places the fromTile has been for constant time lookup later
  var visited = {};

  // Variable assignments for fromTile's coordinates
  var dft = fromTile.distanceFromTop;
  var dfl = fromTile.distanceFromLeft;

  // Stores the coordinates, the direction fromTile is coming from, and its
  // location
  var visitInfo = [dft, dfl, 'None', 'START'];

  //Just a unique way of storing each location we've visited
  visited[dft + '|' + dfl] = true;

  // Push the starting tile on to the queue
  queue.push(visitInfo);

  // While the queue has a length
  while (queue.length > 0) {

    // Shift off first item in queue
    var coords = queue.shift();

    // Reset the coordinates to the shifted object's coordinates
    dft = coords[0];
    dfl = coords[1];

    // Loop through cardinal directions
    var directions = ['North', 'East', 'South', 'West'];
    for (var i = 0; i < directions.length; i++) {

      // For each of the cardinal directions get the next tile...
      var direction = directions[i];

      // ...Use the getTileNearby helper method to do this
      var nextTile = helpers.getTileNearby(board, dft, dfl, direction);

      // If nextTile is a valid location to move...
      if (nextTile) {

        // Assign a key variable the nextTile's coordinates to put into our
          // visited object later
        var key = nextTile.distanceFromTop + '|' + nextTile.distanceFromLeft;

        var isGoalTile = false;
        try {
          isGoalTile = tileCallback(nextTile);
        } catch(err) {
          isGoalTile = false;
        }

        // If we have visited this tile before
        if (visited.hasOwnProperty(key)) {

          //Do nothing--this tile has already been visited

        //Is this tile the one we want?
        } else if (isGoalTile) {

          // This variable will eventually hold the first direction we went on
          // this path
          var correctDirection = direction;

          // This is the distance away from the final destination that will be
          // incremented in a bit
          var distance = 1;

          // These are the coordinates of our target tileType
          var finalCoords = [nextTile.distanceFromTop, nextTile.distanceFromLeft];

          // Loop back through path until we get to the start
          while (coords[3] !== 'START') {

            // Haven't found the start yet, so go to previous location
            correctDirection = coords[2];

            // We also need to increment the distance
            distance++;

            // And update the coords of our current path
            coords = coords[3];
          }

          //Return object with the following pertinent info
          var goalTile = nextTile;
          goalTile.direction = correctDirection;
          goalTile.distance = distance;
          goalTile.coords = finalCoords;
          return goalTile;

          // If the tile is unoccupied, then we need to push it into our queue
        } else if (nextTile.type === 'Unoccupied') {

          queue.push([nextTile.distanceFromTop, nextTile.distanceFromLeft, direction, coords]);

          // Give the visited object another key with the value we stored earlier
          visited[key] = true;
        }
      }
    }
  }

  // If we are blocked and there is no way to get where we want to go, return
  // false
  return false;
};

// Returns the direction of the nearest non-team diamond mine or false, if
// there are no diamond mines
helpers.findNearestNonTeamDiamondMine = function(gameData) {
  var hero = gameData.activeHero;
  var board = gameData.board;

  //Get the path info object
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(board, 
    hero, function(mineTile) {

    if (mineTile.type === 'DiamondMine') {
      if (mineTile.owner) {
        return mineTile.owner.team !== hero.team;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }, board);

  //Return the direction that needs to be taken to achieve the goal
  return pathInfoObject.direction;
};

// Returns the direction of the tile
helpers.findTile = function(gameData, tile) {
  var hero = gameData.activeHero,
      board = gameData.board;
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(
    board,
    hero,
    function (searchTile) {
      return searchTile === tile;
    }
  );
  return pathInfoObject.direction;
};

// Returns the nearest unowned diamond mine or false, if there are no diamond
// mines
helpers.findNearestUnownedDiamondMine = function(gameData) {
  var hero = gameData.activeHero;
  var board = gameData.board;

  //Get the path info object
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(
    board, 
    hero, 
    function(mineTile) {
      if (mineTile.type === 'DiamondMine') {
        if (mineTile.owner) {
          return mineTile.owner.id !== hero.id;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  );

  //Return the direction that needs to be taken to achieve the goal
  return pathInfoObject.direction;
};

// Returns the nearest health well or false, if there are no health wells
helpers.findNearestHealthWell = function (gameData) {
  var hero = gameData.activeHero;
  var board = gameData.board;

  //Get the path info object
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(
    board, 
    hero, 
    function (healthWellTile) {
      return healthWellTile.type === 'HealthWell';
    }
  );

  //Return the direction that needs to be taken to achieve the goal
  return pathInfoObject.direction;
};

// Returns the direction of the nearest enemy with lower health
// (or returns false if there are no accessible enemies that fit this
// description)
helpers.findNearestWeakerEnemy = function(gameData) {
  var hero = gameData.activeHero;
  var board = gameData.board;

  //Get the path info object
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(
    board, 
    hero, 
    function (enemyTile) {
    return enemyTile.type === 'Hero' && enemyTile.team !== hero.team && 
      enemyTile.health < hero.health;
    }
  );

  //Return the direction that needs to be taken to achieve the goal
  //If no weaker enemy exists, will simply return undefined, which will
  //be interpreted as "Stay" by the game object
  return pathInfoObject.direction;
};

// Returns the direction of the nearest enemy
// (or returns false if there are no accessible enemies)
helpers.findNearestEnemy = function(gameData) {
  var hero = gameData.activeHero;
  var board = gameData.board;

  //Get the path info object
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(
      board, hero, function (enemyTile) {
        return enemyTile.type === 'Hero' && enemyTile.team !== hero.team;
      }
  );

  //Return the direction that needs to be taken to achieve the goal
  return pathInfoObject.direction;
};

// Returns the direction of the nearest friendly champion
// (or returns false if there are no accessible friendly champions)
helpers.findNearestTeamMember = function(gameData) {
  var hero = gameData.activeHero;
  var board = gameData.board;

  //Get the path info object
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(
    board, 
    hero, 
    function(heroTile) {
      return heroTile.type === 'Hero' && heroTile.team === hero.team;
    }
  );

  //Return the direction that needs to be taken to achieve the goal
  return pathInfoObject.direction;
};

helpers.numNearbyAllies = function (gameData, origin, maxMDist) {
  var board = gameData.board;
  return helpers.tilesInManhattanCircle(board, origin, maxMDist).filter(
    function (t) {
      return helpers.allyB(gameData, t);
    }
  ).length;
};

helpers.numNearbyEnemies = function (gameData, origin, maxMDist) {
  var board = gameData.board;
  return helpers.tilesInManhattanCircle(board, origin, maxMDist).filter(
    function (t) {
      return helpers.enemyB(gameData, t);
    }
  ).length;
};

// maxMDist is the max m-distance an enemy can be from a tile to be "nearby" to it
helpers.findNearestTileWithMinEnemies = function (gameData, maxMDist, 
  selector) {
  var hero = gameData.activeHero,
      board = gameData.board;
  // the minimum number of enemies nearby a selected tile
  var minEnemies = Number.POSITIVE_INFINITY;
  var candidateTiles = [];

  // for each pair of coordinates i,j
  for (var i = 0; i < board.lengthOfSide; ++i) {
    for (var j = 0; j < board.lengthOfSide; ++j) {
      var tile = board.tiles[i][j];
      if (!selector(tile)) {
        continue;
      }
      // the number of enemies nearby to tile
      var numEnemies = helpers.numNearbyEnemies(gameData, tile, maxMDist);
      if (numEnemies === minEnemies) {
        candidateTiles.push(tile);
      } else if (numEnemies < minEnemies) {
        minEnemies = numEnemies;
        candidateTiles = [tile];
      }
    }
  }

  // the path to the nearest tile in candidateTiles
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(
    board, 
    hero, 
    // searchTile is in candidateTiles
    function (t) {
      return candidateTiles.indexOf(t) >= 0;
    }
  );

  return pathInfoObject.direction;
};

helpers.tilesInManhattanCircle = function (board, center, radius) {
  var dft = center.distanceFromTop,
      dfl = center.distanceFromLeft;
  var ret = [];
  for (var i = dft - radius; i <= dft + radius; ++i) {
    for (var j = dfl - radius; j <= dft + radius; ++j) {
      if (Math.abs(i - dft) + Math.abs(j - dfl) > radius) {
        continue;
      }
      if (!helpers.validCoordinates(board, i, j)) {
        continue;
      }
      ret.push(board.tiles[i][j]);
    }
  }
  return ret;
};

helpers.tilesOnManhattanCircle = function (board, center, radius) {
  return helpers.diff(
      helpers.tilesInManhattanCircle(board, center, radius),
      helpers.tilesInManhattanCircle(board, center, radius - 1)
  );
};

helpers.tilesInPathCircle = function(board, centerTile, radius) {
  var ret = [];
  if (radius < 0) {
    return ret;
  }

  // Storage queue to keep track of places the centerTile has been
  var queue = [];

  // Keeps track of places the centerTile has been for constant time lookup
  // later
  var visited = {};

  // Variable assignments for centerTile's coordinates
  var dft = centerTile.distanceFromTop;
  var dfl = centerTile.distanceFromLeft;

  // Stores the coordinates and distance
  var nodeInfo = [dft, dfl, 0];

  ret.push(centerTile);
  if (radius === 0) {
    return ret;
  }

  //Just a unique way of storing each location we've visited
  visited[dft + '|' + dfl] = true;
  // Push the starting tile on to the queue
  queue.push(nodeInfo);

  while (queue.length > 0) {

    // Shift off first item in queue
    // The distance to this node is < radius
    nodeInfo = queue.shift();

    // Reset the coordinates to the shifted object's coordinates
    dft = nodeInfo[0];
    dfl = nodeInfo[1];

    // Loop through cardinal directions
    var directions = ['North', 'East', 'South', 'West'];
    for (var i = 0; i < directions.length; i++) {

      // For each of the cardinal directions get the next tile...
      var direction = directions[i];

      var distance = nodeInfo[2] + 1;

      // ...Use the getTileNearby helper method to do this
      var nextTile = helpers.getTileNearby(board, dft, dfl, direction);

      // If nextTile is a valid location to move...
      if (nextTile) {

        // Assign a key variable the nextTile's coordinates to put into our
        // visited object later
        var key = nextTile.distanceFromTop + '|' + nextTile.distanceFromLeft;

        // If we have visited this tile before
        if (visited.hasOwnProperty(key)) {

          //Do nothing--this tile has already been visited

        // if the tile is occupied, add it to ret
        } else if (nextTile.type !== 'Unoccupied') {

          ret.push(nextTile);
          // Give the visited object another key with the value we stored
          // earlier
          visited[key] = true;

          // If the tile is unoccupied, then we need to push it into our queue
        } else if (nextTile.type === 'Unoccupied') {
          if (distance < radius) {
            queue.push([nextTile.distanceFromTop, nextTile.distanceFromLeft, 
                       distance]);
          }

          ret.push(nextTile);
          // Give the visited object another key with the value we stored
          // earlier
          visited[key] = true;
        }
      }
    }
  }

  return ret;
};

helpers.tilesOnPathCircle = function(board, center, radius) {
  return helpers.diff(
    helpers.tilesInPathCircle(board, center, radius),
    helpers.tilesInPathCircle(board, center, radius - 1)
  );
};

// http://underscorejs.org/#intersection
helpers.intersect = function (a, b) {
    return a.filter(function (e) {
        if (b.indexOf(e) !== -1) {
          return true;
        } else {
          return false;
        }
    });
};
// http://underscorejs.org/#difference
helpers.diff = function (a, b) {
    return a.filter(function (e) {
        if (b.indexOf(e) === -1) {
          return true;
        } else {
          return false;
        }
    });
};
// http://underscorejs.org/#min
helpers.min = function (list, iteratee) {
  var minEl = null,
    minVal = Number.POSITIVE_INFINITY;
  for (var i=0; i < list.length; ++i) {
    var el = list[i],
      val = iteratee(el);
    if (val < minVal) {
      minVal = val;
      minEl = el;
    }
  }
  return minEl;
};

helpers.allyB = function (gameData, t) {
  var hero = gameData.activeHero;
  return t.type === 'Hero' && t.team === hero.team;
};

helpers.enemyB = function (gameData, t) {
  var hero = gameData.activeHero;
  return t.type === 'Hero' && t.team !== hero.team;
};

helpers.wellB = function (gameData, t) {
  return t.type === 'HealthWell';
};

helpers.nonTeamMineB = function (gameData, t) {
  var hero = gameData.activeHero;

  if (t.type === 'DiamondMine') {
    if (t.owner) {
      return t.owner.team !== hero.team;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

helpers.vulnerableEnemyB = function (gameData, tile) {
  var hero = gameData.activeHero,
      board = gameData.board;

  if (!helpers.enemyB(gameData, tile)) {
    return false;
  } 

  // no nearby well
  var nearbyWellB = helpers.tilesInPathCircle(board, tile, 2).some(
    function (t) { 
      return helpers.wellB(gameData, t); 
    }
  );
  if (nearbyWellB) {
    return false;
  }

  // no other nearby enemies  
  var nearbyEnemies = helpers.intersect(
    helpers.tilesInPathCircle(board, hero, 2).filter(function (t) {
      return helpers.enemyB(gameData, t);
    }),
    helpers.tilesInPathCircle(board, tile, 2).filter(function (t) {
      return helpers.enemyB(gameData, t);
    })
  );
  if (nearbyEnemies.length > 1) {
    return false;
  }

  if (tile.health <= hero.health - 20) {
    return true;
  } else {
    return false;
  }

};

module.exports = helpers;

