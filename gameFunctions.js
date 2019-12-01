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
  // For snakes and cobras, players can't collide with them while they are sleeping

  // Check if player has collided with a snake
  for( let index = 0; index < snakes.length; index++)
  {
    // Player collided with an enemy, the game is over
    // Ignore sleeping enemies
    if( snakes[ index ].stateM.is('awake') && checkCollision( player.sprite, snakes[ index ].sprite ) )
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
    // Ignore sleeping enemeis
    if( cobras[ index ].stateM.is('awake') && checkCollision( player.sprite, cobras[ index ].sprite ) )
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
  if( sprite.position.x + sprite.anchor.x * 32 < 32)
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
  else if( sprite.position.x + sprite.anchor.x * 32 > world.worldWidth - 32 )
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
  if( sprite.position.y + sprite.anchor.y * 32 < 32 )
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
  else if( sprite.position.y + sprite.anchor.y * 32 > world.worldHeight - 32 )
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
  if (e.keyCode == HKEY) {
    playSong( HKEY );
  }
  if (e.keyCode == JKEY) {
    playSong( JKEY );
  }
  if (e.keyCode == KKEY) {
    playSong( KKEY );
  }
  if (e.keyCode == LKEY) {
    playSong( LKEY );
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

    player.beatMarker.x = player.sprite.x + player.sprite.width / 2;
    player.beatMarker.y = player.sprite.y + player.sprite.height / 2 + 150;

    // Check if the player is moving, and if so, animate their sprite
    if( player.vx == 0 && player.vy == 0) {
      player.playerBody.stop();
    }
    else {
      player.playerBody.play();
    }

}

function playSong( note )
{

  console.log(player.rhythm);
  // Only play a note if done so in the right rythm
  if( player.rhythm < 15 )
  {
    console.log("Player played on beat");
    switch( note )
    {
      case HKEY:
        player.stateM.playH();
      break;
      case JKEY:
        player.stateM.playJ();
      break;
      case KKEY:
        player.stateM.playK();
      break;
      case LKEY:
        // Song of Sleep - HKJL
        if( player.stateM.is( "HKJ") )
        {
          // Call song of sleep function
          console.log("Song of sleep");
          songOfSleep();
        }
        player.stateM.playL();
      break;
    }
    console.log( player.stateM.current );
  }

  // Otherwise, reset player's song for palying offbeat
  else
  {
    console.log("Player played offbeat");
    player.stateM.offbeat();
  }

}

function playerRhythm()
{
  // If rhythm is 0-14, player is on beat
  if( player.rhythm == 0 )
  {
      player.beatMarker.visible = true;
  }
  // If rhythm is 15-29, player is off beat
  else if( player.rhythm == 15 )
  {
      player.beatMarker.visible = false;
  }

  // Iterate player rythm
  player.rhythm += 1;

  // Reset player rythm
  if( player.rhythm >= 30 )
  {
    player.rhythm = 0;
  }
}

function songOfSleep()
{
  console.log("Played the song of sleep");
  console.log( entity_layer );
  // Create song of sleep particle effect
  songOfSleepEmitter.updateSpawnPos( player.sprite.x, player.sprite.y );
  songOfSleepEmitter.resetPositionTracking();
  songOfSleepEmitter.emit = true;

  // For each cobra and snake, check to see if it is within 100 pixils of the
  // player. If so, put that snake ot sleep.
  for( let index = 0; index < snakes.length; index++)
  {
    var snake = snakes[ index ];

    if( snake.stateM.is('awake') && distance( player.sprite.x, player.sprite.y, snake.sprite.x, snake.sprite.y ) <= 100 )
    {
      // Put the snake to sleep
      snake.snakeBody.visible = false;
      snake.sleepSnake.visible = true;
      snake.sleepSnake.x = snake.sprite.x + snake.sprite.width / 2;
      snake.sleepSnake.y = snake.sprite.y + snake.sprite.height / 2;
      snake.sleepSnake.rotation = snake.snakeBody.rotation;
      console.log( snake.sleepSnake.x );
      console.log( snake.sleepSnake.y );
      console.log( snake.sleepSnake.rotation );
      console.log( snake.sleepSnake.visible );
      snake.sleepTimer = 0;
      snake.stateM.fallAsleep();
    }

  }

  // Check if player has collided with a cobra
  for( let index = 0; index < cobras.length; index++)
  {
    var cobra = cobras[ index ];

    if( cobra.stateM.is('awake') && distance( player.sprite.x, player.sprite.y, cobra.sprite.x, cobra.sprite.y ) <= 100 )
    {
      // Put the cobra to sleep
      cobra.cobraBody.visible = false;
      cobra.cobraHead.visible = false;
      cobra.sleepCobra.visible = true;
      cobra.sleepTimer = 0;
      cobra.stateM.fallAsleep();
    }
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
      case 'awake':
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

      case 'asleep':
        // Iterate the snake's sleep timer until it wakes up
        snake.sleepTimer += 1;

        // Sleep for 5 seconds
        if( snake.sleepTimer > 150 )
        {
          // Wake the snake up
          snake.snakeBody.visible = true;
          snake.sleepSnake.visible = false;
          snake.stateM.wakeUp();
        }
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
      case 'awake':
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
            entity_layer.removeChild( spits[0].sprite );
            entity_layer.removeChild( spits[0].spit );
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

      case 'asleep':
        // Iterate the cobra's sleep timer until it wakes up
        cobra.sleepTimer += 1;

        // Sleep for 5 seconds
        if( cobra.sleepTimer > 150 )
        {
          // Wake the cobra up
          cobra.cobraBody.visible = true;
          cobra.cobraHead.visible = true;
          cobra.sleepCobra.visible = false;
          cobra.stateM.wakeUp();
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

    // Check if the spit collided with a wall
    var collide = tu.hitTestTile(spit.sprite, collidableArray, 0, world, "every");

    // If that is the case, delete the spit
    if( !collide.hit )
    {
      entity_layer.removeChild( spit.sprite );
      entity_layer.removeChild( spit.spit );
      spits.splice( index, index + 1 );
    }
  }
}
