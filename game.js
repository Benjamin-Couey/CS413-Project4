// -------------------- Define Constants --------------------

// Keycodes
const WKEY = 87;
const AKEY = 65;
const SKEY = 83;
const DKEY = 68;
const SPACE = 32;
const SHIFT = 16;

var GAME_WIDTH = 400;
var GAME_HEIGHT = 400;
var GAME_SCALE = 1;

var TITLE = 0;
var HELP = 1;
var GAME = 2;

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

// global arrays to store references to game Objects
// these will be filled, emptied, and modified as new screens are loaded
var player;

var snakes = [];

// A reference to the Tile Utilities
var tu;

// A reference to the tile world that will be used by several functions
var world;

// A reference to a layer for entites
var entity_layer;

// A reference to the collidable objects in the world
var collidableArray;

// A reference to the spritesheet
var sheet;



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

  //Get a reference to the tile map and add it to the stage
  world = tu.makeTiledWorld("map.json", "tileset.png");

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
  player = new playerInit();

  // Add player to map's entity layer
  entity_layer.addChild(player.sprite);
  entity_layer.addChild(player.playerBody);

  snakeInit();

  //Add in the collidable objects to our collision array
  collidableArray = world.getObject("WallsLayer").data;

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

// -------------------- Objects --------------------

function playerInit()
{
  // Get a reference to the player object in the entities layer of the map
  var stgPlayer = world.getObject("Player");

  // Create the player's 'hitbox' sprite
  // This sprite will be invisible and will be used to check collision for the
  // player with walls, enemies, etc.
  this.sprite = new PIXI.Sprite( sheet.textures["PlayerBody1.png"] );
  this.sprite.visible = false;

  // Create the player's visible body
  var frames = [];
  for( let index = 1; index < 9; index++ )
  {
    frames.push( sheet.textures["PlayerBody" + index + ".png"] );
  }
  this.playerBody = new PIXI.AnimatedSprite( frames );
  this.playerBody.anchor.set(0.5);
  this.playerBody.animationSpeed = 0.2;

  // Place the player on the map
  this.sprite.x = stgPlayer.x;
  this.sprite.y = stgPlayer.y;

  this.playerBody.x = this.sprite.x + this.sprite.width / 2;
  this.playerBody.y = this.sprite.y + this.sprite.height / 2;

  // Instance variables
  this.vx = 0;
  this.vy = 0;
  this.moving = false;
}

function snakeInit()
{
  // Get an array of references to all the snake objects in the entities layer
  // of the map
  var stgSnake = world.getObjects("Snake");

  // Clear the snakes array
  snakes = [];

  // For each of these references, create a snake object, position it on the
  // map based on the reference, push it to the array, and add it to the entity layer
  for( let index = 0; index < stgSnake.length; index++ )
  {
    // Create the snake
    var newSnake = new snake( stgSnake[index] );

    // Add snake to array for later reference
    snakes.push( newSnake );

    // Add snake's sprite to the map
    entity_layer.addChild( newSnake.sprite );
    entity_layer.addChild( newSnake.snakeBody );
  }
}

function snake( mapPosition )
{
  // Create the snake's 'hitbox' sprite
  // This sprite will be invisible and will be used to check collision for the
  // snake with walls, the player, etc.
  this.sprite = new PIXI.Sprite( sheet.textures["Snake1.png"] );
  this.sprite.visible = false;

  // Create the snake's visible body
  var frames = [];
  for( let index = 1; index < 9; index++ )
  {
    frames.push( sheet.textures["Snake" + index + ".png"] );
  }
  this.snakeBody = new PIXI.AnimatedSprite( frames );
  this.snakeBody.anchor.set(0.5);
  this.snakeBody.animationSpeed = 0.1;
  this.snakeBody.play();

  // Place the snake on the map
  this.sprite.x = mapPosition.x;
  this.sprite.y = mapPosition.y;

  this.snakeBody.x = this.sprite.x + this.sprite.width / 2;
  this.snakeBody.y = this.sprite.y + this.sprite.height / 2;

  this.stateM = StateMachine.create({
    initial: {state: 'patrol', event: 'init'},
    error: function() {},
    events: [
      {name: 'detectPlayer', from: 'patrol', to: 'chase'},
      {name: 'losePlayer', from: 'chase', to: 'patrol'}
    ]
  });
}

// -------------------- Define Functions --------------------

// ---------- Helper functions

// Calculates the distance in pixles between two given points
function distance( x1, y1, x2, y2)
{
  return Math.sqrt( Math.pow( x1 - x2, 2 ) + Math.pow( y1 - y2, 2 ) );
}

// ---------- Screen loading functions
function loadTitle()
{
  console.log("Loading title");
  title.visible = true;
  help.visible = false;
  game.visible = false;
  gameState = TITLE;
}

function loadHelp()
{
  console.log("Loading help");
  title.visible = false;
  help.visible = true;
  game.visible = false;
  gameState = HELP;
}

function loadGame()
{
  console.log("Loading title");
  title.visible = false;
  help.visible = false;
  game.visible = true;
  gameState = GAME;
}

// ---------- Input handlers
function keydownEventHandler(e)
{
  // When a key is pressed, update the appropriate global variable to track
  // the key press
  if (e.keyCode == WKEY) {
    wDown = true;
  }
  if (e.keyCode == SKEY) {
    sDown = true;
  }
  if (e.keyCode == AKEY) {
    aDown = true;
  }
  if (e.keyCode == DKEY) {
    dDown = true;
  }
}

function keyupEventHandler(e)
{
  // When a key is released, update the appropriate global variable to track
  // the key being released
  if (e.keyCode == WKEY) {
    wDown = false;
  }
  if (e.keyCode == SKEY) {
    sDown = false;
  }
  if (e.keyCode == AKEY) {
    aDown = false;
  }
  if (e.keyCode == DKEY) {
    dDown = false;
  }
}

document.addEventListener('keydown', keydownEventHandler);
document.addEventListener('keyup', keyupEventHandler);

// ---------- Main game functions
function movePlayer()
{
  // Vertical axis
    // W key
    if (wDown) {
      player.vy = -1;
    }

    // S key
    else if (sDown) {
    	player.vy = 1;
    }

    else {
      player.vy = 0;
    }

  // Horizontal axis
    // A key
    if (aDown) {
      player.vx = -1;
    }

    // D key
    else if (dDown) {
      player.vx = 1;
    }

    else {
      player.vx = 0;
    }

    // If the player is moving, rotate their body to reflect the direction they are moving
    if( player.vx != 0 || player.vy != 0) {
    player.playerBody.rotation = Math.atan2( ( player.sprite.y + player.vy * PLAYERSPEED ) - player.sprite.y,
                                       ( player.sprite.x + player.vx * PLAYERSPEED ) - player.sprite.x );
    }

    // Actually move the player
    player.sprite.x += player.vx * PLAYERSPEED;
    player.sprite.y += player.vy * PLAYERSPEED;

    // Check if the player collided with a wall
    var collide = tu.hitTestTile(player.sprite, collidableArray, 0, world, "every");

    // If that is the case, reverse the player's movement and stop them from moving
    if( !collide.hit ) {
      player.sprite.x -= player.vx * PLAYERSPEED;
      player.sprite.y -= player.vy * PLAYERSPEED;
      player.vx = 0;
      player.vy = 0;
    }

    player.playerBody.x = player.sprite.x + player.sprite.width / 2;
    player.playerBody.y = player.sprite.y + player.sprite.height / 2;

    // Check if the player is moving, and if so, animate their sprite
    if( player.vx == 0 && player.vy == 0) {
      player.playerBody.stop();
    }
    else {
      player.playerBody.play();
    }

}

function moveSnakes()
{

  var snake;

  for( let index = 0; index < snakes.length; index++ )
  {
    snake = snakes[ index ];

    // Switch based on snake's state
    switch( snake.stateM.current )
    {
      case 'patrol':
        //console.log("Patrolling");
        // Slither forward in the direction the snake is facing
        snake.sprite.x += 2 * Math.cos( snake.snakeBody.rotation );
        snake.sprite.y += 2 * Math.sin( snake.snakeBody.rotation );

        // Check if the snake  collided with a wall
        var collide = tu.hitTestTile(snake.sprite, collidableArray, 0, world, "every");

        // If that is the case, reverse the snake's movement and rotate it
        if( !collide.hit ) {
          snake.sprite.x -= 2 * Math.cos( snake.snakeBody.rotation );
          snake.sprite.y -= 2 * Math.sin( snake.snakeBody.rotation );

          // Rotate the snake 90 degrees
          //snake.snakeBody.rotation += Math.PI / 4

          // A potential different mechanic where the snake rotates randomly when it hits a wall
          snake.snakeBody.rotation += ( Math.PI / 4 + ( Math.random() * Math.PI / 8 ) ) * Math.random() < 0.5 ? -1 : 1;
        }

        snake.snakeBody.x = snake.sprite.x + snake.sprite.width / 2;
        snake.snakeBody.y = snake.sprite.y + snake.sprite.height / 2;

      break;

      case 'chase':
        //console.log("Chasing");
      break;
    }


  }
}



// ---------- Helper functions
function update_camera() {
  stage.x = -player.sprite.x*GAME_SCALE + GAME_WIDTH/2 - player.sprite.width/2*GAME_SCALE;
  stage.y = -player.sprite.y*GAME_SCALE + GAME_HEIGHT/2 + player.sprite.height/2*GAME_SCALE;
  stage.x = -Math.max(0, Math.min(world.worldWidth*GAME_SCALE - GAME_WIDTH, -stage.x));
  stage.y = -Math.max(0, Math.min(world.worldHeight*GAME_SCALE - GAME_HEIGHT, -stage.y));
}

function bound( sprite )
{
  // Given a sprite, make sure that it stays within the bounds of the screen
  // Accounts for the sprites anchor position to keep the entirety of the sprite in bounds
  if( sprite.position.x + sprite.anchor.x * 32 < 0)
  {
    sprite.position.x = sprite.anchor.x * 32;
    changeWorld("map2.json");
  }
  else if( sprite.position.x + sprite.anchor.x * 32 > world.worldWidth )
  {
    sprite.position.x = world.worldWidth - sprite.anchor.x * 32;
    changeWorld("map2.json");
  }
  if( sprite.position.y + sprite.anchor.y * 32 < 0 )
  {
    sprite.position.y = sprite.anchor.y * 32;
    changeWorld("map2.json");
  }
  else if( sprite.position.y + sprite.anchor.y * 32 > world.worldHeight )
  {
    sprite.position.y = world.worldHeight - sprite.anchor.y * 32;
    changeWorld("map2.json");
  }
}

function boundObjects()
{
  // Keep players and enemies from moving off of the screen
  bound( player.sprite );
}

function changeWorld(name)
{
  //Get a reference to the tile map and add it to the stage
  stage.removeChild(world);

  console.log("World parameters");
  console.log( name );
  console.log( world.tilewidth );
  console.log( world.tileheight );
  console.log( world.widthInTiles );

  world = tu.makeTiledWorld(name, "tileset.png");

  stage.addChild(world);

  // Create the player again
  player = new playerInit();

  // Add player to map's entity layer
  entity_layer = world.getObject("Entities");
  entity_layer.addChild(player.sprite);

  //Add in the collidable objects to our collision array
  collidableArray = world.getObject("WallsLayer").data;

  loadGame();

  gameLoop();
}


// -------------------- Main game loop --------------------
function gameLoop()
{
  setTimeout( function()
  {
    requestAnimationFrame(gameLoop);

    if( gameState == GAME )
    {
      movePlayer();
      moveSnakes();
      update_camera();
      boundObjects();
    }

    renderer.render(stage);
  }, 1000 / fps );
}
