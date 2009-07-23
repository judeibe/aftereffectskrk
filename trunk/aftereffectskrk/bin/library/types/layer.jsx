/**
 * Holds records of the template layers and the generated layers for a composition
 */

KRK.TYPE.Layer = function( comp )
{
	var self = this ;
	this.layers = { } ; // all the template layers
	this.last = { } ; // order: last index
	this.comp = null ;
}

KRK.TYPE.Layer.name = function( order , index )
{
	return 'krk[' + String(Math.floor(order)) + '][' + String(Math.floor(index)) + ']' ;
}

KRK.TYPE.Layer.getLayer = function( name )
{
	if ( name instanceof Object )
	{
		name = KRK.TYPE.Layer.name( name.order , name.index ) ;
	}
	if ( typeof name == 'string' )
	{
		name = name.toLowerCase() ;
		
	}
}





KRK.TYPE.Layer.prototype.constructor = function( comp )
{
	this.comp = comp ;
}

KRK.TYPE.Layer.prototype.getAll = function( comp )
{
	if ( typeof comp == 'string' )
	{
		comp = KRK.getComp( comp ) ;
	}
}
