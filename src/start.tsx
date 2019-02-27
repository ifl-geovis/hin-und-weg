import * as React from "react";
import * as ReactDOM from "react-dom";
import CombinerView from "./view/combiner/CombinerView";

ReactDOM.render(<CombinerView/>, document.getElementById("root"));

// TODO: 18.02.2019 - 22.02.2019
// [✓] Link geodata attributes for ALL matrices
// [✓] Add offset selectors for row and column
// [✓]] Use OLAP and Geodata as main data structure
// [ ] Model aggregation of *ranges: Sum //
// [ ] Model difference of *ranges: diff of year values (time)
// [ ] Model Index attributes: Example -> Move persons to all persons
// [ ] Model grouping for theme, time and spatial ranges
