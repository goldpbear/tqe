// TODO: add fixed dims option (to be derived from first two data points)
// TODO: yScale alignment still isn't quite right



var tqe = {
	params: {},
	config: function() {
		var p = this.params;
		p.counter = 0;
		p.XPADDING = 40;
		p.YPADDING = 30;
		p.width = document.getElementById("chart").offsetWidth;
		p.height = document.getElementById("chart").offsetHeight;
		p.data = [[-200, -220], [200, 200]];
		p.finalData = {};
	},
	scatterplot: function() {
		var context = this;
		var p = context.params;

		//p.data = this._randomData(2000);

		var xScale = d3.scale
			.linear()
			.domain([d3.min(d3.values(p.data), function(d) { return d[0] } ), d3.max(d3.values(p.data), function(d) { return d[0] } )])
			.range([p.XPADDING, p.width - p.XPADDING]);

		var yScale = d3.scale
			.linear()
			.domain([d3.min(d3.values(p.data), function(d) { return d[1] } ), d3.max(d3.values(p.data), function(d) { return d[1] } )])
			.range([p.height - p.YPADDING, p.YPADDING]); // <-- reversed

		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left");

		var svg = d3.select("#chart")
            .append("svg")
            .attr("id", "mainSvg")
            .attr("width", p.width)
            .attr("height", p.height)
            .on("click", function() {
            	var coords = d3.mouse(this);
            	var newPoint = [xCoordScale(d3.mouse(this)[0]), yCoordScale(d3.mouse(this)[1])];
            	p.data[p.counter] = newPoint;

            	// add a new point
            	svg.selectAll("circle")
            		.data(d3.values(p.data))
            		.enter()
            		.append("circle")
            		.attr("class", "addedScatterPoint")
					.attr("cx", function(d) {
					    return xScale(d[0]);
					})
					.attr("cy", function(d) {
					    return yScale(d[1]);
					})
					.attr("r", 4.5)
					.attr("id", p.counter)
					.on("mouseover", function() {
						d3.select(this)
						  .transition()
						  .attr("r", 9);
					})
					.on("mouseout", function() {
						d3.select(this)
						  .transition()
						  .attr("r", 4.5);
					})
					// remove this data point
					.on("click", function() {
						d3.event.stopPropagation();
						d3.select(this).remove();
						delete p.data[this.id];
						var oldVal = p._correlation;
						document.getElementById("output1").innerHTML = p._correlation = context._correlation(d3.values(p.data));
						document.getElementById("output2").innerHTML = context._difference(oldVal, p._correlation);
					});

				var oldVal = p._correlation;
				document.getElementById("output1").innerHTML = p._correlation = context._correlation(d3.values(p.data));
				document.getElementById("output2").innerHTML = context._difference(oldVal, p._correlation);

				p.counter++;
			});

        // these scales map mouse coordinates to the working coordinate system
		var xCoordScale = d3.scale
			.linear()
			.domain([p.XPADDING, context._svgDims()[0] - p.XPADDING])
			.range([d3.min(d3.values(p.data), function(d) { return d[0] } ), d3.max(d3.values(p.data), function(d) { return d[0] } )]);

		var yCoordScale = d3.scale
			.linear()
			.domain([context._svgDims()[1] - p.YPADDING, p.YPADDING])  // <-- reversed
			.range([d3.min(d3.values(p.data), function(d) { return d[1] } ), d3.max(d3.values(p.data), function(d) { return d[1] } )]);

		// display all initial data
        svg.selectAll("circle")
			.data(d3.values(p.data))
			.enter()
			.append("circle")
			.attr("class", "scatterPoint")
			.attr("cx", function(d) {
			    return xScale(d[0]);
			})
			.attr("cy", function(d) {
			    return yScale(d[1]);
			})
			.attr("r", 4.5)
			.attr("id", function(d) { 
				p.counter++;
				p.finalData[p.counter] = d;
				return p.counter; 
			})
			.on("mouseover", function() {
				d3.select(this)
				  .transition()
				  .attr("r", 9);
			})
			.on("mouseout", function() {
				d3.select(this)
				  .transition()
				  .attr("r", 4.5);
			})
			// remove this data point
			.on("click", function() {
				console.log(this.id);
				d3.event.stopPropagation();
				d3.select(this).remove();
				delete p.data[this.id];
				var oldVal = p._correlation;
				document.getElementById("output1").innerHTML = p._correlation = context._correlation(d3.values(p.data));
				document.getElementById("output2").innerHTML = context._difference(oldVal, p._correlation);
			});

		// calculate and display initial correlation
		document.getElementById("output1").innerHTML = p._correlation = context._correlation(d3.values(p.data));

		svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (p.height - p.YPADDING) + ")")
    		.call(xAxis);

    	svg.append("g")
    		.attr("class", "axis")
			.attr("transform", "translate(" + p.XPADDING + ",0)")    		
			.call(yAxis);

		document.getElementById("output1").innerHTML = context._correlation(context.params.data);
	},

	_randomData: function(num) {
		var data = [];
		var gaussian = function() {
			// Box-Muller formula
			return Math.sin(2 * Math.PI * Math.random()) * Math.pow(-2*Math.log(Math.random()), .5);
		}

		for (var i = 0; i < num; i++) {
			var temp = [];
			temp.push(gaussian());
			temp.push(gaussian());
			data.push(temp);
		}

		return data;
	},

	_correlation: function(data) {
		var x_bar = this._mean(data, 0);
		var y_bar = this._mean(data, 1);

		// Pearson product-moment correlation
		var a = b = c = 0;
		// TODO: skipping first two els is problematic now
		for (var i = 2; i < data.length; i++) {  //<-- skip the first two data elements, assumed to be elements that set the chart boundaries
			a += (data[i][0] - x_bar) * (data[i][1] - y_bar);
			b += Math.pow(data[i][0] - x_bar, 2);
			c += Math.pow(data[i][1] - y_bar, 2);
		}

		return a / Math.sqrt(b) / Math.sqrt(c);

	},

	// data is a two-dimensional array; index is the value in each subarray to include in the mean
	_mean: function(data, index) {
		var d = 0;
		for (var i = 2; i < data.length; i++) {  //<-- skip the first two data elements, assumed to be elements that set the chart boundaries
			d += data[i][index];
		}
		
		return d / data.length;	
	},

	// returns the pixel dimensions, by default, of an element with id mainSvg
	_svgDims: function(elId) {
		if (!elId) var elId = "mainSvg";
		var rect = document.getElementById(elId).getBoundingClientRect();

		return [rect.width, rect.height];
	},

	_percentChange: function(oldVal, newVal) {
		return (newVal - oldVal) / oldVal * 100;
	},

	_difference: function(oldVal, newVal) {
		return newVal - oldVal;
	},


	// draws a vertical bar of height val, scaled to the height of elId
	_verticalChangeBar: function(elId, val) {


	}




}