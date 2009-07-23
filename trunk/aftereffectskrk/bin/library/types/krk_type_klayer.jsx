KRK.TYPE.KLayer = function( comp )
{
	var self = this ;
	this.layers = { } ; // all the k layers
	this.last = { } ; // order: last index
	this.comp = null ;
}

KRK.TYPE.KLayer.prototype.constructor = function( comp )
{
	this.comp = comp ;
}

KRK.TYPE.KLayer.prototype.getAll = function( comp )
{
	if ( typeof comp == 'string' )
	{
		comp = KRK.getComp( comp ) ;
	}
}

KRK.TYPE.KLayer.name = function( order , index )
{
	return 'krk[' + String(Math.floor(order)) + '][' + String(Math.floor(index)) + ']' ;
}

KRK.TYPE.KLayer.getLayer = function( name )
{
	if ( name instanceof Object )
	{
		name = KRK.TYPE.KLayer.name( name.order , name.index ) ;
	}
	if ( typeof name == 'string' )
	{
		name = name.toLowerCase() ;
		
	}
}