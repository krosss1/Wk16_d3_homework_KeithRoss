d3.select(window).on("resize", makeResponsive);
makeResponsive();

function makeResponsive() {

    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
        svgArea.remove();
    }

    var svgWidth = 960;
    var svgHeight = 500;

    var margin = {
        top: 40,
        right: 40,
        bottom: 80,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale var upon click on axis label
    function xScale(testData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(testData, d => d[chosenXAxis]) * 0.8,
            d3.max(testData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(testData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(testData, d => d[chosenYAxis]) * 0.8,
            d3.max(testData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // function used for updating yAxis var upon click on axis label
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles when clicking on new axis
    function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    // function used for updating the text in the circles group with a transition to
    // new circles when clicking on new axis
    function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
        textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis])+6);
        return textGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, textGroup) {
        if (chosenXAxis === "poverty") {
            var xlabel = "In Poverty:";
        }
        else if (chosenXAxis === "age") {
            var xlabel = "Median Age:";
        }
        else {
            var xlabel = "Median Income:";
        }
        if (chosenYAxis === "healthcare") {
            var ylabel = "Lack Healthcare:";
        }
        else if (chosenYAxis === "smokes") {
            var ylabel = "Smoke";
        }
        else {
            var ylabel = "Obese";
        }
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}%`);
            });

        textGroup.call(toolTip);

        textGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
            // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });
        return textGroup;
    }

    // Import Data
   var file = "data.csv"
    d3.csv(file).then(successHandle, errorHandle);

    function errorHandle(error){
        throw err;
    }

    function successHandle(testData) {

        // Step 1: Parse Data/Cast as numbers
        testData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // Step 2: Create scale functions
        var xLinearScale = xScale(testData, chosenXAxis);
        var yLinearScale = yScale(testData, chosenYAxis);

        // Step 3: Create axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Step 4: Append Axes to the chart
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

            // Step 5: Create Circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(testData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", "15")
            .attr("fill", "skyblue")
            .attr("opacity", ".75");

        var textGroup = chartGroup.selectAll(".label")
            .data(testData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(function(d) {return d.abbr;})
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis])+6)
            .attr("fill", "white")
            .attr("font-family","sans-serif");

        // Create group for 3 y-axis labels
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)")
            .attr("class", "axisText")
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle");

        var obesityLabel = ylabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "obesity")
            .classed("inactive", true)
            .attr("dy", "1em")
            .text("Obese (%)");

        var smokesLabel = ylabelsGroup.append("text")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "smokes")
            .classed("inactive", true)
            .attr("dy", "1em")
            .text("Smokes (%)");

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "healthcare")
            .classed("active", true)
            .attr("dy", "1em")
            .text("Lacks Healthcare (%)");

        // Create group for 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");

        // updateToolTip function above csv import
        var textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {

            // get value of selection
            var xvalue = d3.select(this).attr("value");
            if (xvalue !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = xvalue;

            // updates x scale for new data
            xLinearScale = xScale(testData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates text in circles with new x values
            textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);

            }
            else if (chosenXAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
            }
        });
        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function() {

            var yvalue = d3.select(this).attr("value");
            if (yvalue !== chosenYAxis) {

            chosenYAxis = yvalue;

            yLinearScale = yScale(testData, chosenYAxis);

            yAxis = renderYAxis(yLinearScale, yAxis);

            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            text = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

            if (chosenYAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else if (chosenYAxis === "smokes") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);            
            }
            else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
            }
        });
    }
}