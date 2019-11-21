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
    if( world.objects[ name ] == objectName )
    {
      return true;
    }
  }
  return false;
}
