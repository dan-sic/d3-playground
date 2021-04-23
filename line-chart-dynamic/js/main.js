const margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;

const svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
        ", " + margin.top + ")");

// Time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y");
const formatTime = d3.timeFormat("%d/%m/%Y");
const numberFormat = d3.format(",.2r");
// For tooltip
const bisectDate = d3.bisector(d => d.date).left;

// Scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const datesRange = d3.scaleTime()
    .domain([new Date(2013, 4, 12), new Date(2017, 9, 31)])
    .ticks(d3.utcDay);
const numberToDateScale = d3.scaleOrdinal().domain(Array(1633).fill(1).map((v, i) => v + i)).range(datesRange);

// Axis generators
const xAxisCall = d3.axisBottom().ticks(7)
const yAxisCall = d3.axisLeft()
    .ticks(6)
    .tickFormat(formatYAxisTicks);

// Axis groups
const xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
const yAxis = g.append("g")
    .attr("class", "y axis")

const xAxisLabel = g.append("text")
    .attr("font-size", "24px")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${width / 2}, ${400})`)
    .text("Time");
  
const yAxisLabel = g.append("text")
    .attr("font-size", "24px")
    .attr("text-anchor", "middle")
    .attr("x", - (height / 2))
    .attr("y", - 60)
    .attr("transform", `rotate(-90)`);

/******************************** Tooltip Code ********************************/

const focus = g.append("g")
    .attr("class", "focus")
    .style("display", "none");

focus.append("line")
    .attr("class", "x-hover-line hover-line")
    .attr("y1", 0)
    .attr("y2", height);

focus.append("line")
    .attr("class", "y-hover-line hover-line")
    .attr("x1", 0)
    .attr("x2", width);

focus.append("circle")
    .attr("r", 7.5);

focus.append("text")
    .attr("x", 15)
    .attr("dy", ".31em");

const tooltipOverlay = g.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", () => focus.style("display", null))
    .on("mouseout", () => focus.style("display", "none"));

    /******************************** Tooltip Code ********************************/


const coinSelect = document.querySelector("#coin-select");
const variantSelect = document.querySelector("#var-select");
const dateLabel1 = document.querySelector("#dateLabel1");
const dateLabel2 = document.querySelector("#dateLabel2");


d3.json("data/coins.json").then(function(data) {
    
    const formattedData = {
        bitcoinData: formatCoinData(data.bitcoin),
        bitcoinCashData: formatCoinData(data.bitcoin_cash),
        ethereumData: formatCoinData(data.ethereum),
        litecoinData: formatCoinData(data.litecoin),
        rippleData: formatCoinData(data.ripple),
    }
    
    update(formattedData[coinSelect.value], variantSelect.value);
    yAxisLabel.text(mapVariantToYLabel(variantSelect.value))
    
    coinSelect.addEventListener("change", (e) => {
        update(formattedData[e.target.value], variantSelect.value)
    })
    
    variantSelect.addEventListener("change", (e) => {
        update(formattedData[coinSelect.value], e.target.value);
        yAxisLabel.text(mapVariantToYLabel(e.target.value));
    })

    $("#date-slider").slider({
        min: 1,
        max: 1633,
        range: true,
        values: [1, 1633],
        slide: (event, ui) => {
            const minDate = numberToDateScale(ui.values[0]);
            const maxDate = numberToDateScale(ui.values[1]);

            dateLabel1.textContent = formatTime(minDate);
            dateLabel2.textContent = formatTime(maxDate);

            const filteredData = formattedData[coinSelect.value].filter(item => item.date > minDate && item.date < maxDate);

            update(filteredData, variantSelect.value);
        }
    })
});

function update(data, variant) {
    g.selectAll("path").remove();

    // Line path generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d[variant]));

    // Set scale domains
    x.domain(d3.extent(data, d => d.date));
    y.domain([d3.min(data, d => d[variant]), 
        d3.max(data, d => d[variant])]);
    // y.domain([d3.min(data, d => d[variant]) / 1.005, 
    //     d3.max(data, d => d[variant]) * 1.005]);

    // Generate axes once scales have been set
    xAxis.transition().duration(400).call(xAxisCall.scale(x))
    yAxis.transition().duration(400).call(yAxisCall.scale(y))

    // Add line to chart
    g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-with", "3px")
        .attr("d", line(data));

        /******************************** Tooltip Code ********************************/


    tooltipOverlay.on("mousemove", () => {
        // get X coordinate on the chart and map it to date
        var xDate = x.invert(d3.event.layerX - 265),
        // find at which index in data array sits item with this date
        index = bisectDate(data, xDate, 1),
        previousDataItem = data[index - 1],
        dataItem = data[index],
        d = xDate - previousDataItem.date > dataItem.date - xDate ? dataItem : previousDataItem;
        // move focus element to coordinates of the element on the chart
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d[variant]) + ")");
        focus.select("text").text(numberFormat(d[variant]));
        focus.select(".x-hover-line").attr("y2", height - y(d[variant]));
        focus.select(".y-hover-line").attr("x2", -x(d.date));
    })
}

function formatCoinData(data) {
    return data.map(item => ({
        vol: +item["24h_vol"],
        date: parseTime(item.date),
        marketCap: +item.market_cap,
        price: +item.price_usd
    })).filter(item => item.vol > 0 && item.marketCap > 0 && item.price > 0)
}

function formatYAxisTicks(d) {
    if (d > 999999999) {
        return d / 1000000000 + "B"
    } else if (d > 999999) {
        return d / 1000000 + "M"
    } else if (d > 999) {
        return d / 1000 + "k";
    } else {
        return d;
    }
}

function mapVariantToYLabel(variant) {
    if (variant === "price") {
        return "Price (USD)"
    } else if (variant === "marketCap" ) {
        return "Market capitalization (USD)"
    } else {
        return "24 Hour Trading Volume (USD)"
    }
}