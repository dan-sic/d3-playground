const margin = {left: 100, top: 10, right: 10, bottom: 100 };

const continents = ["europe", "asia", "americas", "africa"];

const canvasWidth = 800;
const canvasHeight = 500;

const chartWidth = canvasWidth - margin.left - margin.right;
const chartHeight = canvasHeight - margin.top - margin.bottom;

const minRadius = 3;
const maxRadius = 40;

const canvas = d3.select("#chart-area").append("svg").attr("width", canvasWidth).attr("height", canvasHeight);
const chartGroup = canvas.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

chartGroup.append("text")
  .attr("font-size", "24px")
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${chartWidth / 2}, ${450})`)
  .text("GDP Per Capita ($)");

const yearLabel = chartGroup.append("text")
  .attr("font-size", "24px")
  .attr("fill", "grey")
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${chartWidth - 50}, ${360})`)

chartGroup.append("text")
  .attr("font-size", "24px")
  .attr("text-anchor", "middle")
  .attr("x", - (chartHeight / 2))
  .attr("y", - 60)
  .attr("transform", `rotate(-90)`)
  .text("Life Expectancy (Years)");

const scaleX = d3.scaleLog().base(10).domain([142, 150000]).range([0, chartWidth]);
const scaleY = d3.scaleLinear().domain([0, 90]).range([chartHeight, 0]);
// with oridinal scale you only need to provide range values, and domain at runtime will be assigned to elements from range
const circleColorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(continents);
// for bubble chart set size of the circle, not the radius
const circleSizeScale = d3.scaleLinear().domain([2000, 1400000000]).range([getCircleSize(minRadius), getCircleSize(maxRadius)]);

const xAxis = d3.axisBottom(scaleX).tickValues([400, 4000, 40000]).tickFormat(n => {
	return "$" + n
})
chartGroup.append("g").attr("transform", `translate(0, ${chartHeight})`).call(xAxis);

const yAxis = d3.axisLeft(scaleY);
chartGroup.append("g").call(yAxis);

const legend = chartGroup.append("g").attr("transform", `translate(${chartWidth - 30}, ${250})`);

continents.forEach((continent, i) => {
	const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);

	row.append("rect").attr("height", 10).attr("width", 10).attr("fill", circleColorScale(continent))

	row.append("text").attr("x", -10).attr("y", 10).attr("text-anchor", "end").style("text-transform", "capitalize").text(continent)

})


d3.json("data/data.json").then(function(data){
	const formattedData = data.map(item => {
		item.countries = item.countries.filter(country => country.income && country.life_exp);
		return item;
	})

	const dataLength = formattedData.length;
	let dataIndex = 0;

	d3.interval(() => {
		dataIndex++;

		if (dataIndex >= dataLength) {
			dataIndex = 0;
		}

		update(formattedData[dataIndex])

	}, 100)

	update(formattedData[dataIndex])
});

function update(data) {
	
	// second argument to data()  > function that returns key, that is common for objects in different arrays (sort of like id)
	// necessary to avoid wierd bugs
	const virtualSelectors = chartGroup.selectAll("circle").data(data.countries, c => c.country);
	
	virtualSelectors.exit().remove();

	virtualSelectors.enter()
	.append("circle")
	.attr("fill", c => circleColorScale(c.continent))
	.merge(virtualSelectors)
		.transition().duration(100)
			.attr("r", c => getCircleRadius(circleSizeScale(c.population)))
			.attr("cy", c => scaleY(c.life_exp))
			.attr("cx", c => scaleX(c.income));


	yearLabel.text(data.year);
}

function getCircleSize(radius) {	
	return 2 * Math.PI * radius;
}

function getCircleRadius(circumference) {
	return circumference / (2 * Math.PI);
}