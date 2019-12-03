// This file contains assorted helper functions

// Calculates the distance in pixles between two given points
function distance( x1, y1, x2, y2)
{
  return Math.sqrt( Math.pow( x1 - x2, 2 ) + Math.pow( y1 - y2, 2 ) );
}

// Returns true if the object name is present in the Tile Utilities world object
// false otherwise
function existsInWorld( objectName )
{
  for( let index = 0; index < world.objects.length; index++ )
  {
    if( world.objects[ index ][ "name" ] == objectName )
    {
      return true;
    }
  }
  return false;
}

// Sets the volume of all build tracks to 0, leaving only the basic background music
// for menues and the game over screen
function silenceMusic()
{
 build1.volume = 0;
 build2.volume = 0;
 build3.volume = 0;
 build4.volume = 0;
}
