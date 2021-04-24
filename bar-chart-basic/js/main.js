const margin = {left: 100, top: 10, right: 10, bottom: 100 };

const canvasWidth = 700;
const canvasHeight = 500;

const chartWidth = canvasWidth - margin.left - margin.right;
const chartHeight = canvasHeight - margin.top - margin.bottom;

const canvas = d3.select("#chart-area").append("svg").attr("height", canvasHeight).attr("width", canvasWidth);

const chartGroup = canvas.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

chartGroup.append("text")
  .attr("font-size", "24px")
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${chartWidth / 2}, ${450})`)
  .text("Month");

chartGroup.append("text")
  .attr("font-size", "24px")
  .attr("text-anchor", "middle")
  .attr("x", - (chartHeight / 2))
  .attr("y", - 60)
  .attr("transform", `rotate(-90)`)
  .text("Revenue");

d3.json("data/revenues.json").then(data => {
  console.log(data)

  const yScale = d3.scaleLinear().domain([d3.max(data, d => d.revenue), 0]).range([0, chartHeight]);
  const xScale = d3.scaleBand().domain(data.map(d => d.month)).range([0, chartWidth]).paddingOuter(0.2).paddingInner(0.3);

  const xAxis = d3.axisBottom(xScale)
  chartGroup.append("g").attr("transform", `translate(0, ${chartHeight})`).call(xAxis);

  const yAxis = d3.axisLeft(yScale).tickFormat(revenue => `$${revenue}`)
  chartGroup.append("g").call(yAxis)

  chartGroup.selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("height", d => chartHeight - Number(yScale(d.revenue)))
  .attr("width", xScale.bandwidth())
  .attr("fill", "grey")
  .attr("x", d => xScale(d.month))
  .attr("y", d => Number(yScale(d.revenue)))
})