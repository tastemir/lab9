const width = 500;
const height = 500;
const numPoints = 100;
const margin = { top: 20, right: 20, bottom: 50, left: 50 };

const randomPoints = Array.from({ length: numPoints }, () => ({
  x: Math.random() * (width - margin.left - margin.right),
  y: Math.random() * (height - margin.top - margin.bottom)
}));

const xScale = d3.scaleLinear().domain([0, width]).range([0, width - margin.left - margin.right]);
const yScale = d3.scaleLinear().domain([0, height]).range([height - margin.top - margin.bottom, 0]);

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

svg.selectAll("circle")
  .data(randomPoints)
  .join("circle")
  .attr("cx", d => xScale(d.x))
  .attr("cy", d => yScale(d.y))
  .attr("r", 3)
  .attr("fill", "blue");

svg.append("g")
  .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
  .call(xAxis);

svg.append("g")
  .call(yAxis);

d3.csv("titanic.csv", d => ({
  PassengerId: +d.PassengerId,
  Survived: +d.Survived,
  Pclass: +d.Pclass,
  Name: d.Name,
  Sex: d.Sex,
  Age: +d.Age,
  SibSp: +d.SibSp,
  Parch: +d.Parch,
  Ticket: d.Ticket,
  Fare: +d.Fare,
  Cabin: d.Cabin,
  Embarked: d.Embarked
}))
.then(data => {
  const filteredData = data.filter(d => !isNaN(d.Age));
  const ageBins = d3.bin().thresholds([0, 10, 20, 30, 40, 50, 60, 70, 80])(filteredData.map(d => d.Age));
  const ageDistribution = ageBins.map(bin => bin.length);

  const pie = d3.pie()(ageDistribution);
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height) / 2);

  const pieSvg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal().domain(ageDistribution).range(d3.schemeCategory10);

  pieSvg.selectAll("path")
    .data(pie)
    .join("path")
    .attr("d", arc)
    .attr("fill", d => color(d.value));

  const labelArc = d3.arc()
    .innerRadius(Math.min(width, height) / 2 - 50)
    .outerRadius(Math.min(width, height) / 2 - 10);

  pieSvg.selectAll("text")
    .data(pie)
    .join("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text((d, i) => `Age ${ageBins[i].x0}-${ageBins[i].x1}`);
})
.catch(error => {
  console.error("Error loading dataset:", error);
});
