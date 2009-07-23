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

KRK.Time.AT = 0 ;
KRK.Time.BEFORE = 1 ;
KRK.Time.AFTER = 2 ;


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
		this.inPoint = t ;
		this.inNorm = true ;
	} ,
	'{': function( t ) // intro time (fixed)
	{
		this.inPoint = t ;
		this.inNorm = false ;
	} ,
	']': function( t ) // outro time (normalized to the duration)
	{
		this.outPoint = t ;
		this.outNorm = true ;
	} ,
	'}': function( t ) // outro time (fixed)
	{
		this.outPoint = t ;
		this.outNorm = false ;
	} ,
	'<': function( t ) // intro time for line (normalized to the duration)
	{
		this.inPointLine = t ;
		this.inNormLine = true ;
	} ,
	'(': function( t ) // intro time for line (fixed)
	{
		this.inPointLine = t ;
		this.inNormLine = false ;
	} ,
	'>': function( t ) // outro time for line (normalized to the duration)
	{
		this.outPointLine = t ;
		this.outNormLine = true ;
	} ,
	')': function( t ) // outro time for line (fixed)
	{
		this.outPointLine = t ;
		this.outNormLine = false ;
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
	if ( this.inPoint == undefined )
	{
		this.inPoint = this.startTime ;
		this.inPointNorm = false ;
	}
	if ( this.outPoint == undefined )
	{
		this.outPoint = this.endTime ;
		this.inPointNorm = false ;
	}
	
// Check if line inPoint and line outPoint are set; if not, use inPoint and outPoint
	if ( this.inPointLine == undefined )
	{
		this.inPointLine = this.inPoint ;
		this.inNormLine = this.inNorm ;
	}
	if ( this.outPointLine == undefined )
	{
		this.outPointLine = this.outPoint ;
		this.outNormLine = this.outNorm ;
	}
	
// Set proper durations
	this.dur = this.outPoint - this.inPoint ;
	this.durLine = this.outPointLine - this.inPointLine ;
}

/**
 * Make blank timings (reset the timings)
 */
KRK.Time.prototype.blankTimes = function( )
{
	this.startTime = undefined ;
	this.endTime = undefined ;
	this.inPoint = undefined ;
	this.outPoint = undefined ;
	this.inNorm = false ;
	this.outNorm = false ;
	this.inPointLine = undefined ;
	this.outPointLine = undefined ;
	this.inNormLine = false ;
	this.outNormLine = false ;
	this.dur = undefined ;
	this.durLine = undefined ;
	
// Positive = fixed timings
// Negative = normalized timings
	this.line = null;
	this.syl =  null;
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
// There may be some values that aren't set, then fix them!
	this.fixTime( ) ;
	
// line times
	this.line =
		[
			this.durLine ,
			this.inNormLine ? -( this.inPointLine - this.startTime ) / this.durLine : this.inPointLine - this.startTime ,
			this.outNormLine ? -( this.endTime - this.outPointLine ) / this.durLine : this.endTime - this.outPointLine
		] ;
		
// syllable times
	this.syl =
		[
			this.dur ,
			this.inNorm ? -( this.inPoint - this.startTime ) / this.dur : this.inPoint - this.startTime ,
			this.outNorm ? -( this.endTime - this.outPointLine ) / this.dur : this.endTime - this.outPoint
		] ;
}

KRK.Time.prototype.copyCat = [
	"inNorm" , "outNorm" , "inNormLine" , "outNormLine" ,
	"inPoint", "outPoint", "inPointLine", "outPointLine",
	"startTime", "endTime", "duration",
	"line", "syl", "comp"
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
 * @param location -- 0: during, 1: before, 2: after.
 * @param isLine -- is a line: true -- line, false -- syllable.
 * @param time -- current time
 * @param times -- [startTime, endTime] (in seconds)
 * @param value -- (not used) -- current value
 * @param values -- (not used) [startValue, endValue]
 */
KRK.Time.prototype.$$ = function( location , isLine , time , times , value , values )
{
	var t = isLine ? this.line : this.syl ;
	
	
	
	switch ( o.unnorm )
	{
		case "start":
			return t + o.startTime - that.startTime ;
			break;
		case "end":
			return t + o.endTime - that.endTime ;
			break;
		default:
			t = ( t - that.startTime ) / ( that.endTime - that.startTime ) ;
			return t * ( o.endTime - o.startTime ) + o.startTime ;
	}
}