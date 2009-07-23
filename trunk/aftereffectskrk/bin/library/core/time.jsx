/**
 * Setup Karaoke timing
 * These symbols must be in the markers comments:
 *   ^ $  : start and end time of the layer.
 *    (defaults are inPoint, outPoint, work area start and work area end times)
 * < [ ] >: normalized timings (straight edges)
 * ( { } ): fixed timings (round edges)
 * < ( ) >: symbols designated for LINE timings
 * [ { } ]: symbols designated for SYLLABLE timings.  (line if not specified)
 * < [ ( {: these markers indicate start
 * > ] ) }: these markers indicate end
 */
 
 /**
  * KRK timing object
  * @param comp -- can be CompItem object or Layer object
  * @param timing -- default timings; only applicable to Layer object
  */
KRK.Time = function( comp , timing )
{
	this.errors = [ ] ;
	this.isComp = false ;
	this.layer = undefined ;
	this.comp = undefined ;
	if ( comp instanceof CompItem )
	{
		this.initComp( comp ) ;
	}
	else ( comp )
	{
		this.initLayer( comp , timing ) ;
	}
}

/**
 * Constants
 */

KRK.Time.AT  = 0 ;
KRK.Time.IN  = 1 ;
KRK.Time.OUT = 2 ;

KRK.Time.SYL        = 4 ;
KRK.Time.LINE       = 8 ;
KRK.Time.NORM       = 16 ;
KRK.Time.FIXED      = 32 ;


/**
 * Constructor
 */
KRK.Time.prototype.constructor = function( )
{
	this.$ = this.$$ ;
}

/**
 * Reads the timing
 * @param comp -- after-effects composition
 */
KRK.Time.prototype.initComp = function( comp )
{
	this.comp = comp ;
	this.isComp = true ;
	this.blankTimes( );

// Creates a temporary text layer
	var layerCollection = comp.layers; 
	var textLayer = layerCollection.addText('');

// The only way to get composition markers is to use expressions.
	textLayer.Text.sourceText.expression = "var m=thisComp.marker;var x='';for(var i=1;i<=m.numKeys;i++){x+=(x?'!_!':'')+m.key(i).time+'!_!'+m.key(i).comment;}x" ;
	textLayer.Text.sourceText.expressionEnabled = true;

// Delimits with an arbitrary string... hopefully, the user won't use this string in the marker comments.
	var o = String(textLayer.Text.sourceText.value).split('!_!');
	var i;
	var t , a ;
	var f ;
	
// Remove the temporary text layer
	textLayer.remove( );

// Run through the markers
	for ( i = 0 ; i < o.length ; i += 2 )
	{
		t = o[i] ;
		a = o[i+1] ;
	// Sets the appropriate time
		if ( f = this.cTime[a] )
		{
			f( t );
		}
	}

// Computes the final timings
	this.compute( );
	return this;
}

/**
 * Initializing layers
 * -------------------
 * @param layer -- the layer you want to check for markers
 */
KRK.Time.prototype.initLayer = function( layer , timing )
{
	this.layer = layer ;
	this.comp = layer.containingComp ;
	this.blankTimes( );
	
// Get all of the markers
	var markers = this.layer.Marker ;
	var f ;
	var i ;
	if ( markers )
	{
		for ( i = 1 ; i <= markers.numKeys ; i ++ )
		{
			if ( f = this.cTime[markers.keyValue(i).comment] )
			{
				f(marker.keyTime(i)) ;
			}
		}
		
	// Computes timings
		this.compute( ) ;
		return this ;
	}
	else if ( timing instanceof Object )
	{
		return this.copy( timing )
	}
	else
	{
		return null ;
	}
}

/**
 * This basically creates the timings
 * see comments
 */
KRK.Time.prototype.cTime =
{
	'^': function( t ) // start time
	{
		this.startTime = t ;
	} ,
	'$': function( t ) // end time
	{
		this.endTime = t ;
	} ,
	'[': function( t ) // intro time (normalized to the duration)
	{
		this.syl.inout[0] = t ;
		this.syl.norms[0] = true ;
	} ,
	'{': function( t ) // intro time (fixed)
	{
		this.syl.inout[0] = t ;
		this.syl.norms[0] = false ;
	} ,
	']': function( t ) // outro time (normalized to the duration)
	{
		this.syl.inout[1] = t ;
		this.syl.norms[1] = true ;
	} ,
	'}': function( t ) // outro time (fixed)
	{
		this.syl.inout[1] = t ;
		this.syl.norms[1] = false ;
	} ,
	'<': function( t ) // intro time for line (normalized to the duration)
	{
		this.line.inout[0]= t ;
		this.line.norms[0]= true ;
	} ,
	'(': function( t ) // intro time for line (fixed)
	{
		this.line.inout[0]= t ;
		this.line.norms[0]= false ;
	} ,
	'>': function( t ) // outro time for line (normalized to the duration)
	{
		this.line.inout[1]= t ;
		this.line.norms[1]= true ;
	} ,
	')': function( t ) // outro time for line (fixed)
	{
		this.line.inout[1]= t ;
		this.line.norms[1]= false ;
	} ,	
} ;

/**
 * This function fixes the timings... It will use defaults if it's not specified
 */
KRK.Time.prototype.fixTime = function( )
{
// Check if start time and end time are set; if not use the comp or layer time
	if ( ! this.isComp )
	{
		if ( this.startTime == undefined )
		{
			this.startTime = this.layer.inPoint + this.layer.startTime ;
		}
		if ( this.endTime == undefined )
		{
			this.endTime = this.layer.outPoint + this.layer.startTime ;
		}
	}
	else
	{
		if ( this.startTime == undefined )
		{
			this.startTime = this.comp.workAreaStart;
		}
		if ( this.endTime == undefined )
		{
			this.endTime = this.comp.workAreaStart + this.comp.workAreaDuration ;
		}
	}

// Check if inPoint and outPoint are set; if not, use startTime and endTime.
	if ( this.syl.inout[0] == undefined )
	{
		this.syl.inout[0] = this.startTime ;
		this.syl.norms[0] = false ;
	}
	if ( this.syl.inout[1] == undefined )
	{
		this.syl.inout[1] = this.endTime ;
		this.syl.norms[0] = false ;
	}
	
// Check if line inPoint and line outPoint are set; if not, use inPoint and outPoint
	if ( this.line.inout[0]== undefined )
	{
		this.line.inout[0]= this.syl.inout[0] ;
		this.line.norms[0]= this.syl.norms[0] ;
	}
	if ( this.line.inout[1]== undefined )
	{
		this.line.inout[1]= this.syl.inout[1] ;
		this.line.norms[1]= this.syl.norms[1] ;
	}
	
// Set proper durations
	this.syl.dur = this.syl.inout[1] - this.syl.inout[0] ;
	this.line.dur= this.line.inout[1]- this.line.inout[0];
}

/**
 * Make blank timings (reset the timings)
 */
KRK.Time.prototype.blankTimes = function( )
{
	this.startTime = undefined ;
	this.endTime = undefined ;
	
// Positive = fixed timings
// Negative = normalized timings
	this.line = {
		times: [ undefined , undefined ] ,
		norms: [ undefined , undefined ] ,
		inout: [ undefined , undefined ] ,
		dur: undefined
	};
	this.syl =  {
		times: [ undefined , undefined ] ,
		norms: [ undefined , undefined ] ,
		inout: [ undefined , undefined ] ,
		dur: undefined
	}
}

/**
 * Computes the timing
 * @param start -- start time
 * @param end -- end time
 * @param norm -- is it normalized?
 */
KRK.Time.prototype.computeTime = function( start , end , norm )
{
	return norm ? ( end - start ) / this.duration : end - start ;
}

/**
 * Do the overall timing computations and store to this.SYL and this.LINE parts
 */
KRK.Time.prototype.compute = function( )
{
// There may be some values that aren't set, so fix them!
	this.fixTime( ) ;
}

KRK.Time.prototype.copyCat = [
	'line', 'syl', 'startTime', 'endTime'
] ;

/**
 * Copy the timing values from another KRK.Time object
 * @param timing -- type: KRK.Time
 */
KRK.Time.prototype.copy = function( timing )
{
	var i ;
	for ( i = 0 ; i < this.copyCat ; i ++ )
	{
		this[this.copyCat[i]] = timing[this.copyCat[i]] ;
	}
	return this ;
}

KRK.Time.prototype.setCallback( callback )
{
	var self = this ;
	if ( typeof callback == 'function' )
	{
		this.$ = callback ;
	}
	else
	{
		this.$ = this.$$ ;
	}
}

/**
 * Default callback function
 * @param location -- KRK.Time.AT, KRK.Time.IN, KRK.Time.OUT
 * @param type -- (KRK.Time.LINE, KRK.Time.SYL) | (KRK.Time.NORM, KRK.Time.FIXED)
 * @param time -- current time
 * @param times -- [startTime, endTime] (in seconds)
 * @param value -- (not used) -- current value
 * @param values -- (not used) [startValue, endValue]
 */
KRK.Time.prototype.$$ = function( location , type , time , times , value , values )
{
	var T = type & KRK.Time.LINE ? this.line : this.syl ;
	switch( location )
	{
		case KRK.Time.IN: // Can be unnormalized or normalized
			return ( type & ( KRK.Time.NORM | KRK.Time.FIXED ) ? type & KRK.Time.FIXED : T.norms[0] )
				? ( T.inout[0] - time ) / T.dur * ( times[1] - times[0] ) + times[0]
				: T.inout[0] - time + times[1] ;
		case KRK.Time.OUT: // Can be unnormalized or normalized
			return ( type & ( KRK.Time.NORM | KRK.Time.FIXED ) ? type & KRK.Time.FIXED : T.norms[1] )
				? ( time - T.inout[1] ) / T.dur * ( times[1] - times[0] ) + times[1]
				: time - T.inout[1] + times[1] ;
		default:  // Always normalized to the syllable or to the line
			return
				( time - T.inout[0] ) / T.dur * ( times[1] - times[0] ) + times[0] ;
	}
}