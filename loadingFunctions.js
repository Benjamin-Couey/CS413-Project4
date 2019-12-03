// Functions in this file are responsible for loading different screens of the
// game, switching between different maps, and otherwise reinitializing the game
// state.

function resetGame()
{
	location.reload();
}

function loadTitle()
{
  console.log("Loading title");
  title.visible = true;
  help.visible = false;
  game.visible = false;
  world.visible = false;
  gameover.visible = false;
  gameState = TITLE;
}

function loadHelp()
{
  console.log("Loading help");
  title.visible = false;
  help.visible = true;
  game.visible = false;
  world.visible = false;
  gameover.visible = false;
  gameState = HELP;
}

function loadGame()
{
  console.log("Loading title");
  title.visible = false;
  help.visible = false;
  game.visible = true;
  world.visible = true;
  gameover.visible = false;
  gameState = GAME;
}

function loadGameOver()
{
  console.log("Loading gameover");
  title.visible = false;
  help.visible = false;
  game.visible = false;
  gameover.visible = true;
  gameState = OVER;
}

function changeWorld(name)
{
  //Get a reference to the tile map and add it to the stage
  
  //Remove current world if there is one

    stage.removeChild(world);
 
  
  console.log("World parameters");
  console.log( name );

  world = tu.makeTiledWorld(name, "tileset.png");
  
  //Log the new world
  console.log( world );
  console.log( world.tilewidth );
  console.log( world.tileheight );
  console.log( world.widthInTiles );

  game.addChild(world);


  // Get a reference to the spritesheet
  sheet = PIXI.loader.resources["Assets.json"];


  // Create the player again
  player = new loadPlayer();

  // Add player to map's entity layer
  entity_layer = world.getObject("Entities");
  entity_layer.addChild(player.sprite);
  entity_layer.addChild(player.playerBody);
  game.addChild(player.beatMarker);

  //Add in the collidable objects to our collision array
  collidableArray = world.getObject("WallsLayer").data;
  
  //Add in emmiters for the songs
  songOfSleepEmitter = createSongEmitter("SLEEP");
  
  // Add enemies to map's entity layer
  snakeInit();
  cobraInit();
	songOfSleepInit();

}

function createSongEmitter(name)
{
    // Initialize emitters
    return new PIXI.particles.Emitter(
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
}
