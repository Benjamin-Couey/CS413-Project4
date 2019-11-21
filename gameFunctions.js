// Functions in this file are responsible for the running of the game itself.
// This includes input handling, collision detection, moving NPCs, etc.

function checkCollision( spriteA, spriteB )
{
  var a = spriteA.getBounds();
  var b = spriteB.getBounds();
  return a.x + a.width > b.x && a.x < b.x + b.width && a.y + a.height > b.y && a.y < b.y + b.height;
}

function handleCollision()
{
  // Check if player has collided with a snake
  for( let index = 0; index < snakes.length; index++)
  {
    // Player collided with an enemy, the game is over
    if( checkCollision( player.sprite, snakes[ index ].sprite ) )
    {
      console.log("Eaten by snek");
      loadGameOver();
      return null;
    }
  }

  // Check if player has collided with a cobra
  for( let index = 0; index < cobras.length; index++)
  {
    // Player collided with an enemy, the game is over
    if( checkCollision( player.sprite, cobras[ index ].sprite ) )
    {
      console.log("Eaten by cobra");
      loadGameOver();
      return null;
    }
  }

  // Check if player has collided with a cobra's spit
  for( let index = 0; index < spits.length; index++)
  {
    // Player collided with an enemy, the game is over
    if( checkCollision( player.sprite, spits[ index ].sprite ) )
    {
      console.log("Hit by spit");
      loadGameOver();
      return null;
    }
  }
}

function update_camera() {
  game.x = -player.sprite.x*GAME_SCALE + GAME_WIDTH/2 - player.sprite.width/2*GAME_SCALE;
  game.y = -player.sprite.y*GAME_SCALE + GAME_HEIGHT/2 + player.sprite.height/2*GAME_SCALE;
  game.x = -Math.max(0, Math.min(world.worldWidth*GAME_SCALE - GAME_WIDTH, -game.x));
  game.y = -Math.max(0, Math.min(world.worldHeight*GAME_SCALE - GAME_HEIGHT, -game.y));
}

function bound( sprite )
{
  // Given a sprite, make sure that it stays within the bounds of the screen
  // Accounts for the sprites anchor position to keep the entirety of the sprite in bounds
  if( sprite.position.x + sprite.anchor.x * 32 < 0)
  {
    sprite.position.x = sprite.anchor.x * 32;
    switch(mapState)
    {
        case "Map0":
        changeWorld("map2.json");
        mapState = "Map1";
        break;

        case "Map1":
        changeWorld("map.json");
        mapState = "Map0";
        break;
    }
  }
  else if( sprite.position.x + sprite.anchor.x * 32 > world.worldWidth )
  {
    sprite.position.x = world.worldWidth - sprite.anchor.x * 32;
    switch(mapState)
    {
        case "Map0":
        changeWorld("map2.json");
        mapState = "Map1";
        break;

        case "Map1":
        changeWorld("map.json");
        mapState = "Map0";
        break;
    }
  }
  if( sprite.position.y + sprite.anchor.y * 32 < 0 )
  {
    sprite.position.y = sprite.anchor.y * 32;
    switch(mapState)
    {
        case "Map0":
        changeWorld("map2.json");
        mapState = "Map1";
        break;

        case "Map1":
        changeWorld("map.json");
        mapState = "Map0";
        break;
    }
  }
  else if( sprite.position.y + sprite.anchor.y * 32 > world.worldHeight )
  {
    sprite.position.y = world.worldHeight - sprite.anchor.y * 32;
    switch(mapState)
    {
        case "Map0":
        changeWorld("map2.json");
        mapState = "Map1";
        break;

        case "Map1":
        changeWorld("map.json");
        mapState = "Map0";
        break;
    }
  }
}

function boundObjects()
{
  // Keep players and enemies from moving off of the screen
  bound( player.sprite );
}

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
    }
  }
}

function moveCobras()
{
  var cobra;

  for( let index = 0; index < cobras.length; index++ )
  {
    cobra = cobras[ index ];

    // Switch based on cobra's state
    switch( cobra.stateM.current )
    {
      case 'guard':
        // Have the snake look at the player
        cobra.cobraHead.rotation = Math.atan2( player.sprite.y  - cobra.sprite.y,
                                               player.sprite.x   - cobra.sprite.x );

        // Check if the cobra is ready to spit
        if( cobra.spitCycle >= 60 )
        {
          // If so spit
          cobra.spitCycle = 0;
          // Drop a spit if there are more than 3 of them in the world
          if( spits.length > 3 )
          {
            spits.shift();
          }
          // Create a new spit at the cobra's position, aimed at the player
          newSpit = new spit( cobra.sprite.x, cobra.sprite.y, cobra.cobraHead.rotation );
          spits.push( newSpit );
          entity_layer.addChild( newSpit.sprite );
          entity_layer.addChild( newSpit.spit );
        }
        else
        {
          cobra.spitCycle += 1;
        }
      break;
    }
  }
}

function moveSpit()
{
  var spit;

  for( let index = 0; index < spits.length; index++ )
  {
    spit = spits[ index ];

    // Fly in the direction the spit is facing
    spit.sprite.x += 4 * Math.cos( spit.spit.rotation );
    spit.sprite.y += 4 * Math.sin( spit.spit.rotation );

    spit.spit.x = spit.sprite.x + spit.sprite.width / 2;
    spit.spit.y = spit.sprite.y + spit.sprite.height / 2;
  }
}
