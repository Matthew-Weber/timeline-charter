
Reuters.Graphics.topdonut = new Reuters.Graphics.donut({
	el: "#reutersGraphic-chart1",
	dataURL:"data/donutdata.csv",
	height:600,
	colorRange:["#fff100","#fdf6b3",gray2,cyan2,cyan5],
	colorDomain:["Far Left","Left","other","Right","Far Right"], // array of values (or will auto pull based on color value
	plotValue:"seats",
	colorValue:"left-right-text",
	multiArcs:"year",
	multiSort:["2014","2009","2004"],
	//upsideDown:true,
	//wholePie:true,
	//startAngle:90,
	//endAngle:90,
	donutHoleSize:4,
	//tooltipTemplate:Reuters.Graphics.Template.pietooltip,	
});
