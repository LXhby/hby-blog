const {db} = require("../Schema/config");

const ArticalSchema = require("../Schema/artical");
const Artical = db.model("articals",ArticalSchema);

module.exports = Artical;