// Functions in this file are responsible for loading different screens of the
// game, switching between different maps, and otherwise reinitializing the game
// state.

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
  stage.removeChild(world);

  console.log("World parameters");
  console.log( name );
  console.log( world.tilewidth );
  console.log( world.tileheight );
  console.log( world.widthInTiles );

  world = tu.makeTiledWorld(name, "tileset.png");

  stage.addChild(world);

  // Create the player again
  player = new player();

  // Add player to map's entity layer
  entity_layer = world.getObject("Entities");
  entity_layer.addChild(player.sprite);
  entity_layer.addChild(player.playerBody);

  //Add in the collidable objects to our collision array
  collidableArray = world.getObject("WallsLayer").data;

  loadGame();

  gameLoop();
}
