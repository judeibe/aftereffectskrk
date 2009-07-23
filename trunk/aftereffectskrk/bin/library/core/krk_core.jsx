var KRK = function( )
{
	var self = this;
	self.K = { } ;
	self.config = { } ;
	self.Karaoke = { } ;
	
// Collect all comps and layers
	KRK.collect( ) ;
	
	/**
	 * load karaoke and config
	 * @param config -- configuration
	 * @param karaoke -- karaoke
	 */
	function init( config , karoake )
	{
	}
}

// A list of loaded MOD
KRK.MOD = { } ;

// A list of TYPES

KRK.TYPE = { } ;

// Global Commands
KRK.cmd = [ ] ;

// Global UIs
KRK.UI = { } ;

// TODO: Collecting AE Comps and Layers into KRK.COMPS_LAYERS
// This should be called before generating the layers
KRK.collect = function( compName )
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
KRK.collectLayers = function( comp )
{
	
}

/**
 *  get a list of layers or one layer
 *  ---------------------------------
 * @param compName -- composition name.  it can be a previous object returned by getLayer( 'compName' )
 * @param layerName -- can be string or null
 * @return layer object or a name list of layers. (keys are the names -- all in lower case)
 */
KRK.getLayer = function( compName , layerName )
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
KRK.getProperty = function( layer , names )
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
KRK.readFile = function( file )
{
	
}

// TODO: reads text in a text layer
KRK.readText = function( textLayer )
{
	
}

/**
 * includes a javascript file
 * @param filename -- name of the file
 */
KRK.include = function( filename )
{
	eval( KRK.readFile( filename ) ) ;
}

/**
 * Loads a module
 * @param name -- module name
 */
KRK.loadModule = function( name )
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
KRK.add = function( object , MODULE , options )
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

/**
 * Configurator -- queue into commands
 * TODO: Recursive Relationship
 * @return callsData
 */
KRK.config = function( object , config )
{
	object.config = config ;
	var method , options , define , init ;
	var $config , $i ;
// [ { method: { } , Module: { } } , {  } ]
	if ( config instanceof Array )
	{
		return ;
	}
	
// { NAME: { method: {  } , Module: {  } } , NAME2: {  } }
	if ( config instanceof Object )
	{
		for ( method in config )
		{
		// method
			if ( typeof KRK.MOD[object.moduleName].prototype[method].config == 'object' )
			{
			// TODO: Validations (have to wait for the debugging process)
				define = KRK.MOD[object.moduleName].prototype[method].config ;
				options = config[method] ;
				KRK.queue( object , 'method' , method , options ) ;
			}
		// MODULE
			else if ( method.toUpperCase( ) == method )
			{
				KRK.add( object , method , config[method] ) ;
			// DEBUG
			}
		}
	}
}

/**
 * queue commands for latter executions
 * @param object -- object
 * @param type -- type (property, method, add)
 * @param name -- name
 * @param value -- value/options/arguments
 */
KRK.queue = function( object , type , name , value )
{
	return KRK.cmd.push( { object: object, type: type, name: name, value: value  } ) ;
}

/**
 * executing commands from queued list
 * @param cmd -- command (known to be KRK.cmd)
 */
KRK.exec = function( cmd )
{
	if ( !( cmd instanceof Array ) || !cmd.length )
	{
		cmd = KRK.cmd ;
	}
	
	var i , c , j ;
	for ( i = 0 ; i < cmd ; i ++ )
	{
		c = cmd[i] ;
		switch ( c.type )
		{
			case 'property':
				c.object[c.name] = c.value ;
				break;
			case 'method':
				c.object[c.name]( c.value ) ;
				break;
			case 'module':
				// preloaded
			break;
		}
	}
}