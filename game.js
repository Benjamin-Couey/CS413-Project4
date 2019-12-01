// -------------------- Define Constants --------------------

// Keycodes
const WKEY = 87;
const AKEY = 65;
const SKEY = 83;
const DKEY = 68;
const HKEY = 72;
const JKEY = 74;
const KKEY = 75;
const LKEY = 76;


var GAME_WIDTH = 400;
var GAME_HEIGHT = 400;
var GAME_SCALE = 1;

var TITLE = 0;
var HELP = 1;
var GAME = 2;
var OVER = 3;

var PLAYERSPEED = 5;

// -------------------- Main code --------------------

// ---------- Define global variables
var fps = 60;

// The game's state which will track which screen the game is one as well as
// determine which functions are run during the game loop
var gameState;

// Global variables to track which key(s) are being pressed
var wDown = false;
var aDown = false;
var sDown = false;
var dDown = false;

// var hDown = false;
// var jDown = false;
// var kDown = false;
// var lDown = false;

// global arrays to store references to game Objects
// these will be filled, emptied, and modified as new screens are loaded
var player;

var beatCounter;

var snakes = [];
var cobras = [];
var spits = [];

// A reference to the Tile Utilities
var tu;

// A reference to the tile world that will be used by several functions
var world;

// A reference to the map state
var mapState = "Map0";

// A reference to a layer for entites
var entity_layer;

// A reference to the collidable objects in the world
var collidableArray;

// A reference to the spritesheet
var sheet;

// The current time, used for particles
var elapsed = Date.now();
var songOfSleepEmitter;



// ---------- PIXI.js boiler plate code
var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer({width: GAME_WIDTH, height: GAME_HEIGHT,
                                        backgroundColor: 0xa66407});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();



// -------------------- Main PIXI Containers --------------------
// Create the main states of the game and add them to the stage

console.log("Start container definition");

// ---------- Start screen
var title = new PIXI.Container();
stage.addChild(title);

// Create title screen sprite
var titleSprite = new PIXI.Sprite( PIXI.Texture.fromFrame("GameTitle.png") );
titleSprite.anchor.set(0.5);
titleSprite.position.x = GAME_WIDTH / 2;
titleSprite.position.y = GAME_HEIGHT / 2;

title.addChild(titleSprite);

// ---------- Help screen
var help = new PIXI.Container();
help.visible = false;
stage.addChild(help);

// ---------- Main game screen
var game = new PIXI.Container();
game.visible = false;
stage.addChild(game);

// Create help screen sprite
var helpSprite = new PIXI.Sprite( PIXI.Texture.fromFrame("GameHelp.png") );
helpSprite.anchor.set(0.5);
helpSprite.position.x = GAME_WIDTH / 2;
helpSprite.position.y = GAME_HEIGHT / 2;

// Clicking on the help page should return user to the title screen.
// Enable and attatch mouse handler
helpSprite.interactive = true;
helpSprite.on('click', loadTitle );

help.addChild(helpSprite);

// ---------- Game over screen
var gameover = new PIXI.Container();
gameover.visible = false;
stage.addChild(gameover);

// Create gameover screen sprite
var gameoverSprite = new PIXI.Sprite( PIXI.Texture.fromFrame("GameOver.png") );
gameoverSprite.anchor.set(0.5);
gameoverSprite.position.x = GAME_WIDTH / 2;
gameoverSprite.position.y = GAME_HEIGHT / 2;

// Clicking on the game over page should return user to the title screen.
// Enable and attatch mouse handler
gameoverSprite.interactive = true;
gameoverSprite.on('click', loadTitle );

gameover.addChild(gameoverSprite);

console.log("Finish container definition");



// -------------------- Initialization --------------------

console.log("Start initialization");

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Load sprite sheet with all game's sprites
PIXI.loader.add("Assets.json")
            .add("map.json")
            .add("map2.json")
            .add("tileset.png")
            .load( initializeSprites );

// Create the sprites that will be used in every biome
// The large title, help, and game over screen sprites are bigger than this whole
// sheet and so are loaded seperately.
function initializeSprites()
{
  // Initialize tile utilities
  tu = new TileUtilities( PIXI );

  console.log( tu );

  //Get a reference to the tile map and add it to the stage
  world = tu.makeTiledWorld("map.json", "tileset.png");

  console.log( world );

  console.log("World parameters");
  console.log( world.tilewidth );
  console.log( world.tileheight );
  console.log( world.widthInTiles );
  game.addChild(world);

  // Get a reference to the spritesheet
  sheet = PIXI.loader.resources["Assets.json"];

  // Get a reference to the map's entity layer
  entity_layer = world.getObject("Entities");

  // Create the player
  player = new player();

  // Add player to map's entity layer
  entity_layer.addChild(player.sprite);
  entity_layer.addChild(player.playerBody);
  game.addChild(player.beatMarker);

  // Add enemies to map's entity layer
  snakeInit();
  cobraInit();

  //Add in the collidable objects to our collision array
  collidableArray = world.getObject("WallsLayer").data;




  // Initialize emitters
  songOfSleepEmitter = new PIXI.particles.Emitter(
    // Container the emitter will be put in
    entity_layer,

    // The collection of particle images
    [ sheet.textures["8thnote.png"],
      sheet.textures["8thnotes.png"] ],

    // Emitter configuration
    {
	  "alpha": {
		  "start": 1,
		  "end": 0
	  },
	  "scale": {
		  "start": 3,
		  "end": 1.2,
		  "minimumScaleMultiplier": 1
	  },
	  "color": {
      "start": "#dcdcdc",
      "end": "#dcdcdc"
	  },
	  "speed": {
      "start": 400,
      "end": 0,
      "minimumSpeedMultiplier": 1
	  },
	  "acceleration": {
		  "x": 0,
		  "y": 0
	  },
	  "startRotation": {
		  "min": 0,
		  "max": 360
	  },
	  "rotationSpeed": {
		  "min": 0,
		  "max": 0
	  },
	  "lifetime": {
		  "min": 0.5,
		  "max": 1
	  },
	  "blendMode": "normal",
	  "frequency": 0.002,
	  "emitterLifetime": -1,
	  "maxParticles": 25,
	  "pos": {
		  "x": 0,
		  "y": 0
	  },
	  "addAtBack": false,
	  "spawnType": "point"
    } );





  // Create and add the buttons for the title screen
  // NOTE: This has to be done in this function because in the future those buttons
  // will be part of a spritesheet that is loaded along with the map and tileset.
  // Add game title to the title screen
  var titleText = new PIXI.Sprite( sheet.textures["Title.png"] );
  titleText.anchor.set(0.5);
  titleText.position.x = GAME_WIDTH / 2;
  titleText.position.y = GAME_HEIGHT * 0.1;

  title.addChild( titleText );

  // Add buttons to the title screen
  var startButton = new PIXI.Sprite( sheet.textures["StartButton.png"] );
  startButton.anchor.set(0.5);
  startButton.position.x = GAME_WIDTH / 2;
  startButton.position.y = GAME_HEIGHT * 0.3;

  // Enable and attatch mouse handler
  startButton.interactive = true;
  startButton.buttonMode = true;

  startButton.on('click', loadGame );

  title.addChild( startButton );

  var helpButton = new PIXI.Sprite( sheet.textures["HelpButton.png"] );
  helpButton.anchor.set(0.5);
  helpButton.position.x = GAME_WIDTH / 2;
  helpButton.position.y = GAME_HEIGHT * 0.4;

  // Enable and attatch mouse handler
  helpButton.interactive = true;
  helpButton.buttonMode = true;

  helpButton.on('click', loadHelp );

  title.addChild(helpButton);

    // Background Sound
    PIXI.sound.Sound.from({
        url: "Assets/backgroundmusic.wav",
        preload: true,
        autoPlay: true,
        loop: true,
        volume: 0.03,
    });

  //Start our game loop
  gameLoop();
}

//songOfSleepEmitter.emit = true;

// -------------------- Main game loop --------------------
function gameLoop()
{
  setTimeout( function()
  {
    requestAnimationFrame(gameLoop);

    if( gameState == GAME )
    {
      movePlayer();
      playerRhythm();
      moveSnakes();
      moveCobras();
      moveSpit();
      update_camera();
      handleCollision();
      boundObjects();

      // Update emitters
      var now = Date.now();
      songOfSleepEmitter.update((now - elapsed) * 0.001 );
      elapsed = now;
      // songOfSleepEmitter should only play once
      songOfSleepEmitter.emit = false;
    }

    renderer.render(stage);
  }, 1000 / fps );
}
