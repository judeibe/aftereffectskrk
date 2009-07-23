KRK.Layer = function( layer , config )
{
	this.$ = null ;
	this.$s = null ; // Generated Layers
	this.name = null ;
	this.Name = null ;
	this.config = null ;
	this.parent = null ;
	this.$$ = null; // Modules
	
	this.basedOn = null ;
	this.K = null ;
}

/**
 * getName -- get the layer name
 * @param name -- After-Effects Layer Name -- format KRK[Style][0][1] 2
 * @param K -- Karaoke JSON (Optional)
 * @return an object of the following form:
 *         names: type, basedOn, style, layer, line, syl
 *         line: karaoke line JSON
 *         syl: Karaoke syllable JSON
 */
KRK.Layer.getName = function( name , K )
{
	var line , names , a ;
	if ( a = name.match( /^(.+?)\[\s*(.*?)\s*\]\[\s*(.*?)\s*\]\[\s*(.*?)\s*\](\[\s*(.*?)\s*\])?\s*([^\[\]]*\s*$)/ ) )
	{
		names =
		{ 
			basedOn: a[1],
			style: a[2], 
			layer: a[3], 
			line: a[4], 
			syl: a[6], 
			extra: a[7]
		} ;
		if ( K )
		{
			line = K[a[2]][a[3]][a[4]] ;
			kara = a.length < 7 ? null : K[a[2]][a[3]][a[4]][a[6]] ;
		}
	}
	else
	{
		return null ;
	}
	return K ? { names: names , line: line , syl: kara } : names ;
}

/**
 * make up a layer name
 * ---------------------
 * @param o -- object, same format as getName's names
 *             basedOn , style , layer , line , syl , extra
 */
KRK.Layer.makeName = function( o )
{
	var syl = o.syl == undefined ? "" : " " + o.syl ;
	return String( o.basedOn ) + '[' + String( o.style ) + '][' + String( o.layer ) + '][' + String( o.line ) + ']' + ( syl!=undefined && syl != '' && syl!=null ? '[' + String( syl.replace( /\s+/ , '' ) ) + ']' : '' ) + ( o.extra != undefined ? String(o.extra) : '' ) ;
}

/**
 *  Get layer timings (default uses composition timings)
 */
KRK.Layer.prototype.getTimings = function( )
{
	
}

KRK.Layer.prototype.init = function( layer , config )
{
	if ( layer instanceof Object )
	{
		this.$ = layer ;
		this.name = layer.name.toLowerCase( ) ;
		this.Name = layer.name ;
		
	// There's a configuration, used as CACHE
		if ( config instanceof Object )
		{
			this.config = config ;
		}
		else
		{
			this.config = new KRK.TYPE.Config( layer.comment ) ;
		}
	}
}

KRK.Layer.prototype.constructor = function( layer , config )
{
	this.init( layer , config ) ;
}

/**
 * Assigns a K
 */
KRK.Layer.prototype.setK = function( K , isSyllable )
{
	this.isSyllable = isSyllable ;
	this.K = K ;
}

/**
 * duplicate a layer
 * -----------------
 * @param o -- object, same format as getName's names
 *             style , layer , line , syl , extra
 * @param K -- karaoke object (default uses KRK.K)
 */
KRK.Layer.prototype.duplicate = function( o , K )
{
	var start , end , text ;
	var $layer ;
	start = K.start ;
	end   = K.end ;
	text  = K.text ;
	if ( !this.$s )
	{
		this.$s = [ ] ;
	}
	if ( ! K )
	{
		K = KRK.K ;
	}
	o.basedOn = this.Name ;
	$layer = this.$.duplicate( ) ;
	
	return this ;
}