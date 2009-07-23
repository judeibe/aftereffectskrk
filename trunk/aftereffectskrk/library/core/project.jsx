/**
 * Creates a karaoke project using the given complayer
 */

KRK.Project = function( )
{
	this.complayer = null ;
	this.$$ = null ;
	this.parent = null ;
}

/**
 * initialization
 * --------------
 * Basically extracts all compositions and layers from the project
 */
KRK.Project.prototype.init( )
{
	var c , l , comp , layer , config ;
// Loads all the compositions
	this.complayer = KRK.TYPE.CompLayer( ) ;
	this.$$ = { } ;

// Creates all the appropriate KRK objects from complayer
	if ( this.complayer.data instanceof Object )
	{
		for (c in this.complayer.data )
		{
			comp = this.complayer.data[c] ;
			this.$$[c] = new KRK.Comp( comp, comp.layers ) ;
			this.$$[c].parent = this ;
		}
	}
}