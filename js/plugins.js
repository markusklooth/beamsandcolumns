
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());


// place any jQuery/helper plugins in here, instead of separate, slower script files.

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();


function roundTo(val, places){
    places = places || 2;
    if( isNaN( parseFloat( val ) ) ) return;
    return parseFloat(val).toFixed(places);
}
function prec(val){
    return parseFloat(val).toFixed(7);
}

(function($) {
    $.fn.roundTo = function(places) {
        places = places || 2;
        this.each( function( i ) {
            $(this).change( function( e ){
                if( isNaN( parseFloat( this.value ) ) ) return;
                this.value = parseFloat(this.value).toFixed(places);
            });
        });
        return this; //for chaining
    }
    
    $.fn.twipsy = function(){
        this.each( function( i ) {
            var id      = $(this).data("id"),
                type    = $(this).data("pos"), 
                $anchor = $(this),
                $twipsy = $("#"+ id),
                
                twipsy = {
                  width: $twipsy.width() + 10,
                  height: $twipsy.height() + 10
                },
                anchor = {
                  position: $anchor.position(),
                  width: $anchor.width(),
                  height: $anchor.height()
                },
                offset = {
                  above: {
                    top: anchor.position.top - twipsy.height,
                    left: anchor.position.left + (anchor.width/2) - (twipsy.width/2)
                  }
                , below: {
                    top: anchor.position.top + anchor.height
                  , left: anchor.position.left + (anchor.width/2) - (twipsy.width/2)
                  }
                , left: {
                    top: anchor.position.top + (anchor.height/2) - (twipsy.height/2)
                  , left: anchor.position.left - twipsy.width - 5
                  }
                , right: {
                    top: anchor.position.top + (anchor.height/2) - (twipsy.height/2)
                  , left: anchor.position.left + anchor.width + 5
                  }
              }
            $twipsy.css(offset[type]).fadeIn();
        })
    }
    
})( jQuery );

