/**
 * KRKProperty( property ) -- Main Karaoke Property Prototype: LEVEL 4 or 5
 * @param property -- After-Effects Property object (can be numeric (index), string, or After-Effects Property object)
 */
function KRKProperty( property , options )
{
	this.parentName = 'layer' ;
	this.property = property ;
	this.properties = null ;
	this.keys ;
	this.settings ;
	this.names ; 
	this.objectName = 'property' ;
	this.childName = '' ;
	this.caller = 'property' ;
	this.layers = {} ;
	this.old = null ;
	this.unique = true ;
	this.unnorm = false ;
	this.position ;
	this.link = null ;
	this.options = { };
	this.optionKeys = [ 'syl' , 'pos' , 'unnorm' ] ;
	
	/**
	 * constructor function
	 * @param comp -- After-Effects Property object (can be numeric (index), string, or After-Effects Property object)
	 * @param options = syllable, if options is an object: syl: syllable, unnorm: unnormalizations
	 */
	this.constructor = function( property , options )
	{
		if ( property != undefined )
		{
			this.setProperty( property ) ;
			this.getKeys( ) ;
			this.old = this.property ;
			this.properties = { } ; 
			var o = this.getNames( this.property ) ;
			var i;
			this.name = '' ;
			for ( i = 1 ; i < o.length ; i ++ )
			{
				this.name += ( i>1?'.':'' ) + o[i];
			}
		}
		this.is_syl = false ;
		this.unnorm = null ;
		this.options = { } ;
		if ( options )
		{
			if ( options instanceof Object )
			{
				this.unnorm = options.unnorm ;
				this.is_syl = options.syl;
				this.position = options.pos ;
				this.link  = options.link ;
				this.options = options ;
			}
			else
			{
				this.is_syl = options ;
			}
		}
		return this ;
	}
	
	/**
	 * setProperty -- sets the property into this.property
	 * @param property -- After-Effects property object
	 * @DEPRECATED
	 */
	this.setProperty = function( property , options )
	{
		if ( options )
		{
			if ( options instanceof Object )
			{
				this.position = options.position
			}
			else
			{
				this.position = options ;
			}
		}
		if ( property == undefined )
		{
			return this ;
		}
		else if ( property instanceof Object )
		{
			this.property = property ;
		}
		else
		{
			this.property = this.getProperty( this.layer.layer , property ) ;
		}
		
		this.getNames( ) ;
		
		return this ;
	}
	

	/**
	 * prop( krk ) -- Resynchronize the same object
	 * @param krk -- KRKProperty object
	 * @return
	 */
	this.prop = function( krk )
	{
		if ( krk.layer )
		{
			this.layer = krk.layer ;
		}
	}

	/**
	 * uses a property from the pool
	 * @param key -- the key in the pool
	 */
	this.uses = function( key )
	{
		this.layer = key instanceof Object ? key : this.layers[key] ;
	}
	
	/**
	 * pos -- sets the position by syllable on a property
	 * @param norm -- normalized factor (mul = 1/norm)
	 * @note If the current property's value is a vector of two or greater, it will also set the Y positions.
	 * @note Or else, it will only set the X positions.
	 */
	this.pos = function( norm )
	{
		var K = this.getKaraObject( ) ;
		var kline = this.obj( K , this.names , KRK_LINE );
		var j , l , k , ks ;
		var start , end ;
	
		if ( this.property instanceof Object )
		{
			var mul = norm ? 1/norm : 1 ;
			for ( k in this.names.length == KRK_SYLLABLE ? [kline[this.names[KRK_SYLLABLE-1]]] : kline )
			{
				ks = kline[k] ;
				property.setKeys( { mul:mul
				                  , startTime : ks.start 
				                  , endTime : ks.start + ks.dur 
				                  , start : [ks.left , ks.top] 
				                  , end : [ks.left+ks.width , ks.top+ks.height] } ) ;
			}
		}
	}
	
	/**
	 * get all of the keys in a property, and store as a variable (this.keys)
	 */
	this.getKeys = function( )
	{
		var property = this.property ;
		var keys = [ ] ;
		var i , k ;
		for ( i = 0 ; i < this.property.numKeys ; i ++ )
		{
			k = i + 1 ;
			keys[ i ] = 
			{
				  key : k
				, value :  property.keyValue( k )
				, time : property.keyTime( k )
				, interpolationType : [ property.keyInInterpolationType( k ) , property.keyOutInterpolationType( k ) ]
//				, spatialTangents : [ property.keyInSpatialTangent( k ) , property.keyOutSpatialTangent( k ) ]
				, temoralEase : [ property.keyInTemporalEase( k ) , property.keyOutTemporalEase( k ) ]
				, temporalContinuous : property.keyTemporalContinuous( k )
				, temporalAutoBezier : property.keyTemporalAutoBezier( k )
//				, roving : property.keyRoving( k )
				, selected : property.keySelected( k )
			} ;
			try{ keys[i]['spatialTangents'] = [ property.keyInSpatialTangent( k ) , property.keyOutSpatialTangent( k ) ] ; } catch( err ) { }
			try{ keys[i]['roving'] = property.keyRoving( k ) ; } catch( err ) { }
		}
		this.keys = keys ;
		this.settings =
		{
			  propertyValueType : 'propertyValueType'
			, hasMin : 'hasMin'
			, hasMax : 'hasMax'
			, minValue : 'minValue'
			, maxValue : 'maxValue'
			, isSpatial : 'isSpatial'
			, canVaryOverTime : 'canVaryOverTime'
			, isTimeVarying : 'isTimeVarying'
			, unitsText : 'unitsTime'
			, expressionEnabled : 'expressionEnabled'
			, expression : 'expression'
			, canSetExpression : 'canSetExpression'
			, expressionError : 'expressionError'
			, keyframeInterpolationType : 'keyframeInterpolationType'
		} ;
		for ( i in this.settings )
		{
			try { this.settings[i] = property[this.settings[i]] ; } catch(err) { this.settings[i] = undefined ;}
		}
		return this ;
	}
	
	/**
	 * getNames -- get the names of the proeprties
	 * @param property -- After-Effects property (default uses this.property)
	 * @return an array, and set to this.names 
	 */
	this.getNames = function( property )
	{
		if ( property == undefined )
		{
			property = this.property ;
		}
		var o = [ property.name ] ;
		var p = property ;
		var name = '' ;
		while ( p = p.parentProperty )
		{
			o.unshift( p.name ) ;
		}
		this.name = '' ;
		for ( var i = 1 ; i < o ; i ++ )
		{
			this.name += ( (i>1)?'.' : '' ) + this.names[i];
		}
		return this.names = o ;
	}
	
	/**
	 * clearAllKeys( ) -- clear all the keys in the current property
	 */
	this.clearAllKeys = function( )
	{
		var n = this.property.numKeys ;
		for( i = 1 ; i <= n ; i ++ )
		{
			try { this.property.removeKey( 1 ) } catch( err ) { return this ; }
		}
		return this ;
	}

	/**
	 * Set the keys
	 * @param options -- see valueFunction and timeFunction for details
	 * @see KRKCommon::valueFunction, KRKCommon::timeFunction
	 * @param functions -- functions object -- value: value function, time: time function (default uses presets)
	 */
	this.setKeys = function( options , functions )
	{
		var i;
		var time ;
		var key ;
		var value ;
		var t ;
		var valueFunction, timeFunction ;
		if ( ! this.keys ? null : ! this.keys.length )
		{
			return false ;
		}
		if ( functions != undefined )
		{
			if ( functions instanceof Object )
			{
				valueFunction = functions.value ? functions.value : this.layer.valueFunction ;
				timeFunction = functions.time ? functions.time : this.layer.timeFunction ;
				if ( functions.clear )
				{
					this.clearAllKeys( ) ;
				}
			}
			else
			{
				valueFunction = this.layer.valueFunction ;
				timeFunction = this.layer.timeFunction ;
				if ( functions )
				{
					this.clearAllKeys( ) ;
				}
			}
		}
		else
		{
			valueFunction = this.layer.valueFunction ;
			timeFunction = this.layer.timeFunction ;
		}
		options.time = this.layer.time ;
		if ( this.keys.length )
		{
			for ( i in this.keys )
			{
				key = this.keys[i];
				value = valueFunction( key.time , key.value , options ) ;
				t = timeFunction( key.time , key.value , options ) ;
				this.setKey( { value: value , time: t } , key.key ) ;
			}
		}
		else
		{
			options.mul = 1 ;
			value = valueFunction( options.startTime , options.start , options ) ;
			t = timeFunction( options.startTime , options.start , options ) ;
			this.property.setValueAtTime( t , value );
			value = valueFunction( options.endTime , options.end , options ) ;
			t = timeFunction( options.endTime , options.end , options ) ;
				this.property.setValueAtTime( t , value );
		}
		return this ;
	}

	this.enableAllProperties = function( disable )
	{
		disable = disable ? true : false ;
		var p = this.property ;
		do
		{
			try { p.enabled = !disable ; } catch( err ) { }
		} while ( p = p.parentProperty ) ;
		return this ;
	}


	/**
	 * @function setKey -- set a single key
	 * @param newKey (object) -- current, new key to be set
	 * @param keyIndex -- the current key index on newKey
	 * @param names -- names -- an array of the name list; undefined to use all.
	 */
	this.setKey = function( newKey , keyIndex , names )
	{
		var i , method , name ;
		var index = null ;
		if ( names == undefined )
		{
			names =
			[	  "value"
					, "interpolationType"
					, "spatialTangents"
					, "temporalEase"
					, "temporalContinuous"
					, "spatialContinuous"
					, "roving"
					, "selected"
					, "temporalAutoBezier"
					, "spatialAutoBezier" ] ;
		}
		if ( newKey.time != undefined )
		{
			index = this.property.addKey( newKey.time ) ;
		}
		for ( i = 0 ; i < names.length ; i ++ )
		{
			name = names[i] ;
			method = "set" + name[0].toUpperCase( ) + name.substring( 1 ) + "AtKey" ;
			a = newKey[name] == undefined ? this.keys[keyIndex-1][name] : newKey[name] ;
			if ( a == undefined ) { continue ; }
			if ( ( name != 'value' ) && ( a instanceof Array ) )
			{
				try{ this.property[method]( index != null ? index : keyIndex , a[0] , a[1] ) } catch( err ) { }
			}
			else
			{
				this.property[method]( index != null ? index : keyIndex , a ) ;
//				try{ this.property[method]( index != null ? index : keyIndex , a ) ; } catch( err ) { throw( "Error: " + method ) }
			}
		}
		return this ;
	}
	

	
	/**
	 * Commit properties
	 * @param syl -- undefined = only line, null = all syllables, "all" = line + all syllables, numbers or array of numbers = those pertaining syllables
	 * @note -- use the default this.property to set the properties
	 */
	this.commit = function( syl )
	{
		if ( syl == undefined )
		{
			syl = this.is_syl ? this.is_syl : "line" ;
		}
		this.property = this.getProperty( this.layer.layer , this.names ) ;
		var K = this.getKaraObject( ) ;
		var dim ;
		var layerName = this.parseLayerName( this.layer.layer.name ) ;
		if ( syl == true && layerName.syl ) { syl = layerName.syl ; }
		var k = K[layerName.style][layerName.layer][layerName.line] ;
		var ks ;
		var options = { } ;
		this.enableAllProperties( ) ;
		
		// Check for the links
		if ( this.link && ( this.link instanceof Object ) )
		{
			var c , c2 ;

			var layerStuff = this.layerNaming( 
					  this.link.length < 3 ? this.link[0] : this.link[1]
					, layerName.style
					, layerName.layer
					, layerName.line
					, layerName.syl ) ;
			var e ;
			var layerStuff2 = this.layerNaming( 
					  this.link.length < 3 ? this.link[0] : this.link[1]
					, layerName.style
					, layerName.layer
					, layerName.line ) ;
			var c ;
					if ( this.link.length > 2 ? ( c = this.layer.comp.project.comps[this.link[0]].comp ) : null )
					{
						try
						{
							if ( eval( "c.layer(layerStuff)." + this.link[2] ) )
							{
								this.property.expression = 'comp("' + this.link[0] + '").layer("' + layerStuff + '").' + this.link[2] ;
								this.property.expressionEnabled = true ;
							}
						}
						catch( err )
						{
							try
							{
								if ( eval( "c.layer(layerStuff2)." + this.link[2] ) )
								{
									this.property.expression = 'comp("' + this.link[0] + '").layer("' + layerStuff2 + '").' + this.link[2] ;
									this.property.expressionEnabled = true ;
								}
							}
							catch( err )
							{
							}
						}
					}
					else if ( this.layer.comp.layers[this.link[0]] )
					{
						try
						{
							c = this.layer.comp.comp.layer(layerStuff) ;								
							if ( eval( "c." + this.link[1] ) )
							{
								this.property.expression = 'thisComp.layer("' + layerStuff + '").' + this.link[1] ;
								this.property.expressionEnabled = true ;
							}
						}
						catch( err )
						{
							try
							{
								c = this.layer.comp.comp.layer(layerStuff2) ;								
								if ( eval( "c." + this.link[1] ) )
								{
									this.property.expression = 'thisComp.layer("' + layerStuff2 + '").' + this.link[1] ;
									this.property.expressionEnabled = true ;
								}
							}
							catch( err )
							{
							}
						}
					} 
			return this ;
		}
	
		if ( syl && syl != 'line' )
		{
			var i , s , t ;
			if ( layerName.syl )
			{
				if ( syl==true || syl == "all" )
				{
					s = [k[layerName.syl]] ;
				}
				else
				{
					s = syl instanceof Array ? syl : [syl];
				}
				this.clearAllKeys( ) ;
/*				if ( this.position && this.property.expression && this.property.canSetExpression )
				{
					var exp = this.property.expression ;
					exp = exp.replace( /(\bvar\s+)?\b[o]\s*=\s*[^;\n]* /g , '' ) ;  // Remove any user-defined widths and heights for tests.
					this.property.expression = "var o={w:" + k.width + ",h:" + "h=" + k.height + "};\n\n" + exp;
					this.property.expressionEnabled = true ;
				}*/
			}
			else
			{
				if ( syl==true || syl == "all" )
				{
					s = k ;
				}
				else
				{
					s = syl instanceof Array ? syl : [syl];
				}
				this.clearAllKeys( ) ;
/*				if ( this.position && this.property.expressionEnabled && this.property.canSetExpression )
				{
					var exp = this.property.expression ;
					exp = exp.replace( /(\bvar\s+)?\b[o]\s*=\s*[^;\n]* /g , '' ) ;  // Remove any user-defined widths and heights for tests.
					this.property.expression = "var o={w:" + k.width + ",h:" + "h=" + k.height + "};\n\n" + exp;
				}*/
			}
			var style_2 ;
			if ( style_2 = this.layer.layers2[this.layer.layer.name] )
			{
				var ii ;
				for ( ii = 0 ;  ii < 2 ; ii ++ )
				{
					k = ii ? K[style_2][layerName.layer][layerName.line]
					         : K[layerName.style][layerName.layer][layerName.line] ;
							 
					for ( i=0 ; i < k.length ; i ++ )
					{
						ks = k[i] ;
						options.mul = options.start = options.end = null ;
						options.startTime = ks.time ;
						options.endTime = ks.time + ks.dur ;
						this.setKeys( options ) ;
					}
				}
			}
			else
			{
				if ( this.position )
				{
					var pi , pos , basedOn ;
					if ( ! ( this.position instanceof Array ) )
					{
						this.position = [this.position] ;
					}
					for ( pi = 0 ; pi < this.position.length ; pi ++ )
					{
						pos = this.position[pi];
						if ( basedOn = this.layer.comp.layers[pos] )
						{
							basedOn = basedOn.name ;
							try {
							if ( dim = this.layer.getDim( this.layerNaming( basedOn , layerName.style , layerName.layer , layerName.line , layerName.syl ) ) )
							{
								break ;
							} } catch( err ) { }
						}
					}
					try
					{
						if ( !dim )
						{
							dim = this.layer.getDim( this.layerNaming( this.layer.name , layerName.style , layerName.layer , layerName.line , layerName.syl ) )
						}
					} catch( err ) { }
				}

				for ( i=0 ; i < s.length ; i ++ )
				{
					if ( syl == true || syl == "all" )
					{
						t = i ;
						ks = s[t] ;
					}
					else
					{
						t = s[i] ;
						ks =k[t] ;
					}
					if ( this.position && dim && dim[i] )
					{
						options.mul = 1.0/100;
						options.start = [dim[i].left , dim[i].top] ;
						options.end = [dim[i].left+dim[i].width , dim[i].top+dim[i].height] ;
					}
					else
					{
						options.mul = options.start = options.end = null ;
					}
					options.startTime = ks.time ;
					options.endTime = ks.time + ks.dur ;
					this.setKeys( options ) ;
				}
			}
		}
		if ( !syl || syl == 'line' || syl == 'all' )
		{
				options.mul = options.start = options.end = null ;
				options.startTime = k.start ;
				options.endTime = k.end ;
				this.clearAllKeys( ) ;
				this.setKeys( options ) ;
		}
	
	
	/******************************************
		Set the options
	/*****************************************
		var opt ;
		for ( opt in this.options )
		{
			if ( this.property[opt] != undefined )
			{
				try { this.property[ opt ] = this.options[opt] ; }
				catch( err )
				{
					this.property[opt](this.options[opt]) ;
				}
			}
		}
		/**** WON'T WORK *************/
	}
	this.constructor( property , options ) ;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
KRK.Property = KRKProperty;
KRKProperty.prototype = new KRK.Common( ) ;