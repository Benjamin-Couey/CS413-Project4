// This file contains the definitions of all objects used in the game, as well as
// the functions needed to initialize them and place tham on the map.

function loadPlayer()
{
  // Assuming every map will have a player object on it
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
  // Center the sprite within the 40 by 40 grid of the map
  this.sprite.x = stgPlayer.x + ( 40 - this.sprite.width ) / 2;
  this.sprite.y = stgPlayer.y - 40 + ( 40 - this.sprite.height ) / 2;

  this.playerBody.x = this.sprite.x + this.sprite.width / 2;
  this.playerBody.y = this.sprite.y + this.sprite.height / 2;

  this.beatMarker = new PIXI.Sprite( sheet.textures["BeatMarker.png"] );
  this.beatMarker.anchor.set(0.5);
  this.beatMarker.x = this.sprite.x + this.sprite.width / 2;
  this.beatMarker.y = this.sprite.y + this.sprite.height / 2 + 150;

  // Create the state machine to control the player's songs
  this.stateM = StateMachine.create({
    init: 'none',
    error: function() {},
    events: [
      {name: 'playH', from: 'none', to: 'H'},

      {name: 'playH', from: 'H', to: 'none'},
      {name: 'playK', from: 'H', to: 'HK'},
      {name: 'playJ', from: 'H', to: 'none'},
      {name: 'playL', from: 'H', to: 'none'},
      {name: 'offbeat', from: 'H', to: 'none'},

      {name: 'playH', from: 'HK', to: 'none'},
      {name: 'playK', from: 'HK', to: 'none'},
      {name: 'playJ', from: 'HK', to: 'HKJ'},
      {name: 'playL', from: 'HK', to: 'none'},
      {name: 'offbeat', from: 'HK', to: 'none'},

      {name: 'playH', from: 'HKJ', to: 'none'},
      {name: 'playK', from: 'HKJ', to: 'none'},
      {name: 'playJ', from: 'HKJ', to: 'none'},
      {name: 'playL', from: 'HKJ', to: 'none'},
      {name: 'offbeat', from: 'HKJ', to: 'none'}
    ],
  methods: {
     onPlayH: function() {  if( this.is('H') ){ build1.volume = 0.1; } },
     onPlayK: function() {  if( this.is('HK') ){ build2.volume = 0.1; } },
     onPlayJ: function() {  if( this.is('HKJ') ){ build3.volume = 0.1; } },
     onPlayL: function() {   },
     onOffbeat: function() { silenceMusic() }
   }
  });

  // Instance variables
  this.vx = 0;
  this.vy = 0;
  this.moving = false;
  this.rhythm = 0;
  this.playedNote = false;
  this.playingSong = false;
  this.songCounter = 0;
}

function snakeInit()
{
  // Clear the snakes array
  snakes = [];

  // Only initialize cobras if there are cobras on the map
  if( existsInWorld( "Snake" ) )
  {
    // Get an array of references to all the snake objects in the entities layer
    // of the map
    var stgSnake = world.getObjects("Snake");

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
      entity_layer.addChild( newSnake.sleepSnake );
    }
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

  // Create the snake's sleeping sprite
  this.sleepSnake = new PIXI.Sprite( sheet.textures["SleepSnake.png"] );
  this.sleepSnake.anchor.set(0.5);
  this.sleepSnake.visible = false;

  // Place the snake on the map
  // Center the sprite within the 40 by 40 grid of the map
  this.sprite.x = mapPosition.x + ( 40 - this.sprite.width ) / 2;
  this.sprite.y = mapPosition.y - 40 + ( 40 - this.sprite.height ) / 2;

  this.snakeBody.x = this.sprite.x + this.sprite.width / 2;
  this.snakeBody.y = this.sprite.y + this.sprite.height / 2;

  this.sleepTimer = 0;

  this.stateM = StateMachine.create({
    initial: {state: 'awake', event: 'init'},
    error: function() {},
    events: [
      {name: 'fallAsleep', from: 'awake', to: 'asleep'},
      {name: 'wakeUp', from: 'asleep', to: 'awake'}
    ]
  });
}

function cobraInit()
{
  // Clear the cobras array
  cobras = [];

  // Only initialize cobras if there are cobras on the map
  if( existsInWorld( "Cobra" ) )
  {
    // Get an array of references to all the snake objects in the entities layer
    // of the map
    var stgCobra = world.getObjects("Cobra");

    // For each of these references, create a snake object, position it on the
    // map based on the reference, push it to the array, and add it to the entity layer
    for( let index = 0; index < stgCobra.length; index++ )
    {
      // Create the snake
      var newCobra = new cobra( stgCobra[index] );

      // Add snake to array for later reference
      cobras.push( newCobra );

      // Add snake's sprite to the map
      entity_layer.addChild( newCobra.sprite );
      entity_layer.addChild( newCobra.cobraBody );
      entity_layer.addChild( newCobra.cobraHead );
      entity_layer.addChild( newCobra.sleepCobra );
    }
  }
}

function cobra( mapPosition )
{
  // Create the cobra's 'hitbox' sprite
  // This sprite will be invisible and will be used to check collision for the
  // snake with walls, the player, etc.
  this.sprite = new PIXI.Sprite( sheet.textures["CobraBody.png"] );
  this.sprite.visible = false;

  // Create the cobra's visible body
  this.cobraBody = new PIXI.Sprite( sheet.textures["CobraBody.png"] );
  this.cobraBody.anchor.set(0.5);

  // Create the cobra's visible head
  this.cobraHead = new PIXI.Sprite( sheet.textures["CobraHead.png"] );
  this.cobraHead.anchor.set(0,0.5);

  // Create the cobta's sleeping sprite
  this.sleepCobra = new PIXI.Sprite( sheet.textures["SleepCobra.png"] );
  this.sleepCobra.anchor.set(0.5);
  this.sleepCobra.visible = false;

  // Place the snake on the map
  // Center the sprite within the 40 by 40 grid of the map
  this.sprite.x = mapPosition.x + ( 40 - this.sprite.width ) / 2;
  this.sprite.y = mapPosition.y - 40 + ( 40 - this.sprite.height ) / 2;

  this.cobraBody.x = this.sprite.x + this.sprite.width / 2;
  this.cobraBody.y = this.sprite.y + this.sprite.height / 2;

  this.cobraHead.x = this.sprite.x + this.sprite.width / 2;
  this.cobraHead.y = this.sprite.y + this.sprite.height / 2;

  this.sleepCobra.x = this.sprite.x + this.sprite.width / 2;
  this.sleepCobra.y = this.sprite.y + this.sprite.height / 2;

  this.spitCycle = 0;

  this.sleepTimer = 0;

  this.stateM = StateMachine.create({
    initial: {state: 'awake', event: 'init'},
    error: function() {},
    events: [
      {name: 'fallAsleep', from: 'awake', to: 'asleep'},
      {name: 'wakeUp', from: 'asleep', to: 'awake'}
    ]
  });
}

function spit( startingX, startingY, rotation )
{
  // Create the spit's 'hitbox' sprite
  this.sprite = new PIXI.Sprite( sheet.textures["CobraSpit.png"] );
  this.sprite.visible = false

  // Create the spit's visible sprite
  this.spit = new PIXI.Sprite( sheet.textures["CobraSpit.png"] );
  this.spit.anchor.set(0.5);

  this.sprite.x = startingX;
  this.sprite.y = startingY;
  this.spit.rotation = rotation;

  this.spit.x = this.sprite.x + this.sprite.width / 2;
  this.spit.y = this.sprite.y + this.sprite.height / 2;
}

function songOfSleepInit()
{
  // Only initialize song of sleep pickup if it is on the map
  if( existsInWorld( "SongOfSleep" ) )
  {
    // Get an array of references to all the snake objects in the entities layer
    // of the map
    var stgSong = world.getObject("SongOfSleep");

    // Create the song
    songOfSleepPickup = new songOfSleepPickup( stgSong );

    // Add song's sprite to the map
    entity_layer.addChild( newSong.sprite );
  }
}

function songOfSleepPickup( mapPosition )
{
  // Create the song's visible body
  console.log("Sprite definition");
  this.sprite = new PIXI.Sprite( sheet.textures["SongOfSleepPickup.png"] );
  this.sprite.anchor.set(0.5);

  this.sprite.x = mapPosition.x;
  this.sprite.y = mapPosition.y;
}
