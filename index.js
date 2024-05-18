import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://xivapi.com";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

var gearInfo;
var gearImage;

app.get("/", async (req, res) => {
    res.render("index.ejs", { gearInfo: gearInfo, gearImage: gearImage });
});

app.get("/startGame", async (req, res) => {
    let gearId = Math.floor((Math.random()*1000)+2937);
    let response = await axios.get(API_URL + "/item/"+gearId);
    gearInfo = response.data;
    let imageResponse = await axios.get(API_URL + gearInfo.IconHD, { responseType: "arraybuffer" });
    let buffer = Buffer.from(imageResponse.data, 'binary').toString("base64");
    gearImage = `data:${imageResponse.headers["content-type"]};base64,${buffer}`;
    res.redirect("/");
});

app.get("/checkGuess", (req, res) => {
    
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});