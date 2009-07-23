/**
 * Karaoke App Object
 * ------------------
 */

/*
 * naming conventions:
 * -------------------
 * this.$      -- Adobe After-Effects/JavaScript inherited Object
 *               (since it's not possible to extend in this version of JS)
 * this.$$     -- Children of the this Object
 * this.parent -- Parent of this Object, assigned from the parent object.
 * this.name   -- Case insensitive name (converted toLowerCase()), stored in the hash
 * this.Name   -- Original cased name
 */

var KRK = function( )
{
	var self = this;
	self.K = { } ;
	self.config = { } ;
	self.Karaoke = { } ;
	self.$$ = null ;
}

	/**
	 * load karaoke and config
	 * @param config -- configuration
	 * @param karaoke -- karaoke
	 */
	 
	/**
	 * Constructor
	 */
	KRK.prototype.constructor = function( )
	{
		this.$$ = new KRK.Project( ) ;
		this.$$.parent = this;
		this.$$.init( ) ;
	}

// A list of KRK-Global variables
	KRK.vars = { } ;
	
// A list of karaoke
	KRK.Ks = { } ;
	
// Default Karaoke (First one it sees or specified default attribute)
	KRK.K = null ;

// A list of loaded MOD
	KRK.MOD = { } ;

// A list of TYPES
	KRK.TYPE = { } ;

// Global Commands
	KRK.cmd = [ ] ;

// Global UIs
	KRK.UI = { } ;