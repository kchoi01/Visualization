var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;   
var exs = ["Squat", "Bench", "Row", "OH Press", "DeadLift"];
var colors = d3.scale.category10();
var allData;
var svg;

function ShowDailySummary(ex)
{
    d3.select("#summary").remove();
    var daily = allData.filter(function(d){return d.Date.getTime() === ex.Date.getTime();});
    var s = svg.append("g").attr("id", "summary")
    s.append("text")
    .attr("x", margin.left)
    .attr("y", height + margin.top + margin.bottom)
    .attr("dy", 2)
    .attr("text-anchor", "start")
    .style("fill", "black")
    .text("Date: " + (ex.Date.getMonth() + 1) + "/" + ex.Date.getDate() + "/" + ex.Date.getFullYear());
    
    for (d in daily)
    {
        var r = daily[d];
        s.append("text")
        .attr("x", margin.left + 120)
        .attr("y", height + margin.top + margin.bottom)
        .attr("dy", 2 * (d + 1))
        .attr("text-anchor", "start")
        .style("fill", "black")
        .text(r.Exercise + ":\tWeight = " + r.Weight + "\tSets = " + r.Sets + "\tReps = " + r.Reps);
    }
}

function Show(data)
{
    svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 120)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");
    var line = d3.svg.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.Weight); });
        
      x.domain(d3.extent(data, function(d) { return d.Date; }));
      y.domain([0, d3.max(data, function(d){return d.Weight;})]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Weight (LB)");
        
      for (e in exs)
      {
          var nd = data.filter(function(d){return d.Exercise == exs[e];});
          svg.append("path")
            .datum(nd)
            .attr("class", "line")
            .attr("d", line)
            .attr("stroke-width", 2)
            .attr("stroke", colors(e))
            .attr("fill", "none");
            
          var point = svg.append("g").attr("class", "line-point");
            
          point.selectAll("circle")
            .data(nd)
            .enter().append('circle')
            .attr("cx", function(d) { return x(d.Date) })
            .attr("cy", function(d) { return y(d.Weight) })
            .attr("r", 5.5)
            .style("fill", colors(e))
            .style("stroke", colors(e))
            .on("mouseover", function(d)
                {
                   var txt = d.Exercise + " Sets " + d.Sets + " Reps " + d.Reps;
                   svg.append("text")
                      .attr("id", "tooltip")
                      .attr("x", d3.select(this).attr("cx"))
                      .attr("y", d3.select(this).attr("cy") - 20)
                      .attr("text-anchor", "middle")
                      .attr("font_family", "sans-serif")
                      .attr("font-size", "11px")
                      .attr("fill", d3.select(this).style("fill"))
                      .text(txt)
                      .style("pointer-events", "none");
                })
            .on("mouseout", function() {d3.select("#tooltip").remove();})
            .on("click", function(d) { ShowDailySummary(d); });
            
          svg.append("text")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("dy", 2 * (e+1))
            .attr("text-anchor", "start")
            .style("fill", colors(e))
            .text(exs[e]);
      }
}

function Transform(data)
{
    var formatDate = d3.time.format("%m/%d/%Y");
    data.Date = formatDate.parse(data.Date);
    data.Reps = +data.Reps;
    data.Sets = +data.Sets;
    data.Weight = +data.Weight;
    return data;
}

d3.csv("September2015.csv", function(error, data)
{
    if (error)
    {
        throw error;
    }
    else
    {
        data.forEach(Transform);
        allData = data;
        Show(data);
    }
});