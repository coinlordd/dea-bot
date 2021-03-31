const Bottleneck = require("bottleneck");
exports.Queue = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1100
})
