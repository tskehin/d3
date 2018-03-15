var animateDuration = 1800,
    animateDelay = 30;

var svg1 = d3.select("#timeSeries")
var svg2 = d3.select("#wordCount")

var seriesWidth = +svg1.attr("width")
var seriesHeight = +svg1.attr("height")

var ChartWidth = +svg2.attr("width")
var ChartHeight = +svg2.attr("height")

var margin = {top: 10, right: 100, bottom: 20, left: 60},
    width = seriesWidth - margin.left - margin.right,
    height = seriesHeight/4 - margin.top - margin.bottom;

var margin2 = {top: 20, right: 20, bottom: 10, left: 40},
    width2 = ChartWidth - margin2.left - margin2.right,
    height2 = ChartHeight - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%Y-%m-%d");
    parseDateRead = d3.timeFormat("%d %B %Y")
    bisectDate = d3.bisector(function(d) { return d.Date; }).left,
    formatValue = d3.format(",.2f"),
    formatDollar = function(d) { return "$" + formatValue(d); },
    formatEuro = function(d) { return "€" + formatValue(d); };


var x = d3.scaleTime()
    .rangeRound([0, width]);

var y1 = d3.scaleLinear()
    .rangeRound([height, 0]);

var y2 = d3.scaleLinear()
    .rangeRound([height, 0]);

var y3 = d3.scaleLinear()
    .rangeRound([height, 0]);

var y4 = d3.scaleLinear()
    .rangeRound([height, 0]);


var x2 = d3.scaleBand()
    .rangeRound([0, width2])
    .padding(0.1);

var y5 = d3.scaleLinear()
    .rangeRound([height2, 0]);


var line1 = d3.line()
    .x(function(d) { return x(d.Date); })
    .y(function(d) { return y1(d.Open); });

var line2 = d3.line()
    .x(function(d) { return x(d.Date); })
    .y(function(d) { return y2(d.Value); });

var line3 = d3.line()
    .x(function(d) { return x(d.Date); })
    .y(function(d) { return y3(d.Value); });

var line4 = d3.line()
    .x(function(d) { return x(d.Date); })
    .y(function(d) { return y4(d.Open); });


var globalDate = ""; 

function click() {
  
  console.log(globalDate);
  console.log(globalDate.toISOString().substring(0, 10));

  clickDate = globalDate.toISOString().substring(0, 10);
  dailyWords = globalWords[clickDate]

  console.log(dailyWords);

  // scale the range of the data
  x2.domain(dailyWords.map(function(d) { return d.Word; }));
  y5.domain([0, d3.max(dailyWords, function(d) { return d.Count; })]);

  d3.select("#g5").remove();

  var g5 = svg2.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "g5");

  // add x axis
  g5.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(d3.axisBottom(x2));
  
  // add y axis
  g5.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y5))
  
  
  // Add bar chart
  g5.selectAll("bar")
      .data(dailyWords)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x2(d.Word); })
      .attr("width", x2.bandwidth())
      .attr("y", height2 )
      .attr("height", 0 );

  g5.selectAll(".bar")
    .transition()
    .attr("height", function(d) { return height2 - y5(d.Count); })
    .attr("y", function(d) { return y5(d.Count); })
    .duration(animateDuration)
    .delay(animateDelay);

g5.append("g")
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "translate(500,0)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("class","axislabel")
        .style("text-anchor", "end")
        .text("Most commonly appearing words on: " + parseDateRead(globalDate));

}

var client = new XMLHttpRequest();
client.open('GET', "data/word_counts.json");
client.onreadystatechange = function() {
  
  globalWords = JSON.parse(client.responseText);

  }
  client.send();


//DJI TimeSeries
var g1 = svg1.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "g1");

d3.csv("data/DJI.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.Date = parseDate(d.Date);
    d.Open = +d.Open;
  });

  data.sort(function(a, b) {
    return a.Date - b.Date;
  });

  x.domain([data[0].Date, data[data.length - 1].Date]);
  y1.domain(d3.extent(data, function(d) { return d.Open; }));

  g1.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .call(d3.axisBottom(x).ticks(5));

  g1.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y1))
      .call(d3.axisLeft(y1).ticks(6));

  g1.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line1);


  var focus = g1.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
        .attr("r", 4.5);

  focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

  g1.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove)
          .on("click", click);

  g1.append("g")
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "translate(220,0)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("class","axislabel")
        .style("text-anchor", "end")
        .text("Dow Jones Industrial Average");

  var line = g1.append("g")

  line.append("line")
      .attr("id", "line")
      .attr("stroke","black")
      .attr("x1", 0)
      .attr("x2", 2)
      .attr("y2", 0)
      .attr("y2", seriesHeight - 1.5*margin.bottom);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;

    globalDate = d.Date

    focus.attr("transform", "translate(" + x(d.Date) + "," + y1(d.Open) + ")");
    focus.select("text").text(formatValue(d.Open))
    line.attr("transform", "translate(" + x(d.Date) + ",0)");
  };


//WTICrude Time Series
var g2 = svg1.append("g")
    .attr("transform", "translate(" + margin.left + "," + (0.25*seriesHeight + margin.top) + ")")
    .attr("id", "g2");

d3.csv("data/WTICrudeOil.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.Date = parseDate(d.Date);
    d.Value = +d.Value;
  });

  data.sort(function(a, b) {
    return a.Date - b.Date;
  });

  x.domain([data[0].Date, data[data.length - 1].Date]);
  y2.domain(d3.extent(data, function(d) { return d.Value; }));

  g2.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g2.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y2))
      .call(d3.axisLeft(y2).tickFormat(function(d) { return "$" + d; }).ticks(8));

  g2.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line2);

  var focus = g2.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
        .attr("r", 4.5);

  focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

  g2.append("g")
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "translate(110,0)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("class","axislabel")
        .style("text-anchor", "end")
        .text("WTI Crude Oil");

  g2.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove)
          .on("click", click);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;

    globalDate = d.Date

    focus.attr("transform", "translate(" + x(d.Date) + "," + y2(d.Value) + ")");
    focus.select("text").text(formatDollar(d.Value))
    line.attr("transform", "translate(" + x(d.Date) + ",0)");
  }


//GBPUSD Time Series
var g3 = svg1.append("g")
    .attr("transform", "translate(" + margin.left + "," + (0.5*seriesHeight + margin.top) + ")")
    .attr("id", "g3");

d3.csv("data/GBPUSD.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.Date = parseDate(d.Date);
    d.Value = +d.Value;
  });

  data.sort(function(a, b) {
    return a.Date - b.Date;
  });

  x.domain([data[0].Date, data[data.length - 1].Date]);
  y3.domain(d3.extent(data, function(d) { return d.Value; }));

  g3.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g3.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y3))
      .call(d3.axisLeft(y3).tickFormat(function(d) { return formatDollar(d); }).ticks(8));

  g3.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line3);

  var focus = g3.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
        .attr("r", 4.5);

  focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

  g3.append("g")
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "translate(78,0)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("class","axislabel")
        .style("text-anchor", "end")
        .text("GBP/USD");

  g3.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove)
          .on("click", click);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;

    globalDate = d.Date

    focus.attr("transform", "translate(" + x(d.Date) + "," + y3(d.Value) + ")");
    focus.select("text").text(formatDollar(d.Value))
    line.attr("transform", "translate(" + x(d.Date) + ",0)");
  }


//MLYAF Time Series
var g4 = svg1.append("g")
    .attr("transform", "translate(" + margin.left + "," + (0.75*seriesHeight + margin.top) + ")")
    .attr("id", "g4");

d3.csv("data/FYFF.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.Date = parseDate(d.Date);
    d.Open = +d.Open;
  });

  data.sort(function(a, b) {
    return a.Date - b.Date;
  });

  x.domain([data[0].Date, data[data.length - 1].Date]);
  y4.domain(d3.extent(data, function(d) { return d.Open; }));

  g4.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g4.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y4))
      .call(d3.axisLeft(y4).tickFormat(function(d) { return formatEuro(d);}).ticks(8));

  g4.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line4);

  var focus = g4.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
        .attr("r", 4.5);

  focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

  g4.append("g")
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "translate(202,0)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .style("text-anchor", "end")
        .attr("class","axislabel")
        .text("Fyffes Plc. Ordinary Shares");

  g4.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove)
          .on("click", click);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;

    globalDate = d.Date

    focus.attr("transform", "translate(" + x(d.Date) + "," + y4(d.Open) + ")");
    focus.select("text").text(formatEuro(d.Open))
    line.attr("transform", "translate(" + x(d.Date) + ",0)");
  }
});
});
});
});