Reuters = Reuters || {};
Reuters.Graphics = Reuters.Graphics || {};
//the view that constructs a linechart
Reuters.Graphics.timeLineCharter = Backbone.View.extend({
	template:Reuters.Graphics.timelineCharter.Template.timelinecharttemplate,
	dateFormat: d3.time.format("%b %Y"),
	blurbColumn:"blurb",		
	initialize: function(opts){
		var self = this;
		this.options = opts; 		
		self.chartOptions = {}
		// if we are passing in options, use them instead of the defualts.
		_.each(opts, function(item, key){
			self[key]=item;
			if(key == "timelineData"){
				return;
			}
			self.chartOptions[key] = item;
		});	
			self.loadData()

	},

	loadData:function(){
		var self = this;
		//Test which way data is presented and load appropriate way
		if (self.timelineData.indexOf("csv") == -1 && !_.isObject(self.timelineData)){
			d3.json(self.timelineData, function(data){
				self.parseData (data);
			});
		} 
		if (self.timelineData.indexOf("csv") > -1){
			d3.csv(self.timelineData, function(data){
				self.parseData (data);
			});
		}
		if (_.isObject(this.timelineData)){
			setTimeout(function(){
				self.parseData (self.timelineData);											
			}, 100);
		}				
	},
	
	parseData: function (data){			
		var self = this;		
		data = JSON.parse(JSON.stringify(data));
		self.data = data;
		if (data[0].date && !self.parseDate ){
			if (data[0].date.split('/')[2].length == 2){						
				 self.parseDate = d3.time.format("%m/%d/%y").parse;
			}
			if (data[0].date.split('/')[2].length == 4){						
				 self.parseDate = d3.time.format("%m/%d/%Y").parse;
			}			
		}
		self.timelineDates = []
		
		self.data.forEach(function(d){
			if (d.date){
				d.jsDate = self.parseDate(d.date);
				d.displayDate = self.dateFormat(d.jsDate);
			}
			self.timelineDates.push(d.date);
		})
		self.data.sort(function(a,b){
			if (a.jsDate > b.jsDate){return 1}
			if (a.jsDate < b.jsDate){return -1}
			return 0
		})					
		self.baseRender()


	},
	scrollAnimate:function(){
		var self = this;
		var scrollTop = $(window).scrollTop();
		var offset = $(".chart-top-scroll-point").offset().top;
		var windowHeight = $(window).height();
		var chartHeight = $(".anchored-content").height();
		var bannerHeight = 70;
		var bottomOffset = $(".end-scroll-point").offset().top;
		var adjustedScrollTop = scrollTop+bannerHeight+chartHeight+100
		if (!self.previousIndex){self.previousIndex = 1}
		self.lineChart.selectAll("path.line")
			.attr("d", function(d) {return self.line(d.values); })
		
		
		if(scrollTop+bannerHeight > offset){
			$(".anchored-content").addClass("timeline-stick")
			$(".possible-container").addClass("container")
			$(".timeline-holder").css({"padding-top":$(".anchored-content").height()+"px"})
		
			self.lineChart.selectAll("path.line")
				.style("stroke",  gray2)			
				.style("opacity",  0.4);			
			

		}else{
			$(".anchored-content").removeClass("timeline-stick")
			$(".possible-container").removeClass("container")
			$(".timeline-holder").css({"padding-top":"0px"})
			self.lineChart.selectAll("path.line")
				.style("stroke", function(d) { return self.colorScale(d.name); })			
				.style("opacity",  1);			

			self.lineChart.selectAll(".tipCircle")
				.classed("highlight", function(d){
					if (self.closestDates.indexOf(self.timelineFormatter(d.date)) > -1 ){
						return true
					}
					return false
				});
			
			$(".timeline-item").removeClass("active")
					
			
		}
		if(scrollTop+bannerHeight+chartHeight > bottomOffset){
			$(".anchored-content").addClass("unstick")
			$(".possible-container").removeClass("container")
			
		}else{
			$(".anchored-content").removeClass("unstick")
		}
		
		$(".timeline-item").each(function(){
			var itemOffset = $(this).offset().top;
			var itemHeight = $(this).outerHeight( true );
			var pastPoint = itemOffset +itemHeight

			if ( adjustedScrollTop > itemOffset && adjustedScrollTop < pastPoint){

				var date = $(this).attr("data-id");
				//if (date == self.activeTimelineDate){return}

				self.activeTimelineDate = date;
				$(".timeline-item").removeClass("active")
				$(this).addClass("active")


				var parsedDate = self.parseDate(date);	
				var index = 0;	
				var closestData = null;				
				
				self.chartData.first().get("values").each(function(d,i){
					if (closestData === null || Math.abs(d.get("date") - parsedDate) < Math.abs(closestData - parsedDate)){
						closestData = d.get("date");
						index = i;
					}
				});
				
				var currentData = JSON.parse(JSON.stringify(self.jsonData));
				currentData.forEach(function(d){
					d.values.length = index;
				})
				
				self.AnimateLineChart = self.svg.selectAll(".animateLineChart")
					.data(currentData, function(d) {return d.name; })
										
			self.lineChart.selectAll(".tipCircle")
				.classed("highlight", function(d,i){
					if (i==index+1){
						return true;		
					}
					return false;
				});				
		
				self.AnimateLineChart.selectAll("path.animateLine")
					.transition()
					.duration(1500)
					.delay(function(d, i) { return i * 100; })
					.attrTween('d',function (d){
						var interpolate = d3.scale.quantile()
							.domain([0,1])
							.range(d3.range(self.previousIndex, index + 1));
						return function(t){
/*
							var upperValue = interpolate(t)
							if( upperValue > index){upperValue = index}
							return self.line(d.values.slice(0, upperValue));
*/
							return self.line(d.values.slice(0, interpolate(t)));

						};
					});
					
				self.previousIndex = index;				
				

			}
			
		})	
			
		
		
	},	

	baseRender: function() {
		var self = this;
		self.targetDiv = self.$el.attr("id");
		self.chartDiv = self.targetDiv + "chart"		
		self.$el.html(self.template({self:self, data:self.data}))
		self.chartOptions.el = "#"+self.chartDiv
		self.chartOptions.scrollAnimate = self.scrollAnimate
		
		self.timeline_chart_obj = new Reuters.Graphics.LineChart(self.chartOptions);				

		self.timeline_chart_obj.on("renderChart:start", function(evt){
		    self.trigger("renderChart:start")
		    
		})		
		self.timeline_chart_obj.on("renderChart:end", function(evt){
			var chartSelf = this;
			
			chartSelf.AnimateLineChart = chartSelf.svg.selectAll(".animateLineChart")
				.data(chartSelf.jsonData, function(d) {return d.name; })
				.enter().append("g")
				.attr({
					"clip-path":"url(#clip" + chartSelf.targetDiv + ")",
					class: "animateLineChart",
					id:function(d){return chartSelf.targetDiv + d.displayName.replace(/\s/g, '') + "-line"; }
				})
	
			chartSelf.AnimateLineChart.append("path")
				.attr("class", "animateLine")
				.style("stroke", function(d) { return chartSelf.colorScale(d.name); })
				.attr("d", function(d) {return chartSelf.line(d.values[0]); })
		    
			chartSelf.closestDates = []
			chartSelf.timelineFormatter = d3.time.format("%m/%d/%Y %H:%M:%S");
			
			self.timelineDates.map(function(timelineDate){
				var parsedDate = chartSelf.parseDate(timelineDate)

				var closestData = null;								
				chartSelf.chartData.first().get("values").each(function(d,i){
					if (closestData === null || Math.abs(d.get("date") - parsedDate) < Math.abs(closestData - parsedDate)){
						closestData = d.get("date");
					}
				})
				chartSelf.closestDates.push( chartSelf.timelineFormatter(closestData));								
			})
			
			chartSelf.lineChart.selectAll(".tipCircle")
				.classed("highlight", function(d){
					if (chartSelf.closestDates.indexOf(chartSelf.timelineFormatter(d.date)) > -1 ){
						return true
					}
					return false
				});

		    self.trigger("renderChart:end")
		    
		})		
		self.timeline_chart_obj.on("update:start", function(evt){
		    self.trigger("update:start")
		    
		})		
		self.timeline_chart_obj.on("update:end", function(evt){
			var chartSelf = this;

			chartSelf.AnimateLineChart.selectAll("path.animateLine")
				.transition()
				.duration(1000)
				.attr("d", function(d) {return chartSelf.line(d.values[0]); })
			
		    self.trigger("update:end")
		    
		})		
		self.timeline_chart_obj.on("baseRender:start", function(evt){
		    self.trigger("baseRender:start")
		    
		})		
		self.timeline_chart_obj.on("baseRender:end", function(evt){
		    self.trigger("baseRender:end")
		    
		})		
		self.timeline_chart_obj.on("baseUpdate:start", function(evt){
		    self.trigger("baseUpdate:start")
		    
		})		
		self.timeline_chart_obj.on("baseUpdate:end", function(evt){
		    self.trigger("baseUpdate:end")
		    
		})								
	},
	
//end of view
});



