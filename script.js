const form=document.querySelector("#new-world-form");
const nameInput=document.querySelector("#player-name");
const result=document.querySelector("#world-result");
const cards=[...document.querySelectorAll(".difficulty-card")];
const worlds=[
{name:"The Drowned Shore",place:"a remote island",description:"Waves carry broken crates and pieces of a life you can't remember onto the beach. Beyond the palms, something is moving."},
{name:"The Quiet District",place:"an abandoned city",description:"Empty streets stretch between dark buildings. There are supplies to salvage here, but the sounds echoing between the towers aren't human."},
{name:"The Pine Barrens",place:"a wooded wilderness",description:"A lonely stretch of road cuts through dense woodland. Scattered camps and abandoned vehicles may hold what you need to make it through the night."},
{name:"Blackwater Research Site",place:"a remote research facility",description:"You wake near a sealed laboratory on the edge of a forgotten settlement. Its records may explain how the world fell apart."},
{name:"The Broken Coast",place:"a coastal settlement",description:"A storm-battered fishing town offers shelter, if you can clear it. The harbor is full of wreckage, rusted tools, and unanswered questions."}
];
function updateCards(){cards.forEach(card=>card.classList.toggle("selected",card.querySelector("input").checked));}
cards.forEach(card=>card.addEventListener("click",()=>{card.querySelector("input").checked=true;updateCards();}));
function generateWorld(){
const playerName=nameInput.value.trim();if(!playerName){nameInput.focus();return;}
const difficulty=document.querySelector('input[name="difficulty"]:checked').value;
const world=worlds[Math.floor(Math.random()*worlds.length)];const seed=Math.floor(100000+Math.random()*900000);
document.querySelector("#world-title").textContent=world.name;
document.querySelector("#world-description").textContent="You are "+playerName+", stranded in "+world.place+". "+world.description;
document.querySelector("#world-seed").textContent="SEED #"+seed;
document.querySelector("#result-player").textContent="SURVIVOR: "+playerName;
document.querySelector("#result-difficulty").textContent="DIFFICULTY: "+difficulty.toUpperCase();
result.hidden=false;result.scrollIntoView({behavior:"smooth",block:"nearest"});
}
form.addEventListener("submit",event=>{event.preventDefault();generateWorld();});
document.querySelector("#regenerate-button").addEventListener("click",generateWorld);