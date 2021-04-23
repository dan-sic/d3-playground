// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 50 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
// second argument is for mapping items
d3.csv("data/data.csv", d => ({ date: d3.timeParse("%Y-%m-%d")(d.date), value: d.value })).then(data => {
  // Add X axis --> it is a date format
  const x = d3
  .scaleTime()
  .domain(
    d3.extent(data, d => d.date)
  )
  .range([0, width]);
svg
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add Y axis
var y = d3
  .scaleLinear()
  .domain([
    0,
    d3.max(data, function (d) {
      return +d.value;
    }),
  ])
  .range([height, 0]);
svg.append("g").call(d3.axisLeft(y));

// instead of line(), define area()
const area = d3.area()
  .x(d => x(d.date))
  .y0(y(0))
  .y1(d => y(d.value))

// Add the area
svg
  .append("path")
  .datum(data)
  .attr("fill", "#cce5df")
  .attr("stroke", "#69b3a2")
  .attr("stroke-width", 1.5)
  .attr(
    "d",
    area
  );
})