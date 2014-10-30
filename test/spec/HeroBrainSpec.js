// (run this file with mocha)
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('Hero file', function () {
  'use strict';
  var move; 

  beforeEach(function() {
    move = require('../../hero.js');
  });

  it('exists and exports a move function', function () {
    move.should.be.a('function');
  });


});
describe('Helper file', function () {
  'use strict';
  var helpers;
  var Game;

  beforeEach(function() {
    helpers = require('../../helpers.js');
    Game = require('../../game_logic/Game.js');
  });

  it('exists and exports a helper object', function () {
    helpers.should.be.a('object');
  });

  describe('#tilesOnManhattanCircle()', function () {
    it('returns 4 tiles when in the middle of a 9x9 board', function () {
      var game = new Game(9);
      game.addHero(4, 4, 'MyHero', 0);
      expect(helpers.tilesOnManhattanCircle(
        game.board, 
        game.activeHero, 
        1
      ).length).equal(4);
    });
    it('returns 2 tiles when in the corner of a 9x9 board', function () {
      var game = new Game(9);
      game.addHero(0, 0, 'MyHero', 0);
      expect(helpers.tilesOnManhattanCircle(
        game.board, 
        game.activeHero, 
        1
      ).length).equal(2);
    });
  });

  describe('#tilesInManhattanCircle()', function () {
    it('returns 5 tiles when in the middle of a 9x9 board', function () {
      var game = new Game(9);
      game.addHero(4, 4, 'MyHero', 0);
      expect(helpers.tilesInManhattanCircle(
        game.board, 
        game.activeHero, 
        1
      ).length).equal(5);
    });
    it('returns 3 tiles when in the corner of a 9x9 board', function () {
      var game = new Game(9);
      game.addHero(0, 0, 'MyHero', 0);
      expect(helpers.tilesInManhattanCircle(
        game.board, 
        game.activeHero, 
        1
      ).length).equal(3);
    });
  });
});

