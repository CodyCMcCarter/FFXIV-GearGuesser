import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://xivapi.com";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//Setting globals
var gearInfo;
var gearImage;
var guesses = [];
var statNames = [];
var statValues = [];
var result;
var close = [];

app.get("/", async (req, res) => {
    //Sends globals to page and renders the ejs
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
    //Select an appropriate gear ID
    let gearId = Math.floor((Math.random()*100)+34830);
    //Send request
    let response = await axios.get(API_URL + "/item/"+gearId);
    gearInfo = response.data;
    //Pull stats out and make the data useable for the ejs
    let stats = gearInfo.Stats;
    statNames = Object.keys(stats);
    for(var i = 0; i < statNames.length; i++){
        statValues.push(stats[statNames[i]].NQ);
    }
    //Get gear icon and make usable
    let imageResponse = await axios.get(API_URL + gearInfo.IconHD, { responseType: "arraybuffer" });
    let buffer = Buffer.from(imageResponse.data, 'binary').toString("base64");
    gearImage = `data:${imageResponse.headers["content-type"]};base64,${buffer}`;
    //Reload the page with the new data
    res.redirect("/");
});

app.post("/checkGuess", (req, res) => {
    //Get the user guess and split it and the answer into arrays
    guesses.push(req.body.guess);
    let guessArray = req.body.guess.split(" ");
    let answerArray = gearInfo.Name.split(" ");
    //Check if the guess is correct
    if (req.body.guess.toLowerCase() === gearInfo.Name.toLowerCase()) {
        result = "Duty Complete!";
    //Check if the user has exceeded guess threshold
    } else if (guesses.length >= 5) {
        result = "Duty Failed..."
    //Check through the arrays for any correct words and add a hint to the close array
    } else {
        close = [];
        for(let i = 0; i < guessArray.length; i++){
            for(let y = 0; y < answerArray.length; y++){
                if(guessArray[i].toLowerCase() === answerArray[y].toLowerCase()){
                    if(i === y) {
                        close.push(guessArray[i] + " is correct!")
                    } else {
                        close.push(guessArray[i] + " is correct, but out of place.")
                    }
                }
            }
        }
    }
    //Reload the page with new data
    res.redirect("/");
});

app.post("/endGame", (req, res) => {
    //Reset all globals and start a new game
    gearInfo = null;
    gearImage = null;
    guesses = [];
    statNames = [];
    statValues = [];
    close = []
    result = null;
    res.redirect("/startGame");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});