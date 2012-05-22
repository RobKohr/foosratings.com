$(function () {
    $.plot($("#graph"), 
	   plot_data,
	   { 
	       series: {
                   lines: { show: true },
                   points: { show: true }
               },
	       legend:{position:'sw'}, 
	       xaxis: 
	       { 
		   mode: "time", 
		   timeformat: "%y/%m/%d", 
		   minTickSize: [1, 'day']
	       } 
	   }
	  );
});