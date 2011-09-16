/* Author: 

*/

var $PI = 3.1415926535;


/**

 fc         = Concrete compressive strength
 fy         = Reinforcing yield strength
 phi        = Reduction factor for flexure (usualy = .9)
 
*/

function calculateVars(){
    
    //only calculate p min if checkbox is not checked, else use the given value
    if(! $("#rhow_min_fixed").is(":checked")){
        var p_min            = calculateRhowMin();
        $("#rhow_min").val( roundTo(p_min,6) );
    }
    
    //only calculate p max if checkbox is not checked, else use the given value
    if(! $("#rhow_max_fixed").is(":checked")){
        var p_max            = calculateRhowMax();
        $("#rhow_max").val( roundTo(p_max,6) );
    }
    
    if(! $("#rhow_fixed").is(":checked")){
        var rhow             = calculateRhow();
        $("#rhow").val( roundTo(rhow,6) );
    }
    
    displayRhowBalanced();
    
    isRhowOkay();
    
    if(! $("#a_steel_required_fixed").is(":checked")){
        var a_steel_required = calculateRebarAreaRequired();
        $("#a_steel_required").val( a_steel_required );
    }
/*     $("#a_steel_required_text").text( roundTo(a_steel_required,4) ); */
    
    
    getValidRebars();
}

function isRhowOkay(){
    var rhow_min = $("#rhow_min").val(),
        rhow_max = $("#rhow_max").val(),
        rhow     = $("#rhow").val(),
        $box     = $("#rhow_result");
    
    $box.removeClass().addClass("alert-message");
    
    if( rhow < rhow_min ){
        $box.addClass("warning").html("ρ is too small. Use ρ<sub>min</sub> instead.");
    } else if( rhow >= rhow_max ){
        $box.addClass("error").html("ρ is too large. Redesign.");
    } else{
        $box.addClass("success").html("ρ is acceptable.");
    }

}

function checkRhow(rhow){
    var rhow_min = parseFloat( $("#rhow_min").val() ),
        rhow_max = parseFloat( $("#rhow_max").val() );
    
    return (rhow > rhow_min && rhow < rhow_max);
    
}


function calculateRhowBalanced(fc, fy){

    var beta   = calculateBeta( fc );       
    
    //console.log(fc, fy, beta);

    //fc, fy are in ksi
    var top = 0.85 * fc * beta * 87.0;
    var bottom   = (87.0 + fy) * fy;
    
    var p_balanced = top / bottom;
    
    return p_balanced;
}

function displayRhowBalanced(){
    var fc     = parseFloat( $("#fc").val() ), //stupid js math problems
        fy     = parseFloat( $("#fy").val() );
    
    var p_balanced  = calculateRhowBalanced(fc, fy);
    $("#rhow_balanced").text( roundTo(p_balanced,4) );
}

function calculateBeta( fc ){
    //fc is in ksi
    //if fc is smaller than 4ksi, the value of beta is .85
    if(fc <= 4){
        return .85;
    }
    
    var beta     = .85 - (.05 * (fc - 4) );
    
    //beta can't be lower than .65
    return beta <= .65 ? .65 : prec(beta);
}

function calculateRhowMin(){

    //convert fc, fy to psi
    var fc     = parseFloat( $("#fc").val() ) * 1000,
        fy     = parseFloat( $("#fy").val() ) * 1000;


    var p_min = 3 * Math.sqrt( fc ) / fy;

    return p_min > (200 / fy) ? p_min : (200 / fy);
}

function calculateRhowMax(){
    
    //fc, fy are in ksi
    var fc          = parseFloat( $("#fc").val() ), //stupid javascript math problems
        fy          = parseFloat( $("#fy").val() ),
        p_balanced  = calculateRhowBalanced(fc, fy);
        
    //find youngs modulus of steel (Force , which is steel divided by its density
    var eps_y       = fy / Steel.E;
    var p_max       = ( (Concrete.max_strain + eps_y) / .007) * p_balanced;
    
    
    return p_max;
     
    
}



function calculateRhow(){
    
    var m      = parseFloat( $("#m_ultimate").val() ),
        phi    = parseFloat( $("#phi").val() ),
        fc     = parseFloat( $("#fc").val() ),
        fy     = parseFloat( $("#fy").val() ),
        b      = parseFloat( $("#beam_diameter").val() ),
        d      = parseFloat( $("#height_rebars").val() )
        
       // var bb  = getNum("beam_diameter");
    
    var c      = m / (phi * fc * b * d * d );
    
    var q      = quatraticEquation(.59, -1, c);
    
    var rhow   = _.min(q) * (fc / fy);
    
    return rhow;

}


function calculateRebarAreaRequired(){
    var p         = parseFloat( $("#rhow").val() ),
        b         = parseFloat( $("#beam_diameter").val() ),
        d         = parseFloat( $("#height_rebars").val() );
    

    return (p * b * d);
    
}

    
//var RebarClass = Base.extend({
//  type:         0,
//  
//  constructor: function(json) {
//    this.type = json.type;
//  },
//
//  diameter: function(){
//    return  this.type / 8;
//  },
//  
//  area: function(){
//    return circleArea( this.diameter() );
//  }
//  
//});

function rhowBasedOnRebarArea(type, count, d, b){

    var p   =  totalRebarArea(type, count ) / (d * b);
    
    return p;
}

//function checkRebarArea(rebar){
//    var d         = $("#height_rebars").val(),
//        b         = $("#beam_diameter").val();
//        
//    //var rhow      = totalRebarArea(rebar) / (b * d);
//    var p         = rhowBasedOnRebarArea(rebar);
//    return checkRhow(p);
//
//}

function getValidRebars(){
    var rebars          = [];
    var available       = [3, 4, 5, 6, 7, 8, 9, 10];
    
    //console.log( calculateRebarCount(8) );
    for(re in available){
        var rebar = calculateRebarCount(available[re]);
        if(rebar.length){
            rebars.push(rebar);
        }
    }
    drawValidRebars(rebars);
   
   
}

function calculateRebarCount(rebar){

    var validRebars     = [];
    
    var cover           = parseFloat( $("#cover").val() ),
        rebar_diameter  = rebarDiameter(rebar),
        d               = parseFloat( $("#height_rebars").val() ),
        b               = parseFloat( $("#beam_diameter").val() ),
        rebar_area_required = parseFloat( $("#a_steel_required").val() ),
        p_max           = parseFloat( $("#rhow_max").val() ),
        i               = 2;
        
    for(i; i < 30; i++) {
        var rebar_count = i;
        
        var spacing     = (b - (2 * cover) - (rebar_count * rebar_diameter)) / (rebar_count - 1);
        
        //check if spacing is ok
        if( spacing > minimumRebarSpacing( rebar ) ){
        
            var total_rebar_area        = totalRebarArea(rebar, rebar_count);
            //var rebar_area_required     = calculateRebarAreaRequired();
            
            var Rebar   = {
                type:       rebar,
                count:      rebar_count,
                spacing:    spacing,
                p:          rhowBasedOnRebarArea(rebar, rebar_count, d, b),
                area:       total_rebar_area
            };
                        
            
            
            //if(checkRebarArea(Rebar) ){
             //   validRebars.push(Rebar);
            //}

            //validRebars.push(Rebar);

            //check if we have the required area
            if( total_rebar_area > rebar_area_required){
                if(Rebar.p < p_max){
                    validRebars.push(Rebar);
                }
            }
            
            //else{
            //    console.log(Rebar,"bad", total_rebar_area, rebar_area_required);
            //}

            //validRebars.push(Rebar);
            
        } else{
            break;
        }
    }    
    
    return validRebars;

}



function minimumRebarSpacing(rebar){
   var rebar_diameter   = rebarDiameter(rebar);
   if( rebar_diameter <= 1){
    return 1;
   } else{
    return rebar_diameter;
   }
}



function rebarArea(rebar){
    rebar           = parseFloat( rebar );
    var diameter    = rebarDiameter(rebar),
        area        = circleArea(diameter);
    
    return area;

}

function totalRebarArea(type, count){
    var totalArea       = parseFloat(count) * rebarArea( type );
    return totalArea;
}


function rebarDiameter(rebar){
    return parseFloat( rebar / 8 );
}



function drawValidRebars(rebars){
    var $table      = $("#rebar_table");
    
    $table.html("");
    $("#best_rebar").hide();
    //console.log(rebars);
    $.each(rebars, function(i,rebar){
        
        $.each(rebar, function(j, re){
            console.log(isClose(1,re.spacing));
            var row = $("<tr/>");
            var tds      = '<td>'+re.type+'</td>';
                tds     += '<td>'+re.count+'</td>';
                tds     += '<td>'+roundTo(re.spacing,3)+'</td>';
                tds     += '<td>'+roundTo(re.area,3)+'</td>';
                tds     += '<td>'+roundTo(re.p, 4)+'</td>';
            row.html(tds);
            if(i == 0 && j == 0){
                row.addClass("twip").data({
                    id:     "best_rebar",
                    pos:    "right"
                })
            }
            $table.append(row);
        });
        
    });
    
    $table.find(".twip").twipsy();


}








function circleArea(diameter){
    return (diameter * diameter * $PI / 4);
}




function quatraticEquation(a, b, c){
     var x      = [];
     var a2     = 2*a;
     var ac     = 4*a*c;
     var dis    = b*b;
     var dis    = dis-ac;
     
     if(dis >= 0){
        var dis_sqrt=Math.sqrt(dis);
        var x1=-b+dis_sqrt;
        var x1=x1/a2;
        var x2=-b-dis_sqrt;
        var x2=x2/a2;
        
        x.push(x1);
        x.push(x2);
     }
     
     return x;

}

function isClose(real, compared){
    real = parseFloat( real );
    compared = parseFloat( compared );
   var val =  (real - compared) / compared;
       val =  Math.abs(val) * 100;
   return val;
}


function getNum( id ){
    var field = $("#" + id);
    var unit    = $("#" + id + "_unit").length ? $("#" + id + "_unit").val() : 0;
    var val     = parseFloat( field.val() );
        
    var number = new Num(val, unit, "length");
    return number;
}

var Num = Class.extend({
  val:      0,
  unit:     0,
  type:     "length",
  init: function(val, unit, type){
    this.unit   = unit;
    this.val    = val;
    this.type   = type;
    
  },
  
  convert: function(unit){
        var func    = "to_"+unit;
        switch(this.type){
            case "length":
                var val     = LengthUnits[func](this);
                this.val    = val;
                this.unit   = unit;
            break;
            case "pressure":
            
            break;
        }
  }
  
});



(function($) {
    $.fn.num = function(val, unit, type) {
        
    }

    $.fn.convert = function(unit) {
        this.each( function( i ) {
        
        });
        return this; //for chaining
    }
});

var LengthUnits  = {
    units: [
        {id:"mm",   short: "mm",    long: "Milimeter",  system: "SI"},
        {id:"cm",   short: "cm",    long: "Centimeter", system: "SI"},
        {id:"m",    short: "m",     long: "Meter",      system: "SI"},
        {id:"km",   short: "km",    long: "Kilometer",  system: "SI"},
        {id:"in",   short: "in",    long: "Inch",       system: "IM"},
        {id:"ft",   short: "ft",    long: "Feet",       system: "IM"}
    ],
    
    to_mm: function(num){
    
    },
    to_cm: function(num){
    
    },
    
    to_ft: function(num){
        var val      = 0;
        switch(num.unit){
            case "ft": val =  num.val; break;
            case "mm": break;
            case "in": val = num.val / 12; break;   
        }
        return val;
    },
    
    to_in: function(num){
        var val      = 0;
        switch(num.unit){
            case "ft": val =  num.val * 12; break;
            case "mm": break;
            case "in": val = num.val; break;   
        }
        return val;
    }
    
};

var PressureUnits = {
    units: [
        {id:"psi",   short: "psi",  long: "Pounds / in^2",  system: "IM"},
        {id:"ksi",   short: "ksi",    long: "KiloPounds / in^2", system: "IM"},
        {id:"m",    short: "m",     long: "Meter",      system: "SI"},
        {id:"km",   short: "km",    long: "Kilometer",  system: "SI"},
        {id:"in",   short: "in",    long: "Inch",       system: "IM"},
        {id:"ft",   short: "ft",    long: "Feet",       system: "IM"}
    ],
    
    to_ksi: function(num){
        return 1000 * psi
    },
    to_psi: function(num){
    
    }
};

//constants
var Concrete = {
    max_strain: 0.003
}
var Steel = {
    E: 29000        //Modulus of Elasticity (ksi)
    
}


$(document).ready(function(){
    $("input").keyup(function(){
        calculateVars();
    })

    //position twipsies
  $('#results .twip').twipsy();

    $(".checker").change(function(){
        var id  = $(this).parent().data("id");
        
        if($(this).is(":checked")){
            $("#" + id).fadeIn();
        } else{
            $("#" + id).fadeOut();
        }
    });
    
    $(".checker").each(function(){
        var $twipsy = $("#" + $(this).parent().data("id") );
        if($(this).is(":checked")){
            $twipsy.show();
        } else{
            $twipsy.hide();
        }
    });
    
    calculateVars();
    
        

});

/*
    mu = phi * fc * b * d^2 * q(1-.59q) 
    
    q = p * (fy/fc)
    
    find den kleinsten Beam, 

*/


