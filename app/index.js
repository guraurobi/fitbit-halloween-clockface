import { display } from "display";
import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import * as fs from "fs";
const sensors = [];
var mySettings = {};

let clockType = "versa";
let clockImage = 1;

import * as paymee from "./paymee";
paymee.startPayment();

clock.granularity = "seconds";

const holder = document.getElementById("watchface-holder");
const background = document.getElementById("watchface-background");

const hourLabel = document.getElementById("watchface-hour");
const stepsLabel = document.getElementById("watchface-steps");
const caloriesLabel = document.getElementById("watchface-calories");
const heartrateLabel = document.getElementById("watchface-heartrate");

if (holder.width == 348) clockType = "ionic";

try {
    var mySettings  = fs.readFileSync("json.txt", "json");
} 
catch(e) { console.log("Exception: "+e); }

if (mySettings)
  if (mySettings.index) clockImage = mySettings.index;
background.href="img/"+clockType+clockImage+".png";

holder.onclick = () =>{
  if (clockImage < 3) clockImage++;
  else clockImage = 1;
  
  background.href="img/"+clockType+clockImage+".png";
  
  let mySettings  = fs.readFileSync("json.txt", "json");
  mySettings["index"] = clockImage;
  fs.writeFileSync("json.txt", mySettings, "json");
}

clock.ontick = (evt) => {
  let dateNow = evt.date;
  let hours = dateNow.getHours();
  if (preferences.clockDisplay === "12h") hours = hours % 12 || 12;
  else hours = util.zeroPad(hours);
  let mins = util.zeroPad(dateNow.getMinutes());
  let secs = util.zeroPad(dateNow.getSeconds());
  
  hourLabel.text = `${hours}:${mins}`;
  stepsLabel.text = today.local.steps+" STEPS";
  caloriesLabel.text = today.local.calories+" KCAL";
}
if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    heartrateLabel.text = (hrm.heartRate ? hrm.heartRate : 0);
  });
  sensors.push(hrm);
  hrm.start();
}
display.addEventListener("change", () => {
  display.on ? sensors.map(sensor => sensor.start()) : sensors.map(sensor => sensor.stop());
});
