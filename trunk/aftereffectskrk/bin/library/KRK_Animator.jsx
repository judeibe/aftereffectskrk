/**
 * KRKLayer( layer ) -- Main Karaoke Animator Prototype: LEVEL 4
 * @note This prototype uses KRKProperty for start, end, and offset keyframes in the range selector
 * @note2 It only applies to Text Layer.
 * @param animator -- After-Effects Text Animator object (can be numeric (index), string, or After-Effects Text Animator object)
 */
function KRKAnimator( animator , options )
{
	this.objectName = 'animator' ;
	this.parentName = 'layer' ;
	this.selectors = null ;
	this.sel = null ;
	this.start = null ;
	this.end = null ;
	this.offset = null ;
	this.animator = null ;
	this.namesAnimator ;
	this.namesKaraoke ;
	this.layer ;
	this.K ;
	this.childName = 'properties' ;
	this.caller = 'property' ;
	this.old ;
	this.dup_sel ;
	/**
	 * setUnits -- set the correct units in the selector
	 */
	this.setUnits = function( )
	{
		this.sel("Advanced")("units").setValue( 1 ) ;
	}

	/**
	 * constructor function
	 * @param animator -- After-Effects Text-Animator object (can be numeric (index), string, or After-Effects Text-Animator object)
	 * @param unnorm -- Unnormalized timing indication (true or false) [default is false]
	 */
	this.constructor = function( animator , options )
	{
		if ( animator != undefined )
		{
			this.ref( animator , options ) ;
			this.name = this.animator.name ;
			var o = ['start' , 'end' , 'offset'] ;
			delete this.old;
			this.old = { } ;
			for ( var i in o )
			{
				this.old[o[i]] = this[o[i]] = new KRKProperty( this.sel(o[i]) ) ;
				this[o[i]].parent = this ;
			}
			this.old.sel = this.sel ;
			this.old.animator = this.animator ;
			this.selectorType = this.sel.advanced.basedOn.value ;
			this.selectors = { } ;
		}
		return this ;
	}
	
	
	this.pr = function( krk )
	{
		var i ;
		var sel ;
		if ( krk instanceof Object )
		{
			sel = (krk.sel) ? krk.sel : sel ;
			var prop = ['start', 'end' , 'offset' ] ;
			for ( i in prop )
			{
				this[prop[i]].property = sel(prop[i]) ;
				this[prop[i]].animator = this ;
				this[prop[i]].layer = this.layer ;
			}
		}
		return this ;
	}
	
	this.dup = function( name )
	{
		this.sel = this.sel.parentProperty(1).duplicate( ) ;
		if ( name != undefined )
		{
			this.sel.name = name ;
		}
		return this ;
	}
	

	/**
	 * prop( krk ) -- Resynchronize the same object
	 * @param krk -- KRKAnimator object
	 */
	this.prop = function( krk )
	{
		this.start = krk.start ;
		this.end = krk.end ;
		this.offset = krk.offset
		this.layer = krk.layer ;
	}

	this.getSelector = function( )
	{
		return this.layer.layer('Text')('Animators')(this.name)('selector')(1) ;
	}

	/**
	 * ref -- reference the selector
	 * @param name -- name of the selector.  Can be an After-Effects range selector object or range selector object name
	 * @param unnorm -- denote unnormalizations (default is off)
	 */
	this.ref = function( name , options )
	{
		var anim , o ;
		if ( name != undefined )
		{
			if ( anim = name instanceof Object ? name : this.layer.layer('Text')('Animators')(name) )
			{
				this.sel = anim('selector')(1) ;
				this.animator = anim ;
			}
		}
		this.syl = false ;
		this.unnorm = null ;
		if ( options )
		{
			if ( options instanceof Object )
			{
				this.unnorm = options.unnorm ;
				this.syl = options.syl;
			}
			else
			{
				this.syl = options ;
				this.unnorm = null ;
			}
		}
		return this ;
	}

	this.shiftValueFunction = function( t , value , o )
	{
		var start = o.start == undefined ? 0 : ( o.start instanceof Array ? o.start[0] : o.start ) ;
		var end = o.end == undefined ? 0 : ( o.end instanceof Array ? o.end[0] : o.end ) ;
		return  ( value * ( end - start ) / 100 + start  ) * 100 ;
	}

	/**
	 *  uses the correct selector
	 *  selector -- After-Effects selector, can be Object, Array, or the name referenced from this.selectors
	 */
	this.uses = function( selector )
	{
		if ( selector == undefined )
		{
			return this ;
		}
		if ( selector instanceof Object )
		{
			this.sel = selector ;
		}
		else if ( selector instanceof Array )
		{
			this.sel = this.getProperty( this.layer.layer , selector ) ;
		}
		else
		{
			this.sel = this.selectors[selector] ;
		}
	}
	
	/**
	 * create -- create the text animators for the layers.  Syllable-based or whole line
	 * @param unnorm -- denote unnormalizations (default is off)
	 * @return
	 */
 
	this.create = function( unnorm , syllables , style2 )
	{
		var K = this.getKaraObject( ) ;
		var ks , kline , i ;
		var names = this.parseLayerName( this.layer.layer.name ) ;
		var kline = K[names.style][names.layer][names.line];
		var kline2 ;
		if ( style2 ) { kline2 = K[style2][names.layer][names.line]; }
		unnorm = unnorm ? unnorm : this.unnorm ;
		this.start.clearAllKeys( ) ;
		this.end.clearAllKeys( ) ;
		this.offset.clearAllKeys( ) ;
		var ksyl = kline ;
		if ( names.syl )
		{
			syllables = {  };
			syllables[names.syl] = true
		}
		if ( syllables instanceof Array )
		{
			var syl = syllables;
			syllables = { } ;
			for ( i in syl )
			{
				syllables[syl[i]] = true ;
			}
		}
		var o = unnorm ? { unnorm: unnorm } : { } ;
		this.old.sel.enabled = true ;
		var start = 0 ;
		this.sel = this.getSelector( ) ;
		this.start.layer = this.end.layer = this.offset.layer = this.layer ;
		var funs = { time: this.originalTimeFunction , value: this.shiftValueFunction }
		this.setUnits( ) ;
		if ( syllables != undefined ? ! ( syllables instanceof Object || syllables instanceof Array || syllables == true ) : false )
		{
			syllables = [ syllables ] ;
		}
		this.dup_sel = this.sel.parentProperty(1);
		this.dup_sel.enabled = false ;
		this.sel.parentProperty.parentProperty.enabled = true ;			
		if ( !( this.start.keys ? this.start.keys.length : null ) && !( this.end.keys ? this.end.keys.length : null ) &&  !( this.offset.keys ? this.offset.keys.length : null ) )
		{
			return this ;
		}
		var addspace = this.layer.spacing ? 1 : 0 ;
		var len2 ;
		
		var oldSelectorType = this.selectorType; 
/*		if ( addspace && this.selectorType == 3 )
		{
			this.selectorType = 1 ;
		}	*/
		
		if ( style2 )
		{
			var ii ;
			var kll = kline.text + "\r\n" + kline2.text ;
			start = 0 ;
			switch( this.selectorType )
			{
				case 2:
					len = kll.replace( /\s/g , '' ).length ;
					lensyl = kline.text.replace( /s/g , '' ).length ;
					break ;
				case 3:
					for ( len = ii = 0 ; ii < 2 ; ii ++)
					{
						for ( i = lensyl = 0 ; i < (ksyl=ii?kline2:kline).length ; len += ksyl[i].text.match( /^\s*$/ ) ? 0 : 1, lensyl = !ii ? len : lensyl , i ++ ) ;
					}
					break ;
				case 4:
				case 1:
				default:
					len = kll.length + (this.layer.spacing ? kline.length + kline2.length : 0 ) - 2 ;
					lensyl = kline.text.length + (this.layer.spacing ? kline.length + kline2.length : 0 )  ;
					break ;
			}
			if ( syllables != undefined && syllables != false )
			{
				var start = 0 ;
				for ( ii = 0 ; ii < 2 ; ii ++ )
				{
					ksyl = ii ? kline2 : kline ;
					var text = '' ;
					for ( i = 0 ; i <  ksyl.length ; i ++ )
					{
						text = ( this.selectorType == 3 || this.selectorType == 2 ) 
							? ksyl[i].text.replace( /\s/g , '' ) : ksyl[i].text ;
/*						if ( ! text )
						{
							if ( this.selectorType != 3 && this.selectorType != 2 )
							{
								start += ksyl[i].text.length + addspace ;
							}
/*							if ( this.selectorType != 1 )
							{
								continue ;
							}
						}*/
						ks = ksyl[i] ;
						if ( ks.text.length == 0 ) { continue ; }						
						o.startTime = ks.time ;
						o.endTime = ks.time + ks.dur ;
						o.start = start / len ;
						o.end = ( start + ( this.selectorType == 3 ? 1 : ( this.selectorType == 2 ? text.length : ks.text.length ) ) ) / len ; 
						o.mul = 1 ;
						if ( syllables instanceof Object ? syllables[i] : true )
						{
							this.dup( "Karaoke " + i ) ;
							this.sel.enabled = true ;
							this.start.property = this.sel('start') ;
							this.end.property = this.sel('end') ;
							this.offset.property = this.sel('offset') ;
							this.start.setKeys( o , funs ) ;
							this.end.setKeys( o , funs ) ;
							this.offset.setKeys( o , funs ) ;
						}
						if (!text)
						{
							if ( this.selectorType != 3 && this.selectorType != 2 )
							{
								start += ksyl[i].text.length + addspace ;
							}
						}
						else
						{
							start += this.selectorType == 3 ? 1 : ( this.selectorType == 2 ? text.length : ks.text.length + addspace ) ;
						}
					}
				}
			}
			else
			{
				for ( ii = 0 ; ii < 2 ; ii ++ )
				{
					ksyl = ii ? kline2 : kline ;
					text = ( this.selectorType == 3 || this.selectorType == 2 ) 
						? ksyl.text.replace( /\s/g , '' ) : ksyl.text ;
					o.start = !ii ? 0 : o.end ;
					o.end = !ii ? ( this.selectorType == 3 ? lensyl : ( this.selectorType == 2 ? text.length : lensyl ) ) / len : 1 ; 
					o.mul = 1 ;
					this.dup( "Karaoke " + String(ii+1) ) ;
					this.sel.enabled = true ;
					this.start.property = this.sel('start') ;
					this.end.property = this.sel('end') ;
					this.offset.property = this.sel('offset') ;
					o.startTime = ksyl.start ;
					o.endTime = ksyl.end ;
					o.mul = 1 ;
					this.start.setKeys( o , funs ) ;
					this.end.setKeys( o , funs ) ;
					this.offset.setKeys( o , funs ) ;
				}
			}
		}
		else
		{
			if ( syllables != undefined && syllables != false )
			{
				var len ;
				switch( this.selectorType )
				{
					case 2:
						len = ksyl.text.replace( /\s/g , '' ).length ;
						break ;
					case 3:
						for ( i = len = 0 ; i < ksyl.length ; len += ksyl[i].text.match( /^\s*$/ ) ? 0 : 1 , i ++ ) ;
						break ;
					case 4:
					case 1:
					default:
						len = ksyl.text.length + (this.layer.spacing ? kline.length : 0 ) ;
						break ;
				}
				o.end = start = 0 ;var text ;
				for ( i = 0 ; i <  ksyl.length ; i ++ )
				{
					text = ( this.selectorType == 3 || this.selectorType == 2 ) 
						? ksyl[i].text.replace( /\s/g , '' ) : ksyl[i].text ;
/*					if ( ! text )
					{
						if ( this.selectorType != 3 && this.selectorType != 2 )
						{
							start += ksyl[i].text.length + addspace ;
						}
						if ( this.selectorType != 1 )
						{
							continue ;
						}
					}*/
					ks = ksyl[i] ;
					if ( ks.text.length == 0 ) { continue ; }						
					o.startTime = ks.time ;
					o.endTime = ks.time + ks.dur ;
					o.start = start / len ;
					o.end = ( start + ( this.selectorType == 3 ? 1 : ( this.selectorType == 2 ? text.length : ks.text.length ) ) ) / len ; 
					o.mul = 1 ;
					if ( syllables instanceof Object ? syllables[i] : true )
					{
						this.dup( "Karaoke " + i ) ;
						this.sel.enabled = true ;
						this.start.property = this.sel('start') ;
						this.end.property = this.sel('end') ;
						this.offset.property = this.sel('offset') ;
						this.start.setKeys( o , funs ) ;
						this.end.setKeys( o , funs ) ;
						this.offset.setKeys( o , funs ) ;
					}
						if (!text)
						{
							if ( this.selectorType != 3 && this.selectorType != 2 )
							{
								start += ksyl[i].text.length + addspace ;
							}
						}
						else
						{
							start += this.selectorType == 3 ? 1 : ( this.selectorType == 2 ? text.length : ks.text.length + addspace ) ;
						}
				}
			}
			else
			{
				this.dup( "Karaoke 1" ) ;
				this.sel.enabled = true ;
				this.start.property = this.sel('start') ;
				this.end.property = this.sel('end') ;
				this.offset.property = this.sel('offset') ;
				o.startTime = kline.start ;
				o.endTime = kline.end ;
				o.start = 0 ;
				o.end = 1 ;
				o.mul = 1 ;
				this.start.setKeys( o , funs ) ;
				this.end.setKeys( o , funs ) ;
				this.offset.setKeys( o , funs ) ;
			}
		}
/*		if ( addspace && this.selectorType == 3 )
		{
			this.selectorType = oldSelectorType ;
		}	*/
	}

	this.commit = function( )
	{
		var properties = [ 'start' , 'end' , 'offset' ] ;
		var i ;
		var prop ;
		var sel ;
		try
		{ sel = this.sel = this.getSelector( ) ; }
		catch( err ) { this.anim.enabled = true ; return false ; }
		for ( i in properties )
		{
			prop = properties[i] ;
			this[prop].property = sel(prop) ;
			this[prop].animator = this ;
			this[prop].layer = this.layer ;
		}
		var o = this.parseLayerName( this.layer.layer.name ) ;
		this.create( o.unnorm , this.syl == undefined || this.syl == false || this.syl == null ? o.syl : this.syl , this.layer.layers2[this.layer.layer.name] ) ;
		return this ;
	}

	this.constructor( animator , options ) ;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/* Inheritance Levels */
KRK.Animator = KRKAnimator;
KRKAnimator.prototype = new KRK.Common( ) ;