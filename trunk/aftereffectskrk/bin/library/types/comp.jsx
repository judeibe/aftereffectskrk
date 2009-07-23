/**
 * Composition type
 * that stores all of the compositions
 */
KRK.TYPE.CompLayer = function( no_build )
{
	var self = this ;
	this.data = null ;
	this.current = null ;
	if ( !no_build )
	{
		this.build( ) ;
	}
}

/**
 * Build a list of compositions into the data
 */
KRK.TYPE.Comp.prototype.build = function( )
{
	this.data = { } ;
	var i ;
	var project = app.project ;
	var items = project.items ;
	var item , i ;
	for ( i = 1 ; i <= items.length ; i ++ )
	{
		item = items[i] ;
		if ( item.typeName == 'Composition' )
		{
			this.data[item.name.toLowerCase()] = { comp: item } ;
		}
	}
	return this ;
}

KRK.TYPE.Comp.prototype.current = function( name )
{
	name = name.toLowerCase() ;
	this.current = name ;
	return this ;
}

KRK.TYPE.Comp.prototype.comp = function( )
{
	if ( this.current )
	{
		return this.data[current].comp ;
	}
}