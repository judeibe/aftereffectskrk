KRK.UTIL = function( )
{
	
}

// TODO: Collecting AE Comps and Layers into KRK.COMPS_LAYERS
// This should be called before generating the layers
KRK.UTIL.collect = function( compName )
{
	if ( typeof compName == 'undefined' )
	{
		KRK.COMP_LAYERS = { } ;
		
	}
	else
	{
		if ( !compName )
		{
			compName = 'KRK' ;
		}
		var comp_name = compName.toLowerCase() ;
	}
}
// TODO: Collect AE Layers from Comp and return a list of layers
// This is called internally by KRK.collect
KRK.UTIL.collectLayers = function( comp )
{
	
}

/**
 *  get a list of layers or one layer
 *  ---------------------------------
 * @param compName -- composition name.  it can be a previous object returned by getLayer( 'compName' )
 * @param layerName -- can be string or null
 * @return layer object or a name list of layers. (keys are the names -- all in lower case)
 */
KRK.UTIL.getLayer = function( compName , layerName )
{
	if ( typeof compName == 'string' )
	{
		compName = KRK.COMPS_LAYERS[compName.toLowerCase()] ;
	}
	if ( ! ( compName instanceof Object ) )
	{
		return null ;
	}
	if ( layerName )
	{
		return compName[ layerName.toLowerCase( ) ] ;
	}
	return null ;
}

/**
 * getProperty
 * @param layer -- AE Layer object
 * @param names -- AE commands list
 * @return AE property
 */
KRK.UTIL.getProperty = function( layer , names )
{
	var o , i , j , p , name1 , more ;
	o = layer ;
	if ( names instanceof Array )
	{
		for ( i in names )
		{
			if ( p = o.property(names[i]) )
			{
				o = p ;
			}
			else
			{
				return null ;
			}
		}
	}
	else if ( names instanceof Object )
	{
		return names ;
	}
	else
	{
		try
		{
			eval( "if ( p = o." + names + " ) { o = p ; }" )
		}
		catch( err )
		{
			return null ;
		}
	}
	return o ;
}

// TODO: read a file
KRK.UTIL.readFile = function( file )
{
	
}

// TODO: reads text in a text layer
KRK.UTIL.readText = function( textLayer )
{
	
}

/**
 * includes a javascript file
 * @param filename -- name of the file
 */
KRK.UTIL.include = function( filename )
{
	eval( KRK.readFile( filename ) ) ;
}

/**
 * Loads a module
 * @param name -- module name
 */
KRK.UTIL.loadModule = function( name )
{
	if ( !name )
	{
		return KRK.MOD ;
	}
	var n = name.toUpperCase() ;
	if ( !KRK.MOD[n] )
	{
		KRK.include( 'krk_' + name.toLowerCase() + '.jsx' ) ;
		return KRK.MOD[n] ;
	}
	return KRK.MOD[n] ;
}

/**
 * add a module
 * @param object -- current object
 * @param name -- module name
 * @param options -- module options (created at start)
 */
KRK.UTIL.add = function( object , MODULE , options )
{
	var o ;
	
// If the module doesn't exist, load the module
	if ( typeof KRK.MOD[MODULE] != 'function' )
	{
		KRK.loadModule( MODULE ) ;
	}
	
	if ( typeof KRK.MOD[MODULE] == 'function' )
	{
	// Add Modules by extending the module in a child module
		if ( typeof KRK.MOD[MODULE]['EXTEND_' + MODULE] == 'function' )
		{
			object[MODULE] = KRK.MOD[MODULE]['EXTEND_' + MODULE]( object , options ) ;
		}
		
	// Adds a module directly from the parent module.
		else if ( typeof object['ADD_' + MODULE] == 'function' )
		{
			object[MODULE] = o = object['ADD_' + MODULE]( options ) ;
		}
	
	// Add default arrays
		else if ( options instanceof Array )
		{
			if ( !(object[MODULE] instanceof Array) )
			{
				object[MODULE] = [ ] ;
			}
			for ( j = 0 ; j < options.length ; j ++)
			{
				object.push( o = new KRK.MOD[MODULE]( ) ) ;
				o.moduleName = MODULE ;
				KRK.config( object[j] , options[j] );
			}
		}
		
	// Add default objects
		else if ( options instanceof Object )
		{
			if ( !( object[MODULE] instanceof Object ) )
			{
				object[MODULE] = { } ;
			}
			for ( j in options )
			{
				object[MODULE] = o = new KRK.MOD[MODULE]( ) ;
				o.moduleName = MODULE ;				
				KRK.config( object[j] , options[j] ) ;
			}
		}
	}
}
