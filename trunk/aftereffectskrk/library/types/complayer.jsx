/**
 * Composition type
 * that stores all of the compositions
 */
KRK.TYPE.CompLayer = function( no_build )
{
	var self = this ;
	this.$ = null ;
	this.compname = null ;
	this.layername = null ;
	if ( !no_build )
	{
		this.build( ) ;
	}
}

/**
 * Build a list of compositions into the data
 */
KRK.TYPE.CompLayer.prototype.build = function( )
{
	this.getComps( );
	var compname ;
	for ( compname in this.$ )
	{
		this.getLayers( i ) ;
	}
	return this;
}

/**
 * Get a list of compositions
 */
KRK.TYPE.CompLayer.prototype.getComps = function( )
{
	this.$ = { } ;
	var i ;
	var project = app.project ;
	var items = project.items ;
	var item , i ;
	for ( i = 1 ; i <= items.length ; i ++ )
	{
		item = items[i] ;
		if ( item.typeName == 'Composition' )
		{
			this.$[item.name.toLowerCase()] = { comp: item } ;
		}
	}
	return this ;
}

/**
 * Get a list of layers
 * --------------------
 * @param compname -- composition name
 * @return this
 */
KRK.TYPE.CompLayer.prototype.getLayers = function( compname )
{
	var data = this.$[compname] ;
	var i;
	var layer ;
	var layername ;
	var xml ;
	data.layer = { } ;
	data.config = { } ;
	for ( i = 1 ; i <= data.comp.numLayers ; i ++ )
	{
		layer = data.comp.layer( i ) ;
		layername = layer.name.toLowerCase( ) ;
	
	// Not a preset or a generated layer
		if ( layername.substring(0 , 3) != 'krk' )
		{
			data.layers[layername] = layer ;
		}
	}
	return this ;
}

/**
 * get one item
 * -------------
 * @param compname -- composition name (if it's null, then it's the entire data
 * @param layername -- layer name; if it's null, then it's the entire layers of that comp
 * @return data -- depending on what's compname and layername
 */
KRK.TYPE.CompLayer.prototype.$ = function( compname , layername )
{
	if ( typeof compname == 'string' )
	{
		compname = compname.toLowerCase( ) ;
		if ( typeof layername == 'string' )
		{
			layername = layername.toLowerCase( ) ;
			return this.$[compname].layer[layername] ;
		}
		else
		{
			return this.$[compname] ;
		}
	}
	else
	{
		return this.$ ;
	}
}

/**
 * Setting the current name
 * -------------------------
 * @param compname -- composition name
 * @param layername -- layer name
 * @return this
 */
KRK.TYPE.CompLayer.prototype.setName = function( compname , layername )
{
	if ( typeof compname == 'string' )
	{
		this.compname = compname.toLowerCase() ;
	}
	if ( typeof layername == 'string' )
	{
		this.layername = layername.toLowerCase() ;
	}
	return this ;
}

/**
 * Get the current composition
 * @return AE composition data
 */
KRK.TYPE.CompLayer.prototype.comp = function( )
{
	if ( typeof this.compname == 'string' && typeof this.$[this.compname].comp == 'object' )
	{
		return this.$[this.compname].comp ;
	}
	return null ;
}

KRK.TYPE.CompLayer.prototype.layer = function( )
{
	if ( typeof this.layername == 'string' &&  typeof this.compname == 'string' && typeof this.$[this.compname].layers[this.layername] == 'object' )
	{
		return this.$[this.compname].layers[this.layername] ;
	}
	return null ;
}