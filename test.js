var fs = require("fs");
token = parseInt(fs.readFileSync("token.txt", "utf-8"));
console.log("Token is ",token);
token = 0
console.log("type now is",typeof token)
fs.writeFileSync("token.txt", token.toString());
token = fs.readFileSync("token.txt", "utf-8");
console.log("Token is ",token);