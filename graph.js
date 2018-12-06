const margin = { top: 40, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', graphWidth + margin.left + margin.right)
    .attr('height', graphWidth + margin.top + margin.bottom);

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

// Scales 
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0])

// Axes groups 
const xAxisGroup = graph.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g')
    .attr('class', 'y-axis');

// D3 line path generator
const line = d3.line()
    .x(function(d) { return x(new Date(d.date))})
    .y(function(d) { return y(d.distance)});

// Line path element
const path = graph.append('path');

const update = data => {

    data = data.filter(item => item.activity == activity);

    // Sort data based on date objects
    data.sort( (a, b) => new Date(a.date) - new Date(b.date));    

    // Set scale domains
    x.domain(d3.extent(data, d => new Date(d.date)))
    y.domain([0, d3.max(data, d => d.distance)])

    // Update path data
    path.data([data])
        .attr('fill', 'none')
        .attr('stroke', '#00bfa5')
        .attr('stroke-width', 2)
        .attr('d', line)

    // Create circles for objects
    const circles = graph.selectAll('circle')
        .data(data)

    // Remove unwanted point
    circles.exit().remove();

    // Update current points
    circles
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.distance))

    // Add new points
    circles.enter()
        .append('circle')
            .attr('r', 4)
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.distance))
            .attr('fill', '#ccc')

    // Create axes
    const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickFormat(d3.timeFormat('%b %d'));

    const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d + 'm');

    // Call axes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // Rotate axis text
    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end')
}

// Data and firestore
var data = [];

db.collection('activities').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), ud: change.doc.id };


        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }
    });

update(data)
})