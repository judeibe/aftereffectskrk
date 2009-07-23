KRK.Error = function( )
{
	this.errors = [ ] ;
	this.messages = {
		1: [
			"Configuration Errors: Main Composition Timing Markers are missing" ,
			"These composition markers must be in the timeline: ^$[{]}<(>)"
		]
	} ;
	
	this.fields = {
		'comp': 'Composition' ,
		'layer': 'Layer' ,
		'line': 'Line #' ,
	} ;
}

KRK.Error.prototype.add = function( errornum , fields , message )
{
	this.errors.push(
		{
			errornum: errornum ,
			message: message ,
			fields: fields
		}
	) ;
	return this.errors.length - 1 ;
}

KRK.Error.prototype.pass = function( )
{
	return this.errors.length == 0 ;
}

KRK.error = new KRK.Error( ) ;