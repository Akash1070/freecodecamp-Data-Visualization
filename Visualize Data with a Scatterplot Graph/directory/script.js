const render = dataset => {
    const xValue = d => d.Year; // Year
    const yValue = d => d.Time; // Time formatted as Date object
    const timeValue = d => d3.timeFormat("%M:%S")(d.Time); // Time strings used in the tooltips
    const nameValue = d => d.Name;
    const nationalityValue = d => d.Nationality;
    const dopingValue = d => d.Doping; // Details of doping allegations
  
    const width = 1260;
    const height = 600;
    const radius = 8;
  
    // Initiate the svg sizing for the visualization
    const margin = { top: 50, right: 60, bottom: 50, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xAxisPadding = 1;

    // Create and position axes text labels and the title
    const titleText = 'Doping in Professional Bicycle Racing';
    const titleXAxisPos = innerWidth / 2;
    const titleYAxisPos = -10;

    const subtitleText = "35 Fastest times up Alpe d'Huez";
    const subtitleYAxisPos = titleYAxisPos + 22;
  
    const yAxisLabelText = 'Time in Minutes';
    const yAxisLabelXPos = -50;
    const yAxisLabelYPos = -50;
  
    // Calculate and initiate relevant parameters
    const legendXAxisTextPos = innerWidth;
    const legendYAxisTextOnePos = innerHeight * 0.4;
    const legendYAxisTextTwoPos = legendYAxisTextOnePos + 30;
    const legendXAxisSquaresPos = innerWidth + 10;
    const legendYAxisSquareOnePos = innerHeight * 0.37;
    const legendYAxisSquareTwoPos = legendYAxisSquareOnePos + 30;
    const legendSquaresSize = 20;
    
    const dopingAllegationsText = 'Riders with doping allegations';
    const noDopingAllegationsText = 'No doping allegations';

    const dopingAllegationColor = '#e83407';
    const noDopingAllegationCol = '#07e83f';  
  
    // Initiate a svg canvas
    const svg = d3.select('body')
                  .append('svg')
                  .style('width', width)
                  .style('height', height);
    
    // Initiate a scatter plot
    const scatterplot = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Establish scale range
    const xScale = d3.scaleTime()
      .domain([d3.min(dataset, xValue) - xAxisPadding, d3.max(dataset, xValue) + xAxisPadding])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleTime()
      .domain([d3.min(dataset, yValue), d3.max(dataset, yValue)])
      .range([0, innerHeight]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d3.timeFormat('%Y')( new Date(0).setFullYear(d) ))
      .tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.timeFormat('%M:%S'))
      .tickSizeOuter(0);
    
    scatterplot.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);
    
    const yAxisG = scatterplot.append('g')
       .attr('id', 'y-axis')
       .call(yAxis);
  
    yAxisG.append('text')
      .attr('id', 'yAxis-label')
      .attr('x', yAxisLabelXPos)
      .attr('y', yAxisLabelYPos)
      .attr('transform', 'rotate(-90)')
      .text(yAxisLabelText);
    
    const titleSection = scatterplot.append('g')
      .attr('text-anchor', 'middle')
    
    titleSection.append('text')
      .attr('id', 'title')
      .attr('x',  titleXAxisPos)
      .attr('y', titleYAxisPos)
      .text(titleText);
    
    titleSection.append('text')
      .attr('id', 'subtitle')
      .attr('x', titleXAxisPos)
      .attr('y', subtitleYAxisPos)
      .text(subtitleText);
    
    const legendGrouping = scatterplot.append('g').attr('id', 'legend');
    
    legendGrouping.append('text')
      .attr('class', 'legend-text')
      .attr('x', legendXAxisTextPos)
      .attr('y', legendYAxisTextOnePos)
      .text(noDopingAllegationsText);
    
    legendGrouping.append('text')
      .attr('class', 'legend-text')
      .attr('x', legendXAxisTextPos)
      .attr('y', legendYAxisTextTwoPos)
      .text(dopingAllegationsText);
    
    legendGrouping.append('rect')
      .attr('x', legendXAxisSquaresPos)
      .attr('y', legendYAxisSquareOnePos)
      .attr('width', legendSquaresSize)
      .attr('height', legendSquaresSize)
      .attr('fill', noDopingAllegationCol);
    
    legendGrouping.append('rect')
      .attr('x', legendXAxisSquaresPos)
      .attr('y', legendYAxisSquareTwoPos)
      .attr('width', legendSquaresSize)
      .attr('height', legendSquaresSize)
      .attr('fill', dopingAllegationColor);
    
    let tooltip = d3.select('body').append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);
  
    // Append the dots to the scatterplot
    scatterplot.selectAll('circle').data(dataset)
       .enter().append('circle')
       .attr('cx', d => xScale(xValue(d)))
       .attr('cy', d => yScale(yValue(d)))
       .attr('r', d => radius)
       .attr('class', 'dot')
       .attr('data-xvalue', d => xValue(d))
       .attr('data-yvalue', d => yValue(d))
       .attr('fill', (d) => {
          if (dopingValue(d) == '') {
            return noDopingAllegationCol;
          } else {
            return dopingAllegationColor;
          }
       })
       .on('mouseover', d => {
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip.html(`${nameValue(d)}: ${nationalityValue(d)} 
                        </br>Year: ${xValue(d)}, Time: ${timeValue(d)}
                        </br></br>${dopingValue(d)}`)
            .style('left', d3.event.pageX + "px")
            .style('top', d3.event.pageY + "px")
            .attr('data-year', xValue(d))
       })
       .on('mouseout', d => {
          tooltip.transition().duration(500).style('opacity', 0);
       });
       
}; 

// Send an AJAX request to retrieve, parse through the dataset and then render it
document.addEventListener('DOMContentLoaded', function() {
  const request = new XMLHttpRequest();
  request.open('GET', 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true);
  request.send();
  request.onload = function () {
    let dataset = JSON.parse(request.responseText);
    
    dataset.forEach(d => {
      let parsedTime = d.Time.split(':');
      d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });
    
    render(dataset);
  };
});