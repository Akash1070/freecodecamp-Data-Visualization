// createEducationGroupsArr is a helper function used to create groups based on education level
const createEducationGroupsArr = (minEducationLevel, maxEducationLevel, numOfSections, section) => {
  const groupsArr = [minEducationLevel];
  let temp = minEducationLevel;
  for (let i=0; i < numOfSections - 1; i++) {
    temp += section;
    groupsArr.push(Math.round(temp));
  };
  return groupsArr;
};

// mapColoring maps a specified color to the relevant group
const mapColoring = (countyEdLvl, colorPalette, groupsArr) => {
  if (countyEdLvl > groupsArr[0] && countyEdLvl <= groupsArr[1]) {
    return colorPalette[1];
  } else if (countyEdLvl > groupsArr[1] && countyEdLvl <= groupsArr[2]) {
    return colorPalette[2];
  } else if (countyEdLvl > groupsArr[2] && countyEdLvl <= groupsArr[3]) {
    return colorPalette[3];    
  } else if (countyEdLvl > groupsArr[3] && countyEdLvl <= groupsArr[4]) {
    return colorPalette[4];      
  } else if (countyEdLvl > groupsArr[4] && countyEdLvl <= groupsArr[5]) {
    return colorPalette[5];      
  } else if (countyEdLvl > groupsArr[5] && countyEdLvl <= groupsArr[6]) {
    return colorPalette[6];       
  } else if (countyEdLvl > groupsArr[6] && countyEdLvl <= groupsArr[7]) {
    return colorPalette[7]; 
  } else {
    return colorPalette[0]; 
  };
};

Promise.all([
  d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'),
  d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
]).then(([educationDataJSON, countyDataJSON]) => {
  
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;
  
  // define space for the Choropleth map
  const margin = { top: 80, right: 300, bottom: 0, left: 300 };
  const innerWidth = width - margin.right - margin.left;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Set up the projection for the US map
  const projection = d3.geoAlbersUsa();
  const counties = topojson.feature(countyDataJSON, countyDataJSON.objects.counties);
  
  // Assign an id based on related fibs to each object with educational data
  const objById = educationDataJSON.reduce((accumulator, d) => {
    accumulator[d.fips] = d;
    return accumulator;
  }, {});
  
  // Re-assign education properties to the array with counties data
  counties.features.forEach(d => {
    Object.assign(d.properties, objById[d.id]);
  });
  
  // Define constants for the map and legend
  const countyFip = d => d.properties.fips;
  const countyName = d => d.properties.area_name;
  const countyState = d => d.properties.state;
  const countyEducation = d => d.properties.bachelorsOrHigher;
  
  const numOfSections = 8;
  const minEducationLevel = d3.min(counties.features, countyEducation);
  const maxEducationLevel = d3.max(counties.features, countyEducation);
  const section = Math.round((maxEducationLevel - minEducationLevel) / numOfSections);
  const groupsArr = createEducationGroupsArr(minEducationLevel, maxEducationLevel, numOfSections, section);
  const legendWidth = 300;
  const legendBarWidth = legendWidth / numOfSections;
  
  // Define the color scheme
  const colorPalette = d3.schemeGreens[numOfSections];
  
  // Create and position axes text labels and the title
  const titleText = 'United States Educational Attainment';
  const titleXAxisPos = innerWidth / 2;
  const titleYAxisPos = -30;
  
  const subtitleText = 'Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)';
  const subtitleYAxisPos = titleYAxisPos + 22;
  
  // create an svg
  const svg = d3.select('svg')
    .style('width', width)
    .style('height', height);
  
  // define and append map to the svg
  const map = svg.append('g')
    .attr('id', 'map')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
  
  // append the title section
  const titleSection = map.append('g')
    .attr('text-anchor', 'middle');
  
  titleSection.append('text')
    .attr('id', 'title')
    .attr('x', titleXAxisPos)
    .attr('y', titleYAxisPos)
    .text(titleText);
  
  titleSection.append('text')
    .attr('id', 'description')
    .attr('x', titleXAxisPos)
    .attr('y', subtitleYAxisPos)
    .text(subtitleText);
  
  // Default settings for the tooltips
  let tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);
  
  // Append counties' info to the map
  map.selectAll('path').data(counties.features)
    .enter().append('path')
      .attr('class', 'county')
      .attr('d', d3.geoPath())
      .attr('data-fips', d => countyFip(d))
      .attr('data-education', d => countyEducation(d))
      .attr('fill', d => mapColoring(countyEducation(d), colorPalette, groupsArr))
      .on('mouseover', d => {
        tooltip.transition().duration(200).style('opacity', 0.8);
        tooltip.html(`${countyName(d)}, ${countyState(d)}: ${countyEducation(d)}%`)
          .style('left', d3.event.pageX - 20 + 'px')
          .style('top', d3.event.pageY - 40 + 'px')
          .attr('data-education', countyEducation(d));
      })
      .on('mouseout', d => {
        tooltip.transition().duration(500).style('opacity', 0);
      });
  
   // Add the legend to the visualization
   const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${margin.left + 550}, ${margin.top - 580})`);
  
   const tempScale = d3.scaleLinear()
      .domain([minEducationLevel, maxEducationLevel])
      .range([0, legendWidth]);
  
   const legendXAxis = d3.axisBottom(tempScale)
        .tickValues(groupsArr)
        .tickFormat(d => Math.round(d) + "%")
        .tickSizeOuter(0);
  
   legend.append('g')
       .attr('id', 'legend-x-axis')
       .attr('transform', `translate(0, ${innerHeight + 10})`)
       .call(legendXAxis);
  
   legend.selectAll('rect').data(groupsArr)
       .enter().append('rect')
       .attr('class', 'legend-rect')
       .attr('x', (d, i) => i * legendBarWidth)
       .attr('transform', `translate(0, ${innerHeight - 10})`)
       .attr('width', legendBarWidth)
       .attr('height', 20)
       .attr('fill', d => mapColoring(d, colorPalette, groupsArr)); //fill with palette accordingly
}, {});