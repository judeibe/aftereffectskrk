/**
 * KRKLayer( layer ) -- Main Karaoke Layer Prototype: LEVEL 3
 * @param layer -- After-Effects Layer object (can be numeric (index), string, or After-Effects Layer object)
 */
function KRKLayer( layer , time )
{
	this.parentName = 'comp' ;
	this.layer = null ;
	this.name = null ;
	this.parent = null ;
	this.time = { }  ;
	this.childName = 'properties' ;
	this.caller = 'property' ;
	this.objectName = 'layer' ;
	this.layers = null ;
	this.kara = null ;
	this.animators = { } ;
	this.properties = { } ;
	this.syl = null ;
	this.old = null ;
	this.unique = true ;
	this.created = false ;  // false for user input, true for automated
	this.commitAnimators;
	this.commitProperties;
	this.second = null ;
	this.setprop = [ ] ;
	/**
	 * A function to resynchronize the properties on this object
	 * @param property -- KRKProperty object
	 */
	this.pr = function( property )
	{
		var krk , i , Krk ;
		Krk = [ ] ;
		if ( ! ( property instanceof Array ) )
		{
			property = [ property ] ;
		}
		for ( i in property )
		{
			if ( property[i] instanceof Object )
			{
				krk = property[i] ;
			}
			else
			{
				krk = this.properties[property[i]] ;
			}	
			krk.layer = this ;
			krk.property = this.getProperty( this.layer , krk.names ) ;
			Krk.push(krk);
		}
		return Krk.length > 1 ? Krk : Krk[0] ;
	}
	
	/**
	 * A function to resynchronize the animators in this object
	 * @param animator -- KRKAnimator object
	 */
	this.an = function( animator )
	{
		var krk , i , Krk ;
		Krk = [ ] ;
		if ( ! ( animator instanceof Array ) )
		{
			animator = [ animator ] ;
		}
		for ( i in animator )
		{
			if ( animator[i] instanceof Object )
			{
				krk = animator[i] ;
			}
			else
			{
				krk = this.animators[animator[i]] ;
			}	
			krk.layer = this ;
			if (krk.end instanceof Object)
			{
				krk.end = this.getProperty( this.layer , krk.animator.end.names ) ;
				krk.end.layer = this ;
			}
			if (krk.start instanceof Object)
			{
				krk.start = this.getProperty( this.layer , krk.animator.start.names ) ;
				krk.start.layer = this ;
			}
			if (krk.offset instanceof Object)
			{
				krk.offset = this.getProperty( this.layer , krk.animator.offset.names ) ;
				krk.offset.layer = this ;	
			}
			Krk.push(krk);
		}
		return Krk.length > 1 ? Krk : Krk[0] ;
	}
	
	/**
	 * uses a layer from the pool
	 * @param key -- the key in the pool
	 */
	this.uses = function( key )
	{
		this.layer = key instanceof Object ? key : this.layers[key] ;
	}

	this.destruct = function( ) 
	{
		if ( this.old.Text) 
		{
			var o = this.old("Text")("Animators")( "KRK Syllable" ) ;
			while( o )
			{
				try { o.remove( ) ; } catch( err ) { break ; }
			}
		}
		return this ;
	}

	/**
	 * constructor function
	 * @param layer -- After-Effects Layer object (can be numeric (index), string, or After-Effects Layer object)
	 * @param time -- time settings (default reads from the Markers in your comp)
	 * @see KRKLayer::readPresetTimes
	 */
	this.constructor = function( layer , time )
	{
		var i;
		if ( layer == undefined ) { return false ; } 
		this.layer = this.comp.getAObject( layer ) ;		
		for ( i = 0 ; this.comp.layers[ this.name = i ? this.layer.name + "_" + String( i ) : this.layer.name ] ; i ++ ) ;
		if ( time != undefined )
		{
			this.time = time ;
		}
		else
		{
			this.readPresetTimes( ) ;
		}
		this.addlayers = [ ] ;
		this.layers = { } ;
		this.layers2 = { } ;
		this.animators = { } ;
		this.commitProperties = { } ;
		this.commitAnimators = { } ;
		this.kara = null ;
		this.old = this.layer ;
//		if ( ! this.name.match( /_/ ) )
//		{
			// Adding a syllable text animator for positionings
			this.createSyllableAnimator( ) ;
//		}
		return this ;
	}

	/**
	 * adda -- Add Animator(s)
	 * @param object
	 * @see KRKCommon::add
	 * @return the KRKAnimator objects
	 */
	this.adda = function( animators , options )
	{
		return this.layer('Text') ? this.add( animators , options , 'animators' ) : null ;
	}

	this.addp = function( properties , options )
	{
		return this.add( properties , options , 'properties' ) ;
	}

	this.p = function( properties , options )
	{
		var prop = [ ] ;
		var i ;
		this.recursivePropertyKeysSearch( properties , prop ) ;
		
		for ( i in prop )
		{
			this.addp( prop[i] , options );
		}
		return this ;
	}

	this.a = function( animators , options )
	{
		this.adda( animators , options ) ;
		return this ;
	}

	/**
	 * prop( krk ) -- Resynchronize the same object
	 * @param krk -- KRKLayer object
	 */
	this.prop = function( krk )
	{
		this.properties = krk.properties ;
		this.animators = krk.animators ;
		this.comp = krk.comp ;
	}
	
	/**
	 * disables all the text animators
	 * @param layer -- layer (optional -- this.layer is the default)
	 * @return this if success, false if not.
	 */
	this.disableAllTextAnimators = function( layer )
	{
		if ( !layer )
		{
			layer = this.layer ;
		}
		var i = 1 ;
		var o ;
		if ( ! layer.Text ) { return false ; }
		var p = layer("Text")("Animators");
		try
		{
			while( o = p(i++) )
			{
				o.enabled = false ;
			}
		}
		catch( err ) { }
		return this ;
	}

	/**
	 * Set after-effects property
	 * @param propertyName -- property name of the generated layer
	 * @param property -- AFX property name
	 * @param value -- value you want to set with
	 * @example s( 'Effects.Glow' , 'enabled' , false ) ;
	 */
	this.s = function( propertyName , property , value )
	{
		this.setprop.push( { name : propertyName , property : property , value : value } ) ;
		return this ;
	}

	this.createSyllableAnimator = function( layer )
	{
		if ( !layer )
		{
			layer = this.old ;
		}	
		if ( !layer.Text )
		{
			return false ;
		}
		while( layer("Text")("Animators")("KRK Syllable" ) )
		{
			try { layer("Text")("Animators")("KRK Syllable").remove( ) } catch( err ) { break ; }
		}
		var anim = this.layer("Text")("Animators").addProperty( "Text Animator" ) ;
		anim.name = "KRK Syllable" ;
		var scale = anim("ADBE Text Animator Properties").addProperty("ADBE Text Scale 3D") ;
		var newsel = anim("Selectors").addProperty("ADBE Text Selector");
		var avg = ( this.time.endTime + this.time.startTime ) / 2 
		newsel.property("Start").setValueAtTime( this.time.startTime , 0 ) ;
		newsel.property("Start").setValueAtTime( avg , 100 ) ;		
		newsel.property("End").setValueAtTime( this.time.endTime , 100 ) ;
		newsel.property( "End" ).setValueAtTime(  avg , 0 ) ;
		newsel.advanced.mode.setValue( 2 ) ;
		newsel.advanced.units.setValue( 1 ) ;		
		try { scale.setValue( [0,0] ) ; } catch( err ) { scale.setValue( [0,0,0] ) ; }
		this.a( "KRK Syllable" , true ) ;
	}

	this.getDim = function( layerName )
	{
		var i ;
		var rect ;
		var K = this.getKaraObject( ) ;
		var layer ;
		if ( ! ( layer = this.layers[layerName] ) )
		{
			layer = this.comp.comp.layer( layerName ) ;
		}
		var o = layerName instanceof Object ? layerName : this.parseLayerName( layerName , K ) ;

		var syllable = layer("Text")("Animators")("KRK Syllable") ;
		syllable.enabled = true ;
		if ( o.syl )
		{
			rect[o.names.line] = layer.sourceRectAtTime( o.syl.time + o.syl.dur/2 , true ) ;
			syllable.enabled = false ;
		}
		else if ( o.line )
		{
			var j , k , height, width ;
			k = -1 ;
			rect = { } ;
			for ( i = 0 ; i < o.line.length ; i ++ )
			{
				if ( o.line[i].text.match( /^\s*$/ ) )
				{
					for ( j = i + 1 ; j < o.line.length ; j ++ )
					{
						if ( o.line[j].text.match( /^\s*$/ ) )
						{
							continue ;
						}
						else
						{
							break ;
						}
					}
					if ( j < o.line.length )
					{
						rect[i] = layer.sourceRectAtTime( o.line[j].time + o.line[j].dur/2 , true ) ;
						if ( k >= 0 )
						{
							rect[i].top = ( rect[i].top + rect[k].top ) / ( j - k ) ;
							rect[i].left = ( rect[i].left + rect[k].left ) / ( j - k ) ;
							width = ( rect[i].width - rect[k].width ) ;
							height = ( rect[i].height - rect[k].height ) ;
							rect[i].width = ( width > 3 ? ( rect[i].left - rect[k].left ) : width ) / ( j - k - 1 ) ;
							rect[i].height = ( height > 3 ? ( rect[i].top - rect[k].top ) : height ) / ( j - k - 1 ) ;
						}
					}
					else
					{
						if ( k >= 0 )
						{
							rect[i] = rect[k] ;
						}
						else
						{
							rect[i] = null ;
						}
					}
					continue ;
				}
				else
				{
					k = i ;
				}
				rect[i] = layer.sourceRectAtTime( o.line[i].time + o.line[i].dur / 2 , true ) ;
			}
		}
		syllable.enabled = false ;
		return rect ;
	}

	this.commit = function( )
	{
		var i , j , l ;
		var name = { } ;
		var object = { } ;
		var layerName ;
		var layer ;
		var property ;
		var newLayer , k ;
		this.old.selected = this.old.enabled = false ;
		var tmp  ;
		
		// Check for default properties:
		if ( this.old("Text") )
		{
			// Check for autospaces:
			this.spacing = this.getAutoSpacing( ) ;
			try { this.p( "effect('Position')('Point')" , {pos: this.old.name, syl:true} ) ; } catch( err ) { }
		}

		// Adding new layers
		for ( k in this.addlayers )
		{
			this.addl( this.addlayers[k]['key'] , this.addlayers[k]['options'] ) ;
		}		
		
		// Exclude any names with _.
		if ( this.old("Text") ) // && ! this.name.match( /_/ ) )
		{
			// Creating the syllable animators to detect the sizes .
			for ( k in this.layers )
			{
				this.layer = this.layers[k] ;
				this.animators['KRK Syllable'].commit( ) ;
				this.layer("Text")("Animators")("KRK Syllable").enabled = false ;
			}
		}
		
		// delete this object so that it won't be generated ever again.		
		delete this.animators['KRK Syllable'] ;
		
		// Setting them as enabled, and set proper properties
		for ( k in this.layers )
		{
			newLayer = this.layers[k] ;
			if ( newLayer != this.old )
			{
				newLayer.selected = newLayer.enabled = true ;
				for ( l in this.setprop )
				{
					property = this.getProperty( newLayer , this.setprop[l].name ) ;
					property[ this.setprop[l].property ] = this.setprop[l].value ;					
				}
			}
		}
		
		// commit properties and animators
		for ( i in this.layers )
		{
			layer = this.layers[i];
			if ( !layer ) { continue ; }
			layerName = this.parseLayerName( layer.name ) ;
			this.layer = layer ;
			tmp = this.commitProperties[layerName] ;
			for ( j in tmp ? tmp : this.properties )
			{
				property = tmp ? this.properties[tmp[j]] : this.properties[j] ;
				property.property = this.getProperty( this.layer , property.names ) ;
				property.commit( ) ;
			}
			tmp = this.commitAnimators[layerName];
			for ( j in tmp ? tmp : this.animators )
			{
				this.animators[tmp ? tmp[j] : j].commit( ) ;
			}
		}	
	}



	this.timeFunction = this.defaultTimeFunction ;
	this.valueFunction = this.defaultValueFunction ;


	/**
	 * setText -- set your text in this.layer
	 * @param kline -- Karaoke line
	 * @param spacing -- If there's a zero-word spacing
	 *                   Default searches for "Spacing" expression control
	 *                   Can be the name of the expression control or a number for your spacing
	 */
	this.setText = function( kline )
	{
		var anim , tracking , lineLen , m , newsel ;
		var layer ;
		var name ;
		var textLayer ;
		var m , n ;
		var K = this.parseLayerName( this.layer.name , this.getKaraObject( ) ) ;
		// If it's not a text, return false.
		if ( ! ( textLayer = this.layer('Text') ) )
		{
			return false ;
		}		
		// Zero-Word Spacing Control
		if ( this.spacing )
		{
			// Setting Zero-Word Spacing for per-syllable karaoke
			anim = this.layer("Text")("Animators").addProperty( "Text Animator" ) ;
			anim.name = "Zero Spacing" ;
			// Adding Tracking for the spacing
			tracking = anim("ADBE Text Animator Properties").addProperty("ADBE Text Tracking Amount") ;
			tracking.setValue( this.spacing ) ;
			if ( kline instanceof Array )
			{
				lineLen = kline[0].text.length + kline[0].length + kline[1].text.length + kline[1].length;
				text = '' ;
				var len = 0 ;
				for ( n = 0 ; n < 2 ; n ++ )
				{
					for ( m = 0 ; m < kline[n].length ; m ++ )
					{
						text += kline[n][m].text + ' ' ;
						len += kline[n][m].text.length + 1 ;
						newsel = anim("Selectors").addProperty("ADBE Text Selector");
						newsel.property("Start").setValue( ( len - 1 ) / lineLen * 100 ) ;
						newsel.property("End").setValue( ( len ) / lineLen * 100 ) ;
						newsel.name = "Spacing " + n + ',' + m; // Spacing 0,0, Spacing 1,0 ...
					}
					if ( !n ) { text += "\r\n" ; }
				}
				this.layer("sourceText").setValue( text ) ;
			}
			else
			{
				lineLen = kline.text.length + kline.length;
				for ( text = '' , m = 0 ; m < kline.length ; m ++ )
				{
					text += kline[m].text + ' ' ;
					newsel = anim("Selectors").addProperty("ADBE Text Selector");
					newsel.property("Start").setValue( ( text.length - 1 ) / lineLen * 100 ) ;
					newsel.property("End").setValue( ( text.length ) / lineLen * 100 ) ;
					newsel.name = "Spacing " + m; // Spacing 0, Spacing 1 ...
				}
				this.layer("sourceText").setValue( text ) ;
			}
		}
		else
		{
			this.layer("sourceText").setValue( kline instanceof Array ? kline[0].text + "\r\n" + kline[1].text : kline.text ) ;
		}
		return this ;
	}
	/**
	 * getAutoSpacing
	 * =============
	 * Gets autospacing from layer
	 */
	this.getAutoSpacing = function( )
	{
		if ( this.layer.text.moreOption( "Anchor Point Grouping" ).value != 2 ) { return false ; }
		var add = -1 ;
		var t1 = 0 ;
		var text ;
		var sourceRect ;
		var s ;
		var t ;
		var anim ;
		var tracking ;
		var newsel ;
		var cur = 0 ;
		var p ;
		if ( this.old.property( 'Text' ) )
		{
			var layer = this.old.duplicate( ) ;
			layer.name = "Temp Spacing[Word][0][0]" ;
			this.disableAllTextAnimators( layer ) ;
			text = layer.property("Text");
			text.sourceText.setValue( "KRKKRK" ) ;
			sourceRect = layer.sourceRectAtTime( 0 , true ) ;
			text.sourceText.setValue( t = "KRK KRK" ) ;
			anim = text("Animators").addProperty( "Text Animator" ) ;
			anim.name = "Zero Spacing" ;
			anim.enabled = true ;
			// Adding Tracking for the spacing
			tracking = anim("ADBE Text Animator Properties").addProperty("ADBE Text Tracking Amount") ;
			newsel = anim("Selectors").addProperty("ADBE Text Selector");
			newsel.start.setValue( 300 / t.length ) ;
			newsel.end.setValue( 100 * ( t.length - 3.0 ) / t.length ) ;
			add = -0.5 ;
			do
			{
				add *= 2 ;
				tracking.setValue( t1 += add );
				s = layer.sourceRectAtTime( 0 , true ) ;
			} while ( s.width > sourceRect.width ) ;
			
			do
			{
				add /= 2 ;
				tracking.setValue( t1 += s.width < sourceRect.width ? -add : +add ) ;
				s = layer.sourceRectAtTime( 0 , true ) ;				
			}
			while( Math.abs( add ) > 0.00025 ) ;
		}
		t1 = Math.round( t1 * 1000 ) / 1000 ;
		do
		{
			try{ layer.remove( ) } catch( err ) { break ; }
		} while( layer ) ;
		return t1 ;
	}

	this.resetMarkers = function( startTime , endTime )
	{
		var marker = this.layer("Marker") ;
		var i ;
		var n = marker.numKeys ;
		var startMarker = null , endMarker = null ;
		var K = this.getKaraObject( ) ;
		var names = this.parseLayerName( marker.parentProperty.name ) ;
		var text = names.syl ? K[names.style][names.layer][names.line][names.syl].text : K[names.style][names.layer][names.line].text ;
		for ( i = 1 ; i <= n ; i ++ )
		{
			if ( i == this.time.startMarker )
			{
				startMarker = marker.keyValue( 1 ) ;
			}
			else if ( i == this.time.endMarker )
			{
				endMarker = marker.keyValue( 1 ) ;
			}
			marker.removeKey( 1 ) ;
		}
		marker.setValueAtTime( startTime , new MarkerValue( text ) ) ;
		if ( endMarker )
		{
			marker.setValueAtTime( endTime , new MarkerValue("") ) ;
		}
	}
	/**
	 * create a new layer based on the current template layer
	 * @param spacing -- zero-spacing configuration (default = 'Spacing' expression control, can be a number or the name of the control)
	 * @param style -- Style in Karaoke JSON
	 * @param layerNumber -- Layer number in Karaoke JSON
	 * @param lineNumber -- Line number in Karaoke JSON
	 * @param syllableNumber -- Syllable number in Karaoke JSON (default is off--generate the whole line or else--generate one line)
	 */
	this.create = function( spacing , style , layerNumber , lineNumber , syllableNumber , unnorm )
	{
		var K = this.getKaraObject( ) ;
		var k ;
		var name , kara , o ;
		var startTime , endTime ;
		var text = style instanceof Object ? [ K[style[0]][layerNumber][lineNumber] , K[style[1]][layerNumber][lineNumber] ] : K[style][layerNumber][lineNumber]
		if ( style != undefined && lineNumber != undefined )
		{
			var sylNum = syllableNumber && Number( syllableNumber ) < 0 ;
			if ( syllableNumber != undefined && syllableNumber != null && !sylNum )
			{
				name = this.layerNaming( this.name , style instanceof Object ? style[0] : style , layerNumber , lineNumber , syllableNumber ) ;
				k = K[ style instanceof Object ? style[0] : style ][layerNumber][lineNumber][syllableNumber] ;
				o = { startTime: k.time , endTime: k.time + k.dur } ;
				if ( unnorm )
				{
					o.unnorm = 'start' ;
				}
				startTime = this.originalTimeFunction( this.time.inTime == undefined ? this.old.inPoint : this.time.inTime , 0 , o ) ;
				if ( unnorm )
				{
					o.unnorm = 'end' ;
				}
				endTime = this.originalTimeFunction( this.time.outTime == undefined  ? this.old.outPoint : this.time.outTime , 0 , o ) ;
				kara = [  style instanceof Object ? style[0] : style  , layerNumber , lineNumber , syllableNumber ] ;
			}
			else
			{
				name = this.layerNaming( this.name ,  style instanceof Object ? style[0] : style  , layerNumber , lineNumber , sylNum ? -Number( syllableNumber ) : undefined ) ;
				k = K[ style instanceof Object ? style[0] : style ][layerNumber][lineNumber] ;
				o = { startTime: k.start , endTime: k.end } ;
				if ( unnorm )
				{
					o.unnorm = 'start' ;
				}
				startTime = this.originalTimeFunction( this.time.inTime == undefined ? this.old.inPoint : this.time.inTime , 0 , o ) ;
				if ( unnorm )
				{
					o.unnorm = 'end' ;
				}
				endTime = this.originalTimeFunction( this.time.outTime == undefined  ? this.old.outPoint : this.time.outTime , 0 , o ) ;
				kara = [  style instanceof Object ? style[0] : style  , layerNumber , lineNumber ] ;				
			}
		}
		if ( o )
		{
			var layer = this.old.duplicate( ) ;
			this.layer = layer ;
			this.disableAllTextAnimators( ) ;
//			name += String( Math.floor( Math.random() * 9000 ) + 1000 ) ;
			layer.name = name ;
			layer.inPoint = startTime ;
			layer.outPoint = endTime ;
			if ( layer("Text") )
			{
				if ( spacing )
				{
					this.setText( text , spacing ) ;
				}
				else
				{
					this.setText( text ) ;
				}
			}
			this.resetMarkers( o.startTime , o.endTime ) ;
			this.layers[layer.name] = layer;
			this.syl = syllableNumber != undefined || syllableNumber != null ? null : syllableNumber ;
			return layer ;
		}
		return null ;		
	}

	/**
	 * addl -- adds layers from the current template
	 * @param name -- name or object of the After-Effects Layer object
	 * @param key -- Keys for the Karaoke JSON: Style->Layer number->Line number->Syllable number.
	 *               null for everything
	 *               ['romaji'], { romaji: null } for only romaji
	 *               { romaji: [0,1] } for only romaji and Layer #0 and #1
	 *               { romaji: {0: [0,1,2,3:[3,4,5]]} }, etc
	 * @param is_syl -- If only syllable layers are created (default is false)
	 * @param spacing -- If spacing is undefined, use default zero-word spacing
	 *                   'Spacing' expression control must be present in your layer template for the spacing
	 *                   spacing can be the expression control name or a number.
	 * @param anim -- list of animators that can be applied there through commit function
	 * @param prop -- list of properties that can be applied there through commit function
	 * @param unnorm -- tells the script to add unnormalized lead-in and lead-out to the line/syllable.
	 * @note All the generated layers are stored in layers[].layers[]
	 */
	this.addl = function( keys , options )
	{
		var K = this.getKaraObject( ) ;
		var anim = options.anim == undefined ? null : ( options.anim instanceof Array ? options.anim : [options.anim] ) ;
		var prop = options.prop == undefined ? null : ( options.prop instanceof Array ? options.prop : [options.prop] ) ;
		var name ;
		var level = options.syl ? KRK_SYLLABLE : KRK_LINE ;
		for ( i in keys )
		{
			k = keys[i] ;
			if ( k.length == level )
			{
				this.layer = this.create( options.spacing == undefined ? null : options.spacing , options[2] ? [ k[0] , options[2] ] : k[0] , k[1] , k[2] , options.syl ? ( options.syl == "all" ? -k[3] : k[3] ) : undefined ) ;
				if ( options[2] )
				{
					this.layers2[this.layer.name] = options[2] ;
				}
				if ( anim ) { this.commitAnimators[this.layer.name] ; }
				if ( prop ) { this.commitProperties[this.layer.name] ; }
			}
		}
		return this ;
	}
	
	this.l = function( key , options )
	{
		var K = this.getKaraObject( ) ;
		var template ;
		var level ;
		var l ;
		if ( !options )
		{
			options = { } ;
		}
		if ( !( options instanceof Object ) )
		{
			options = {syl: options} ;
		}
		level = options.syl ? KRK_SYLLABLE : KRK_LINE ;
		template = this.layers.old ;
		// var keys = this.recurseObject( K , level , key == undefined ? null : key ) ;
		var keys = this.recurseKaraoke( level  , key ) ;
//		this.addl( key , options ) ;

		this.addlayers.push( { key: keys , options: options } ) ;
		return this ;
	}

	/**
	  * @function addKara: Adds a karaoke (Text animator) to this object
	  * @note None of the karaoke has been generated until you tell it to
	  * @param animator -- An After-Effects Text animator object or name
	  * @param unnorm (time unnormalized factor)
	  * @see KRKAnimator
	  * @DEPRECATED -- use adda( )
	  */
	this.addKara = function( animator , unnorm )
	{
		var a ;
		var o = animator instanceof Array ? animator : [animator] ;
		for ( a in o )
		{
			this.animators[o[a]] = new KRKAnimator( o[a] , unnorm ) ;
			this.animators[o[a]].layer = this ;
		}
	}
	
	
	this.timeFunction = this.defaultTimeFunction ;
	this.valueFunction = this.defaultValueFunction ;
	
	/**
	 * readPresetTimes -- read all the times from the markers
	 * @param layer -- After-Effects layer object or name (default uses this.layer)
	 * @note It stores everything to this.time
	 */
	this.readPresetTimes = function( layer )
	{
		var a, b ;
		var o = { } ;
		var markers , i ;
		var marker , makers , time , chap , comment ;
		if ( layer == undefined )
		{
			layer = this.layer ;
		}
		else if ( ! ( layer instanceof Object ) )
		{
			layer = this.comp.comp.layer( layer ) ;
		}
	
		// Setting Defaults
		o.unnorm = null ;
		o.startTime = o.inTime = layer.inPoint ;
		o.endTime = o.outTime = layer.outPoint ;
	
		if ( markers = layer("Marker") )
		{
			for ( i = 1 ; i <= markers.numKeys ; i ++ )
			{
				marker = markers.keyValue( i ) ;
				comment = marker.comment.toLowerCase() + " " + marker.chapter.toLowerCase() ;
				if ( comment.match( /start|\[/i ) )
				{
					o.startTime = markers.keyTime( i ) ;
					if ( a = comment.match( /unnorm(=(\w+))?/i ) )
					{
						o.unnorm = a[2] ? a[2] : 'start' ;
					}
					o.startMarker = i ;
				}
				if ( comment.match( /end|\]/i ) )
				{
					o.endTime = markers.keyTime( i ) ;
					if ( a = comment.match( /unnorm(=(\w+))?/i ) )
					{
						o.unnorm = a[2] ? a[2] : 'end';
					}
					o.endMarker = i ;
				}
				if ( comment.match( /in|\</i ) )
				{
					o.inTime = markers.keyTime( i ) ;
					o.inUnnorm = comment.match( /unnorm(=(\w+))?/i ) ? true : false ;
					o.inMarker = i ;
				}
				if ( comment.match( /out|\>/i ) )
				{
					o.outTime = markers.keyTime( i ) ;
					o.outUnnorm = comment.match( /unnorm/i ) ? true : false ;
					o.outMarker = i ;
				}
			}
		}
		this.time = o ;
		return this ;
	}
	
	/**
	 * Set time function and value function
	 * @param timeFunction -- Anonymous time function
	 * @param valueFunction -- Anonymous value function
	 */
	this.setFunctions = function( timeFunction , valueFunction )
	{
		if ( this.timeFunction )
		{
			if ( timeFunction == 'default' )
			{
				this.timeFunction = this.defaultTimeFunction ;
			}
			else
			{
				this.timeFunction = timeFunction ;
			}
		}
		
		if ( this.valueFunction )
		{
			if ( valueFunction = 'default' )
			{
				this.valueFunction = this.defaultValueFunction ;
			}
			else
			{
				this.valueFunction = valueFunction ;
			}
		}
	}

/**
 *  recursivePropertyKeysSearch( property , results )
 * Searches through the property's child to find any keyframes
 * @param results -- Array of results (output)
 */
	this.recursivePropertyKeysSearch = function( property , results )
	{
		var i = 1 ;
		var o ;
		var p = this.getProperty( this.layer , property ) ;
		if ( p.property )
		{
			for ( i = 1 ; i <= p.numProperties ; i ++ )
			{
				this.recursivePropertyKeysSearch( p.property(i) , results ) ;
			}
		}
		else if ( p.numKeys > 0 )
		{
			results.push( p ) ;
		}
	}
	this.constructor( layer ) ;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/* Inheritance Levels */
KRK.Layer = KRKLayer ;
KRKLayer.prototype = new KRK.Common( ) ;