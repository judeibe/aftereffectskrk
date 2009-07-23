/**
 * Karaoke Composition object
 * @param comp -- After-Effects compitem comp
 * @param layers -- layers from KRK.TYPE.CompLayer
 */
KRK.Comp = function( comp , layers )
{
	this.Name = null ; // Case sensitive name
	this.name = null ; // Case insensitive name
	this.$ = null;
	this.parent = null ;
	this.$$ = null ;
}

/**
 *  get composition timings (TODO)
 */
KRK.Comp.prototype.getTimings = function( )
{
	
}

KRK.Comp.prototype.init = function( comp , layers )
{
	var layer , i ;
	var layername ;
	var config ;
	var k , key , K ;
	this.$ = comp ;
	this.Name = comp.name ;
	this.name = comp.name.toLowerCase( ) ;
	this.$$ = { } ;
	
// Get Composition Timings (TODO)
	
// Get a list of layers
	if ( layers instanceof Object )
	{
		k = 0 ;
		for ( i in layers )
		{
			layer = layers[i] ;
			config = new KRK.TYPE.Config( layer.comment ) ;
			if ( !config.$ ) { continue ; }
		// It's a text layer
			if ( config.$.layer )
			{
				this.$$[i] = new KRK.Layer( layers[i] , config ) ;
				this.$$[i].parent = this ;
			}
		// It's a karaoke text layer
			else if ( config.$.karaoke && layer.text )
			{
				key = config.$.karaoke.toString() ;
				K = new KRK.TYPE.Karaoke.parse_ass( layer.text.sourceText ) ;
				if ( !K ) { continue ; }
				KRK.Ks[key] = K ;
				if ( !k || config.$.karaoke['@default'] ){ KRK.K = KRK.Ks[key] ; }
			 	k++ ;
			}
		}
	}
}

KRK.Comp.prototype.constructor( comp , layers )
{
	if ( layers && comp )
	{
		this.init( comp , layers ) ;
	}
}