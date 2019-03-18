function player(data){
    
var width = 1000,
    height = 500,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 20,
    viewBox = '250 -50 700 700',
   preserverAspectRatio = 'xMinYmin';


// The largest node for each cluster.
var clusters = new Array(20);
var div = d3.select("body").append("div") 
    .attr("class", "tooltip_club")       
    .style("opacity", 0);


var nodes = data.map(function(d) {

      var i = +d.group,
      r = (+d.amount),
      d = {cluster: i, radius: r, team: d.team, fill: d.fill, name:d.name, position_to : d.position_to, position_from:d.position_from, from:d.from, id:d.id};
      if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
      return d;
    });


    
pack = d3.layout.pack()
    .sort(null)
    .size([width, height])
    .children(function(d) { return d.values; })
    .value(function(d) { return d.radius * d.radius; })
    .nodes({values: d3.nest()
      .key(function(d) { return d.cluster; })
      .entries(nodes)});

var force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
    .gravity(.02)
    .charge(0)
    .on("tick", tick)
    .start();
 
var svg = d3.select(".player")
    .append("svg")
     .attr('viewBox', viewBox)
    .attr('preserverAspectRatio', preserverAspectRatio);


var node = svg.selectAll("circle")
    .data(nodes)
  .enter().append("circle").attr('class', function(d){return d.id})
    .style("fill", function(d) { return d.fill; })
    .on("mouseover", function(d) { 
            div.transition()    
                .duration(1)    
                .style("opacity", 1);    
            div.html(
              
              '<div class="player_image " style="background-position: ' + d.position_from + '" ></div>' 
              +'<div class= "arrow"></div>'
              +'<div class="player_image pos_from" style="background-position: ' + d.position_to + '" ></div>'
              +"<div class='player_data '><p>Name: " + d.name + "</p><p>"
              + "<p>Amount: " + d.radius + " million &pound;</p><p>"
              + "<p>From: " + d.from + "</p><p></div>"

               ). style("left", pos(d3.event.pageX))   
                .style("top", hi(d3.event.pageY));      
               
            }).on("mousemove", function(d) {
             div.transition()    
                .duration(1)    
                .style("opacity", .9);    
            div .html(

              '<div class="player_image " style="background-position: ' + d.position_from + '" ></div>' 
              +'<div class= "arrow"></div>'
              +'<div class="player_image pos_from" style="background-position: ' + d.position_to + '" ></div>'
              +"<div class='player_data' style='opacity:1'><p>Name: " + d.name + "</p><p>"
              + "<p>Amount: " + d.radius + " million &pound;</p><p>"
              + "<p>From: " + d.from + "</p><p></div>"
               )    
                .style("left", pos(d3.event.pageX))   
                .style("top", hi(d3.event.pageY))
                .style("height","200px");  
            })
            .on("mouseout", function(d) {   
              div.transition()    
                 .duration(1)    
                .style("opacity", 0); 
            }).call(force.drag);

node.transition()
    .duration(750)
    .delay(function(d, i) { return i * 5; })
    .attrTween("r", function(d) {
      var i = d3.interpolate(0, d.radius);
      return function(t) { return d.radius = i(t); };
    });

            


$('circle').on('click', function () {

  $('circle').removeAttr('id');
  var hoverClass = $(this).attr("class");
  var text = "circle:not(." + hoverClass + ")"
  $(text).attr('id', 'fade');
   
})

$("circle").blur(function(){
      $('circle').removeAttr('id');
    });







function pos(da){
    var width = $( 'svg' ).width()/2;
    if($(window).width()<768){
      return 30 + 'px'
      debugger;
    }else{
      if(da <= width){return da + 20 +'px'}
      else if (da > width){return (da - 310)+'px' }
  };
};
  function hi(da){
      var height = $( document ).height()/2;
      if($(window).width()<768){
      return (da - 200) + 'px'
      debugger;
      }else{

      if(da <= (height-100)){return da +'px'}
      else if (da > (height-100)){return (da - 200)+'px' }
    };
  };






function tick(e) {
  node
      .each(cluster(10 * e.alpha * e.alpha))
      .each(collide(.1))
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// Move d to be adjacent to the cluster node.
function cluster(alpha) {
  return function(d) {
    var cluster = clusters[d.cluster];
    if (cluster === d) return;
    var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
    if (l != r) {
      l = (l - r) / l * alpha;
      d.x -= x *= l;
      d.y -= y *= l;
      cluster.x += x;
      cluster.y += y;
    }
  };
}

// Resolves collisions between d and all other circles.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}

};

function club(){
 
data = [
  {
    "group_b": 1,
    "b_team": "Arsenal",
    "id": "Arsenal",
    "net": 94,
    "b_fill": "#950319",
    "b_position_from": "-800px -100px;"
  },
  {
    "group_b": 2,
    "b_team": "Bournemouth",
    "id": "Bournemouth",
    "net": 36.4,
    "b_fill": "url('#repeat1')",
    "b_position_from": "-300px -600px;"
  },
  {
    "group_b": 3,
    "b_team": "Burnley",
    "id": "Burnley",
    "net": 21.6,
    "b_fill": "#4f1521",
    "b_position_from": "-400px -600px;"
  },
  {
    "group_b": 4,
    "b_team": "Chelsea",
    "id": "Chelsea",
    "net": 122,
    "b_fill": "#324d9c",
    "b_position_from": "0px -500px;"
  },
  {
    "group_b": 5,
    "b_team": "Crystal Palace",
    "id": "CrystalPalace",
    "net": 56.5,
    "b_fill": "url('#repeat2')",
    "b_position_from": "-500px -200px;"
  },
  {
    "group_b": 6,
    "b_team": "Everton",
    "id": "Everton",
    "net": 48.5,
    "b_fill": "#254290",
    "b_position_from": "-100px -500px;"
  },
  {
    "group_b": 7,
    "b_team": "Hull City",
    "id": "HullCity",
    "net": 17.5,
    "b_fill": "url('#repeat7')",
    "b_position_from": "-0px -300px;"
  },
  {
    "group_b": 8,
    "b_team": "Leicester City",
    "id": "LeicesterCity",
    "net": 75.8,
    "b_fill": "#001e6c",
    "b_position_from": "-300px -300px;"
  },
  {
    "group_b": 9,
    "b_team": "Liverpool",
    "id": "Liverpool",
    "net": 70.4,
    "b_fill": "#c41222",
    "b_position_from": "-800px 0px;"
  },
  {
    "group_b": 10,
    "b_team": "Manchester City",
    "id": "ManchesterCity",
    "net": 171.65,
    "b_fill": "#8cbbe7",
    "b_position_from": "-100px 0px;"
  },
  {
    "group_b": 11,
    "b_team": "Manchester United",
    "id": "ManchesterUnited",
    "net": 145,
    "b_fill": "#d42b24",
    "b_position_from": "0px -100px;"
  },
  {
    "group_b": 12,
    "b_team": "Middlesbrough",
    "id": "Middlesbrough",
    "net": 20.8,
    "b_fill": "#be0903",
    "b_position_from": "-500px -600px;"
  },
  {
    "group_b": 13,
    "b_team": "Southampton",
    "id": "Southampton",
    "net": 44.75,
    "b_fill": "url('#repeat3')",
    "b_position_from": "-700px 0px;"
  },
  {
    "group_b": 14,
    "b_team": "Stoke City",
    "id": "StokeCity",
    "net": 18,
    "b_fill": "url('#repeat4')",
    "b_position_from": "-200px -100px;"
  },
  {
    "group_b": 15,
    "b_team": "Sunderland",
    "id": "Sunderland",
    "net": 27.1,
    "b_fill": "url('#repeat5')",
    "b_position_from": "-600px -500px;"
  },
  {
    "group_b": 16,
    "b_team": "Swansea City",
    "id": "SwanseaCity",
    "net": 32.75,
    "b_fill": "white",
    "b_position_from": "0px 0px;"
  },
  {
    "group_b": 17,
    "b_team": "Tottenham Hotspur",
    "id": "TottenhamHotspur",
    "net": 70.5,
    "b_fill": "white",
    "b_position_from": "-100px -600px;"
  },
  {
    "group_b": 18,
    "b_team": "Watford",
    "id": "Watford",
    "net": 58.8,
    "b_fill": "#fedc23",
    "b_position_from": "-200px -600px;"
  },
  {
    "group_b": 19,
    "b_team": "West Bromwich Albion",
    "id": "WestBromwichAlbion",
    "net": 22.5,
    "b_fill": "url('#repeat6')",
    "b_position_from": "-600px -600px;"
  },
  {
    "group_b": 20,
    "b_team": "West Ham United",
    "id": "WestHamUnited",
    "net": 43.65,
    "b_fill": "#7c2136",
    "b_position_from": "-300px -400px;"
  }
]


 var width = 1000,
    height = 500,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 2, // separation between different-color nodes
    maxRadius = 20,
    viewBox = '50 -100 1000 1000',
   preserverAspectRatio = 'xMidYmid';



// The largest node for each cluster.
  var clusters = new Array(20);

  var div = d3.select("body").append("div") 
      .attr("class", "tooltip_club")       
      .style("opacity", 0);


    var nodes = data.map(function(d) {
     
          var i = +d.group_b,
          r = (+d.net),
          d = {cluster: i, radius: r, team: d.b_team, fill: d.b_fill, position_from:d.b_position_from,id:d.id};
          if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
          return d;
        });


        
    pack = d3.layout.pack()
        .sort(null)
        .size([width, height])
        .children(function(d) { return d.values; })
        .value(function(d) { return d.radius * d.radius; })
        .nodes({values: d3.nest()
          .key(function(d) { return d.cluster; })
          .entries(nodes)});

    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(.02)
        .charge(0)
        .on("tick", tick)
        .start();
     
    var svg_1 = d3.select(".club")
        .append('svg')
        .attr('viewBox', viewBox)
    .attr('preserverAspectRatio', preserverAspectRatio);

   

    var node = svg_1.selectAll("circle")
        .data(nodes)
      .enter().append("circle").attr('class', function(d){return d.id})
        .style("fill", function(d) { return d.fill; })
        .on("mouseover", function(d) {   
                div.transition()    
                    .duration(1)    
                    .style("opacity", 1);    
                div.html(
               '<div class="player_image"  id="team_logo" style="background-position: ' + d.position_from + '" ></div>' 
              + "<div class='transfer_data'><p><b>"+d.team+"</b></p>"
              +"<p>Total Transfer Amount Spent: </p><div class='big_amount'>" + d.radius + " million &pound;</div><p>" 

                   ). style("left", pos(d3.event.pageX))   
                    .style("top", hi(d3.event.pageY));      
                   
                }).on("mousemove", function(d) {
                 div.transition()    
                    .duration(1)    
                    .style("opacity", .9);    
                div .html(

                 
              '<div class="player_image"  id="team_logo" style="background-position: ' + d.position_from + '" ></div>' 
              + "<div class='transfer_data'><p><b>"+d.team+"</b></p>"
              +"<p>Total Transfer Amount Spent: </p><div class='big_amount'>" + d.radius+ " million &pound;</div><p>" 
                   )    
                    .style("left", pos(d3.event.pageX))   
                    .style("top", hi(d3.event.pageY))
                    .style("height","150px");  
                })
                .on("mouseout", function(d) {   
                  div.transition()    
                     .duration(1)    
                    .style("opacity", 0); 
                }).call(force.drag);
         
    node.transition()
        .duration(750)
        .delay(function(d, i) { return i * 5; })
        .attrTween("r", function(d) {
          var i = d3.interpolate(0, d.radius);
          return function(t) { return d.radius = i(t); };
        });

                
$(document).ready(function(){
  
    $('circle').on('click', function () {
  
    $('circle').removeClass('fade');
    var hoverClass = $(this).attr("class");
    var text = "circle:not(." + hoverClass + ")"
    $(text).addClass('fade');
     
  })

  $("circle").blur(function(){
        $('circle').removeClass('fade');
      });
})



    function pos(da){
    var width = $( 'svg' ).width()/2;
    if($(window).width()<768){
      return 30 + 'px'
      debugger;
    }else{
      if(da <= width){return da + 20 +'px'}
      else if (da > width){return (da - 310)+'px' }
  };
};
    function hi(da){
      var height = $( document ).height()/2;
      if($(window).width()<768){
      return (da - 200) + 'px'
      debugger;
      }else{

      if(da <= height){return da +'px'}
      else if (da > height){return (da - 150)+'px' }
    };
  };



    function tick(e) {
      node
          .each(cluster(10 * e.alpha * e.alpha))
          .each(collide(.1))
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {
      return function(d) {
        var cluster = clusters[d.cluster];
        if (cluster === d) return;
        var x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + cluster.radius;
        if (l != r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          cluster.x += x;
          cluster.y += y;
        }
      };
    }

    // Resolves collisions between d and all other circles.
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(nodes);
      return function(d) {
        var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    };


};

d3.csv("data.csv", player)
club();
