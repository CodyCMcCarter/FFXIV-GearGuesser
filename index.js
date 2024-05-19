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
var guesses = [];
var statNames = [];
var statValues = [];
var result;
var close = [];

app.get("/", async (req, res) => {
    res.render("index.ejs", { 
        gearInfo: gearInfo, 
        gearImage: gearImage, 
        guesses: guesses, 
        statNames: statNames, 
        statValues: statValues, 
        result: result, 
        close: close
    });
});

app.get("/startGame", async (req, res) => {
    let gearId = Math.floor((Math.random()*100)+34830);
    let response = await axios.get(API_URL + "/item/"+gearId);
    gearInfo = response.data;
    let stats = gearInfo.Stats;
    statNames = Object.keys(stats);
    for(var i = 0; i < statNames.length; i++){
        statValues.push(stats[statNames[i]].NQ);
    }
    let imageResponse = await axios.get(API_URL + gearInfo.IconHD, { responseType: "arraybuffer" });
    let buffer = Buffer.from(imageResponse.data, 'binary').toString("base64");
    gearImage = `data:${imageResponse.headers["content-type"]};base64,${buffer}`;
    res.redirect("/");
});

app.post("/checkGuess", (req, res) => {
    guesses.push(req.body.guess);
    let guessArray = req.body.guess.split(" ");
    let answerArray = gearInfo.Name.split(" ");
    if (req.body.guess.toLowerCase() === gearInfo.Name.toLowerCase()) {
        result = "Duty Complete!";
    } else if (guesses.length >= 5) {
        result = "Duty Failed..."
    } else {
        close = [];
        let yth = "";
        for(let i = 0; i < guessArray.length; i++){
            for(let y = 0; y < answerArray.length; y++){
                if(guessArray[i].toLowerCase() === answerArray[y].toLowerCase()){
                    if(y === 0) {
                        yth = y+1 + "st";
                    } else if(y === 1) {
                        yth = y+1 + "nd";
                    } else if(y === 2) {
                        yth = y+1 + "rd";
                    } else {
                        yth = y+1 + "th";
                    }
                    close.push(guessArray[i] + " matches the " + yth + " word")
                }
            }
        }
    }
    res.redirect("/");
});

app.post("/endGame", (req, res) => {
    gearInfo = null;
    gearImage = null;
    guesses = [];
    statNames = [];
    statValues = [];
    result = null;
    res.redirect("/startGame");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});