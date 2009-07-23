KRK.TYPE.Config = function( xml )
{
	this.$ = null ;
}

// Extending from XML
KRK.TYPE.Config.prototype.constructor = function( xml )
{
	if ( typeof xml == 'string' )
	{
	// Constructs valid XML string
		xml = "<xml>" + xml + "</xml>" ;
		try
		{
			this.$ = new XML(xml);		
		}
		catch(e)
		{
			this.$ = null ;
		}
	}
}

/**
 * Configurator - queue into commands
 * TODO: Recursive Relationship
 * @return callsData
 */
KRK.TYPE.Config = function( object , config )
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
KRK.TYPE.Config.queue = function( object , type , name , value )
{
	return KRK.cmd.push( { object: object, type: type, name: name, value: value  } ) ;
}

/**
 * executing commands from queued list
 * @param cmd -- command (known to be KRK.cmd)
 */
KRK.TYPE.Config.exec = function( cmd )
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

KRK.TYPE.Config.prototype.constructor = function( xml )
{
	if ( xml instanceof XML )
	{
		this.xml = xml ;
	}
	else
	{
		this.xml = null ;
	}
}

