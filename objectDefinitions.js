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

  // Instance variables
  this.vx = 0;
  this.vy = 0;
  this.moving = false;
}

function snakeInit()
{
  // Only initialize cobras if there are cobras on the map
  if( existsInWorld( "Snake" ) )
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
  // Center the sprite within the 40 by 40 grid of the map
  this.sprite.x = mapPosition.x + ( 40 - this.sprite.width ) / 2;
  this.sprite.y = mapPosition.y - 40 + ( 40 - this.sprite.height ) / 2;

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

function cobraInit()
{
  // Only initialize cobras if there are cobras on the map
  if( existsInWorld( "Cobra" ) )
  {
    // Get an array of references to all the snake objects in the entities layer
    // of the map
    var stgCobra = world.getObjects("Cobra");

    // Clear the snakes array
    cobras = [];

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

  // Place the snake on the map
  // Center the sprite within the 40 by 40 grid of the map
  this.sprite.x = mapPosition.x + ( 40 - this.sprite.width ) / 2;
  this.sprite.y = mapPosition.y - 40 + ( 40 - this.sprite.height ) / 2;

  this.cobraBody.x = this.sprite.x + this.sprite.width / 2;
  this.cobraBody.y = this.sprite.y + this.sprite.height / 2;

  this.cobraHead.x = this.sprite.x + this.sprite.width / 2;
  this.cobraHead.y = this.sprite.y + this.sprite.height / 2;

  this.spitCycle = 0;

  this.stateM = StateMachine.create({
    initial: {state: 'guard', event: 'init'},
    error: function() {},
    events: [
      {name: 'detectPlayer', from: 'guard', to: 'attack'},
      {name: 'losePlayer', from: 'attack', to: 'guard'}
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
