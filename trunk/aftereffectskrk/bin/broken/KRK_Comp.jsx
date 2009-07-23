if ( typeof KRK != 'object' ) { KRK = { } ; }

/**
 * KRKComp( comp ) -- Main Karaoke Composition Prototype: LEVEL 2
 * @param comp -- After-Effects Comp object (can be numeric (index), string, or After-Effects Comp object)
 */
function KRKComp( comp )
{
/* Constructors */
	this.comp = comp ;
	this.old = null ;
	this.childName = 'layers' ;
	this.objectName = 'comp' ;
	this.caller = 'layer' ;
	this.project ;
	this.unique = true ;
	this.config = null ;
	/**
	 * constructor function
	 * @param comp -- After-Effects Comp object (can be numeric (index), string, or After-Effects Comp object)
	 */
	this.constructor = function( comp )
	{
		if ( comp != undefined )
		{
			if ( this.comp = this.project.getAObject( comp ) )
			{
				this.old = this.comp ;
				this.name  = this.comp.name ;
				if ( this.config = this.comp.layer( "KRK" ) )
				{
					this.config.enabled = false ;
				}
			}
			else
			{
				throw "Composition does not exist: Make sure you typed in the name correctly!"
			}
		}
	}

	this.evaluate = function( )
	{
		var krk , text ,e ;
		if ( krk = this.comp.layer( "KRK" ) )
		{
			if ( text = krk( "Text" ) )
			{
				if ( ! text.sourceText ) { return false ; }
				with ( this )
				{
					e = ( text.sourceText ? String( text.sourceText.value ) : "" ) + "\n\n" + ( text.sourceText.expression ? String( text.sourceText.expression ) : "" ) ;
					try{ eval( e.replace( /[��]/g , "'" ).replace( /[��]/g , '"' ) ) } // get rid of the stupid smart-quotes in ae expressions.
					catch( err )
					{
						return ( err.description ) ;
					}
				}
			}
		}
		return null ;
	}

	/**
	 * prop( krk ) -- Resynchronize the same object
	 * @param krk -- KRKComp object
	 */
	this.prop = function( krk )
	{
		this.layers = krk.layers ;
		this.project = krk.project ;
	}

	this.commit = function( )
	{
		var layers = this.layers ;
		var newLayer ;
		for ( j in layers )
		{
			layer = layers[j] ;
			layer.commit( ) ;		
		}
	}


	this.destruct = function( )
	{
		var i ;
		for ( i in this.layers )
		{
			this.layers[i].destruct( ) ;
		}
		return this ;
	}

	this.constructor(comp) ;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
KRK.Comp = KRKComp;
KRKComp.prototype = new KRK.Common( ) ;