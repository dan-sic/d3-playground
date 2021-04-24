const dataTypeControl = document.querySelector("#data-type");

const margin = {left: 100, top: 10, right: 10, bottom: 100 };
const transition = d3.transition().duration(750);

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

const leftAxisLabel = chartGroup.append("text")
  .attr("font-size", "24px")
  .attr("text-anchor", "middle")
  .attr("x", - (chartHeight / 2))
  .attr("y", - 60)
  .attr("transform", `rotate(-90)`)
  .text("Revenue");

  // range defined statically, domain can be defined separately in update function
  const yScale = d3.scaleLinear().range([chartHeight, 0]);
  const xScale = d3.scaleBand().range([0, chartWidth]).paddingOuter(0.2).paddingInner(0.3);

  const xAxisGroup = chartGroup.append("g").attr("transform", `translate(0, ${chartHeight})`);
  const yAxisGroup = chartGroup.append("g");

d3.json("data/revenues.json").then(data => {

  update(data);

  dataTypeControl.addEventListener("change", e => {
    update(data, e.target.value);
    leftAxisLabel.text(e.target.value === "revenue" ? "Revenue" : "Profit")
  })
});

// update function only contains logic related to changes in domain
function update(data, dataType = "revenue") {
  yScale.domain([0, d3.max(data, d => Number(d[dataType]))]);
  xScale.domain(data.map(d => d.month));

  const xAxis = d3.axisBottom(xScale);
  xAxisGroup.transition(transition).call(xAxis);

  const yAxis = d3.axisLeft(yScale).tickFormat(dataType => `$${dataType}`)
  yAxisGroup.transition(transition).call(yAxis);

  // take all rectangles and bind current array data to it, if no rectangles, still returns object with 3 virtual selectors:
    // 1. enter() > has elements which are in array, but not displayed > these should be displayed
    // 2. exit() > elements displayed but not in array  > these should get removed
    // 3. groups() > elements displayed and in array > these should be updated
  const virtualSelectors = chartGroup.selectAll("rect")
  .data(data);

  // remove rectangles which are not in array
  virtualSelectors.exit().transition(transition).attr("y", yScale(0)).attr("height", 0).remove();

  // take elements which are in array and displayed, and add following props to them
  // virtualSelectors
  // .transition(transition)
  // .attr("x", d => xScale(d.month))
  // .attr("y", d => Number(yScale(d[dataType])))
  // .attr("height", d => chartHeight - Number(yScale(d[dataType])))
  //   .attr("width", xScale.bandwidth())

    // take elements from array which are not yet displayed, and create rectangles for them with following props
  // virtualSelectors.enter()
  //   .append("rect")
  //   .attr("x", d => xScale(d.month))
  //   .attr("y", yScale(0))
  //   .attr("height", 0)
  //   .attr("width", xScale.bandwidth())
  //   .attr("fill", "grey")
  //   .transition(transition)
  //   .attr("y", d => Number(yScale(d[dataType])))
  //     .attr("height", d => chartHeight - Number(yScale(d[dataType])))

  virtualSelectors.enter()
  .append("rect")
  .attr("fill", "grey")
  .attr("y", yScale(0))
  .attr("height", 0)
  .attr("x", d => xScale(d.month))
  .attr("width", xScale.bandwidth())
  // everything above merge, will apply to new elements in enter()
  // everything after the merge is applied to enter() and groups() selections
  .merge(virtualSelectors)
  // every attribute placed after transition will be subject to transition
    .transition(transition)
      .attr("x", d => xScale(d.month))
      .attr("y", d => Number(yScale(d[dataType])))
      .attr("height", d => chartHeight - Number(yScale(d[dataType])))
      .attr("width", xScale.bandwidth())
}