//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/** KRKProject( K ) -- Main Karaoke Project Prototype: LEVEL 1
 * @param K -- Karaoke JSON, Generated from an external script
 */
KRK.Project=function( object )
{
	var self = this;
	this.model = app.project;
	this.name = 'Project' ;
	this.parentName = '' ;
	this.objectName = 'project' ;
	this.childName = 'comps' ;
	this.K = null ;
	this.caller = 'item' ;
	this.old = null ;
	this.unique = true ;
	this.expression = null ;
	this.project = app.project ;
	/**
	 * A Constructor
	 * @param K -- Karaoke JSON, Generated from an external script
	 */
	this.constructor = function( K )
	{
		this.old = this.project = app.project ;
		this.K = K ;
		if ( !K ) { return false ; }
		return this ;
	}
	
	/**
	 * prop( krk ) -- Resynchronize the same object [place holder]
	 * @param krk -- KRKProject object
	 */
	this.prop = function( krk )
	{
	}
	
/* Undos */
	
	/**
	 *  @function begin( undoText): undo text
	 *  @param undoText The text appearing in Edit->Undo
	 */
	this.begin = function( undoText )
	{
		if ( !undoText )
		{
			undoText = this.undo ? this.undo : "KRK Project" ;
		}
		app.beginUndoGroup( undoText ) ;
	}
	
	this.title = function( title )
	{
		this.undo = title ;
	}
	/**
	 * function end( ): end of undo
	 */
	this.end = function( )
	{
		app.endUndoGroup( ) ;
	}

	/**
	 * @function shiftKara( ): Shift everything in Karaoke JSON based on a time
	 * @param t time to be shifted
	 */
	this.shift = function( t )
	{
		if ( t )
		{
			var style , layer , line , syl , a , a0 , b , c ;
			for ( style in this.K )
			{
				a = this.K[style] ;
				for ( layer in a )
				{
					a0 = a[layer] ;
					for ( line = 0 ; line < a0.length ; line ++ )
					{
						b = a0[line] ;
						b.start += t ;
						b.end += t ;
						for ( syl = 0 ; syl < b.length ; syl ++ )
						{
							b[syl].time += t ;
						}
					}
				}
			}
		}
		return this ;
	}

	/**
	 * @function setFontSize( size , style , layerNumbers ) -- set the font size
	 * @param size -- font size in pixels
	 * @param styles -- selected styles defined in your .ass { StyleName: [layer numbers] }
	 */
	this.setFontSize = function( size , styles )
	{
		var i , j ;
		var ratio ;
		var style , s , s2 , s1 , layer ;
		var s2 = styles ? ( styles instanceof Array ? styles : [styles] ) : this.K ;
		for ( style in s2 )
		{
			k = this.K[styles ? s2[style] : style ] ;
			k.fontSize = size ;
			for ( i in k )
			{
				if ( i != Number( i ) ) { continue ; }
				s1 = k[i] ;
				for ( s = 0 ; s < s1.length ; s ++ )
				{
					k1 = s1[s] ;
					if ( ! k1.fontSize ) { k1.fontSize = 1 ; }
					ratio = size / k1.fontSize ;
					k1.fontSize = size ;
					k1.width *= ratio ;
					k1.height *= ratio ;
					for ( j = 0 ; j < k1.length ; j ++ )
					{
						k1[j].width *= ratio ;
						k1[j].height *= ratio ;
						k1[j].top *= ratio ;
						k1[j].left *= ratio ;
					}
				}
			}
		}
		return this ;
	}

	/**
	 * @function parseASS( x ) -- parses ASS Karaoke timings
	 * @param x -- content
	 * @return K.  Sets this.K to be the karaoke data.
	 */
	this.parseASS = function( x )
	{
		var StyleLayer ;
		var hh , text1 , text3;
		var K = { } ; var k ;
		var lines = x.split( /[\n\r]+/ ) ;
		var i , line , cells ;
		var j = { }  ;
		var Styles = { }; 
		var o = 0 ;
		var stylez, cells2, startTime, endTime, text, Kk ;
		hh;
		for ( i = 0 ; i < lines.length ; i ++ )
		{
			line = lines[ i ] ;
			cells = line.split( /,/ ) ;
			cells2 = cells[ 0 ].match( /\d+/ ) ;
			startTime = cells[ 1 ] ;
			endTime = cells[ 2 ] ;
			text = "" ;
			for ( ii = 9 ; ii < cells.length ; ii ++ )
			{
				text += ( ii > 9 ? "," : "" ) + cells[ ii ] ;
			}
			var notext = '' ;
			var K1, k1 ;
			if ( ( cells.length >= 10 ) && ( cells[ 0 ].match( /^Dialog/i ) ) )
			{
				var Style2 = cells[ 3 ].toLowerCase() ;
				var StyleLayer = cells2[0]
				var Style = Style2 + StyleLayer ;
				if ( !j[ Style ] )
				{
					if ( !K[Style2] )
					{
						K[Style2] = { } ;
					}
					j[Style] = 0 ;	
					Kk = K[Style2][StyleLayer] = { } ;
				}
				else
				{
					Kk = K[Style2][StyleLayer] ;
				}
				k = Kk[ j[Style] ] = { } ;
				k.style = Style ;
				k.start = this.secs( startTime ) ;
				k.end = this.secs( endTime ) ;
				if ( K1 = text.match( /\{\\k.*?-?\d+\}[^\{]*/gi ) )
				{
					kt = this.secs( startTime ) ;
					for ( k1 = 0 ; k1 < K1.length ; k1 ++ )
					{
						var KK = K1[ k1 ].match( /\{\\k.*?(-?\d+)\}(.*)/i ) ;
						text1 = KK[2] ; text3 = '' ;
						k[k1] =	{
							  text : text1
							, time : Math.round( kt * 1000 ) / 1000
							, dur : Math.round( KK[ 1 ] / 100 * 1000 ) / 1000
							} ;
						notext += text1
						kt += KK[ 1 ] / 100 ;
					}
					k.length = K1.length ;
				}
				else
				{
					notext = text.replace( /\{.+?\}/ , '' )
				}
				k.text = notext ;
				j[ Style ] ++ ;
			}
		}
	
		for ( var style in Styles )
		{
			for ( var layer in K[style] )
			{
				K[style][layer].length = j[style+layer] ;
			}
		}
		ii = 0 ;
		for ( i in K )
		{
			ii = 1 ;
			break ;
		}
		if ( !ii )
		{
			K = null ;
		}
		return this.K = K ;
	}

	/**
	 * @function secs(t)
	 * @param t -- .ass time fields
	 * @return seconds
	 */
 	this.secs = function( t )
	{
		var T = t.split( /:/ ) ;
		return( 3600.0 * Number( T[ 0 ] ) + 60.0 * Number( T[ 1 ] ) + 1.0 * Number( T[ 2 ] ) ) ;
	}

	/**
	 * commit all changes
	 * @TODO
	 */
	this.commit = function( undoName )
	{
		var i , j , k , layers , layer , newLayer , comps ;
		for ( i in this.comps )
		{
			comp = this.comps[i] ;
			comp.commit( ) ;
		}
		if ( undoName != false )
		{
			this.end( ) ;			
		}
	}

	this.topLayers = function( ) 
	{
		var o , i , j , k , comp , layer ;
		for ( i in this.comps )
		{
			comp = this.comps[i] ;
			k = 0 ;
			for( i in comp.layers )
			{
				if ( !k )
				{
					try{ ( layer = comp.layers[i].old ).moveToBeginning( ) } catch( err ){ k--; }
				}
				else
				{
					try{ ( comp.layers[i].old ).moveAfter( layer ) ;
					layer = comp.layers[i].old ; } catch( err ) { } 
				}
				k ++ ;
			}
			if ( comp.config )
			{
				comp.config.moveAfter( layer) ;
			}
		}
	}

	/**
	 * Auto Add Items
	 * Make sure your comps have been configured correctly
	 * @param codesOnly -- boolean: True if you want the codes quickly
	 */
	this.auto = function( codesOnly )
	{
		
	}
	
	this.codes = function( )
	{
		var o , layer , text , k , t , e ;
		if ( o = this.getAObject( "KRK" ) )
		{
			for ( i = 1 ; i <= o.numLayers ; i ++ ) 
			{
				layer = o.layer( i ) ;
				if ( ! ( text = layer('Text') ) )
				{
					continue ;
				}
				t = String( text('Source Text').value ) ;
				e = String( text('Source Text').expression )
				
				if ( this.parseASS( t ) )
				{
					this.expression = String( e ) ;
					return layer ;
				}
				else if ( this.parseASS( e ) )
				{
					this.expression = String( t ) ;
					return layer ;
				}
				else if ( t.match( /^[\s(]*\{.+\}[\s)]*$/ ) )
				{
					this.constructor( eval( '(' + t + ')' ) ) ;
					this.expression = String( e ) ;
					return layer ;
				}
				else if ( e.match( /^[\s(]*\{.+\}[\s)]*$/ ) )
				{
					this.constructor( eval( '(' + e + ')' ) ) ;
					this.expression = String( t ) ;
					return layer ;
				} 
			}
			return null ;
		}
	}
	
	this.removeAllLayers = function( )
	{
		var o , i , j , k ;
		var l ;
		var comp , layer ;
		do
		{
			l = 0 ;			
			for ( i in this.comps )
			{
				comp = this.comps[i].comp ;
				for( i = 1 ; i <= comp.layers.length ; i ++ )
				{
					layer = comp.layers[i] ;
					if ( o = this.parseLayerName( layer.name ) )
					{
						l ++ ;
						// Throttled removals.
						while ( 1 )
						{
							try{ layer.remove( ) }
							catch( err )
							{
								break ;
							}
						}
					}
				}
			}
		} while ( l ) ;
	} 

	this.evaluate = function( )
	{
		var comp , msg ;		
		if ( this.expression )
		{
			with( this )
			{
				try{ eval( this.expression.replace( /[��]/g , "'" ).replace( /[��]/g , '"' ) ) } // get rid of the stupid smart-quotes in ae expressions.
				catch( err )
				{
					alert( "You have an error in your codes! ( in KRK Composition )\n\n\"" + err.description + "\"\n\nClick OK to continue." ) ;
					return err.description ;
				}
			}
		}
	
		try
		{
			for ( comp in this.comps )
			{
				if ( msg = this.comps[comp].evaluate( ) )
				{
					alert( "You have an error in your codes in Composition:\n" +this.comps[comp].comp.name+"\n\n\"" + msg + "\"\n\nClick OK to continue." ) ;
					return msg ;
				}
			}
		}
		catch ( err )
		{
			alert( "You have not speciified any compositions [ i.e., add( \"Comp 1\"); ] and Karaoke JSON data in KRK comp. (in a Text Layer's Source Text and Source Text's expression) \n\n\nClick OK to continue." ) ;			
			return err.description ;
		}
		return null ;
	}

	this.destruct = function( )
	{
		var i ;
		for ( i in this.comps )
		{
			this.comps[i].destruct( ) ;
		}
		return this ;
	}

	this.constructor( K ) ;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/* Inheritance Levels */
KRK.Project.prototype = new KRK.Common( ) ;

KRK.Project.module = {
		__classNames: [ ] ,
		load:
		{
			name: 'K',
			description: 'Loads an .ass Karaoke',
			limit: 1,
			methodName: 'loadSubs',
			params:
			{
				K: 
				{
					required: false,
					type: 'string',
					description: '.ass Karaoke'
				} ,
				selectedLayer:
				{
					type: 'boolean',
					description: 'selected layer',
				}
			}
		},
		comp:
		{
			limit: null,
			className: 'Comp'
		}
	} ;
