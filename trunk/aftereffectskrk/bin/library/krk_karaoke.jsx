KRK.MOD.KARAOKE = function( )
{
// properties
	var self = this ;
	this.K = null ;
}

/** Namespace methods **/

KRK.MOD.KARAOKE.K = [ ] ;
KRK.MOD.KARAOKE.k = null ;
KRK.MOD.KARAOKE.assign = function( object , k_object )
{
	object.K = k_object ;
}


/** Objects methods **/

/**
 * @function parseASS( x ) -- parses ASS Karaoke timings
 * @param x -- content
 * @return K.  Sets this.K to be the karaoke data, and pushes global K.
 */
KRK.MOD.KARAOKE.prototype.parse_ass = function( x )
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
	KRK.MOD.KARAOKE.K.push(K);
	return KRK.MOD.KARAOKE.k = this.K = K ;
}