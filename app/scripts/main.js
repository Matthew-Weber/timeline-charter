
//all of the basic options for a chart will work here
//MAKE THE ORIGINAL CONTAINER THAT YOU PASS IN HERE 12-COL on ALL SIZES
//you can size the chart and teh content inside of it in the timelinecharttemplate.html template
Reuters.Graphics.sharePrice = new Reuters.Graphics.timeLineCharter({
	el: "#reutersGraphic-chart1",
	//data for the chart
	dataURL: "//fingfx.thomsonreuters.com/gfx/rngs/STOCKS-USA-TRUMP/010051M13MH/sp500tweets.json",
	//data for the timeline, needs a date column, date format must match data date format
	timelineData:'//d3sl9l9bcxfb5q.cloudfront.net/json/as-stocks-usa-trump',
	//what column in the data do you want the blurbs to come from
	blurbColumn:"tweet",
	dataStream:true,
	height:220
});


//note the triggers are different, a little
Reuters.Graphics.sharePrice.on("renderChart:start", function(evt){
    var self = this.timeline_chart_obj;
    
})		
Reuters.Graphics.sharePrice.on("renderChart:end", function(evt){
    var self = this.timeline_chart_obj;
    
})		
Reuters.Graphics.sharePrice.on("update:start", function(evt){
    var self = this.timeline_chart_obj;
    
    
})		
Reuters.Graphics.sharePrice.on("update:end", function(evt){
    var self = this.timeline_chart_obj;
    
})		
Reuters.Graphics.sharePrice.on("baseRender:start", function(evt){
    var self = this.timeline_chart_obj;
    
})		
Reuters.Graphics.sharePrice.on("baseRender:end", function(evt){
    var self = this.timeline_chart_obj;
    
})		
Reuters.Graphics.sharePrice.on("baseUpdate:start", function(evt){
    var self = this.timeline_chart_obj;
    
})		
Reuters.Graphics.sharePrice.on("baseUpdate:end", function(evt){
    var self = this.timeline_chart_obj;
    
})		



