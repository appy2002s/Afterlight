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
document.querySelector("#enter-game-button").addEventListener("click",()=>{
 document.querySelector("#game-panel").hidden=false;document.querySelector("#game-panel").scrollIntoView({behavior:"smooth",block:"start"});startGame();
});

/* First tiny, continuous test map. Coordinates are world coordinates. */
const canvas=document.querySelector("#game-canvas"),ctx=canvas.getContext("2d");
const hint=document.querySelector("#canvas-hint"),knob=document.querySelector("#stick-knob"),pad=document.querySelector("#touch-pad");
const player={x:355,y:270,speed:2.5,face:1};let target=null,keys={},stick={x:0,y:0},pointerDown=false,gameStarted=false,doorOpen=false,dayMinutes=480,lastTick=0;
const door={x:500,y:330};
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function text(t,x,y,c="#f1efd9",size=12){ctx.fillStyle=c;ctx.font="bold "+size+"px monospace";ctx.fillText(t,x,y);}
function drawScene(){
 ctx.clearRect(0,0,900,620);
 // Ground and subtle pixel-grass pattern.
 rect(0,0,900,620,"#527b48");
 for(let y=8;y<620;y+=24)for(let x=8;x<900;x+=29){if((x*7+y*3)%5!==0)rect(x,y,3,3,"#628b50");}
 // Road across the lower edge.
 rect(0,505,900,115,"#555b54");rect(0,512,900,5,"#777c70");rect(0,610,900,5,"#777c70");
 for(let x=25;x<900;x+=110)rect(x,558,54,5,"#c5bd8a");
 // Yard path from front door to road.
 rect(470,370,62,145,"#a99a75");for(let y=378;y<505;y+=22){rect(475,y,52,3,"#c3b38b");}
 // Small shrubs and flowers.
 for(const [x,y] of [[75,95],[125,430],[720,100],[790,390],[635,465],[250,490],[845,250]]){rect(x,y,24,17,"#315b39");rect(x+5,y-6,16,13,"#3c6c40");rect(x+9,y+5,4,4,"#9aaf69");}
 // House floor and walls.
 rect(180,100,380,280,"#8d7655");rect(192,112,356,256,"#c5b38b");
 // Floorboard pixel lines.
 for(let y=135;y<365;y+=38)rect(198,y,344,2,"#ad9872");
 for(let x=230;x<540;x+=76)rect(x,118,2,245,"#b49e78");
 // Outer walls with doorway gap.
 rect(170,90,400,18,"#594a39");rect(170,90,18,300,"#594a39");rect(552,90,18,300,"#594a39");rect(170,372,300,18,"#594a39");rect(532,372,38,18,"#594a39");
 // Wall highlights.
 rect(174,94,392,4,"#a78a62");rect(174,94,4,292,"#a78a62");
 // Window.
 rect(245,91,76,22,"#604d3b");rect(251,96,64,12,"#8fc0b1");rect(281,96,3,12,"#d7dfc0");
 // Furniture: bed, table, storage chest.
 rect(220,145,112,72,"#5d5143");rect(226,151,100,60,"#b8b0a0");rect(226,151,100,17,"#e0d8c4");rect(235,174,35,28,"#8d9d9a");
 rect(390,145,92,48,"#795536");rect(396,151,80,36,"#a77a48");rect(430,151,3,36,"#65452f");
 rect(390,250,68,45,"#65462f");rect(396,256,56,33,"#a77b49");rect(421,265,7,8,"#d6c27c");
 // Doorway and hinged door.
 rect(466,367,66,7,"#d9c9a5");
 if(doorOpen){rect(532,318,8,52,"#714b2e");rect(535,320,3,47,"#b7834b");}
 else{rect(476,331,48,42,"#754c2d");rect(482,336,36,32,"#9b683b");rect(510,350,5,5,"#e4c56d");}
 // Outdoor props: crate and broken fence.
 rect(635,310,42,38,"#775331");rect(640,315,32,28,"#a77a43");rect(653,315,4,28,"#704a2d");rect(640,327,32,4,"#704a2d");
 for(let x=700;x<815;x+=36){rect(x,260,5,64,"#76583a");rect(x+12,279,28,4,"#76583a");}
 // Player shadow and pixel sprite.
 rect(player.x-9,player.y+13,20,5,"#26392a88");
 rect(player.x-7,player.y-13,14,23,"#344b70");rect(player.x-6,player.y-22,12,12,"#d5a77d");
 rect(player.x-7,player.y-25,14,6,"#463c32");rect(player.x-6+(player.face>0?4:0),player.y-17,3,3,"#272b2a");
 rect(player.x-9,player.y-2,18,6,"#263d5a");rect(player.x-7,player.y+5,5,9,"#302c2a");rect(player.x+2,player.y+5,5,9,"#302c2a");
 // Small world labels.
 text("HOME",205,128,"#756447",10);text("YARD",590,135,"#d5e0b9",10);text("ROAD",25,535,"#e1ddc2",10);
 // Door interaction marker.
 const nearDoor=Math.hypot(player.x-door.x,player.y-door.y)<78;
 if(nearDoor){rect(door.x-45,door.y-58,90,22,"#17251ee8");text(doorOpen?"CLOSE DOOR":"OPEN DOOR",door.x-39,door.y-43,"#d5ef9c",10);}
}
const playerRadius=8;
const solidWalls=[
 {x:170,y:90,w:400,h:18},       // top wall
 {x:170,y:90,w:18,h:300},       // left wall
 {x:552,y:90,w:18,h:300},       // right wall
 {x:170,y:372,w:300,h:18},     // bottom-left wall
 {x:532,y:372,w:38,h:18}       // bottom-right wall; doorway is the gap
];
function circleHitsRect(cx,cy,r,box){
 const nearX=Math.max(box.x,Math.min(cx,box.x+box.w));
 const nearY=Math.max(box.y,Math.min(cy,box.y+box.h));
 return (cx-nearX)**2+(cy-nearY)**2<r*r;
}
function blockedAt(x,y){
 if(x<playerRadius||x>900-playerRadius||y<playerRadius||y>620-playerRadius)return true;
 for(const wall of solidWalls)if(circleHitsRect(x,y,playerRadius,wall))return true;
 // The closed door physically fills the doorway. Opening it clears this obstacle.
 if(!doorOpen&&circleHitsRect(x,y,playerRadius,{x:476,y:331,w:48,h:42}))return true;
 return false;
}
function movePlayer(dx,dy){
 const len=Math.hypot(dx,dy)||1,stepX=dx/len*player.speed,stepY=dy/len*player.speed;
 // Resolve each axis separately so the player can slide along walls.
 if(!blockedAt(player.x+stepX,player.y))player.x+=stepX;
 if(!blockedAt(player.x,player.y+stepY))player.y+=stepY;
 if(dx)player.face=Math.sign(dx);
}
function interact(){
 if(Math.hypot(player.x-door.x,player.y-door.y)<85){doorOpen=!doorOpen;hint.textContent=doorOpen?"Door opened. You're home.":"Door closed.";return;}
 hint.textContent="Get closer to the front door to interact.";
}
document.querySelector("#interact-button").addEventListener("click",interact);
function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*900/r.width,y:(e.clientY-r.top)*620/r.height};}
canvas.addEventListener("pointerdown",e=>{e.preventDefault();pointerDown=true;canvas.setPointerCapture?.(e.pointerId);const p=canvasPoint(e);if(Math.hypot(p.x-door.x,p.y-door.y)<72&&Math.hypot(player.x-door.x,player.y-door.y)<95){interact();return;}target=p;hint.textContent="Walking to your selected spot…";});
canvas.addEventListener("pointermove",e=>{if(pointerDown){const p=canvasPoint(e);target=p;}});
canvas.addEventListener("pointerup",()=>{pointerDown=false;});
canvas.addEventListener("pointercancel",()=>{pointerDown=false;});
window.addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==="e"||e.key.toLowerCase()==="x")interact();});
window.addEventListener("keyup",e=>{keys[e.key.toLowerCase()]=false;});
function padPoint(e){const r=pad.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;let x=(e.clientX-cx)/42,y=(e.clientY-cy)/42;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}stick={x,y};knob.style.transform="translate("+x*27+"px,"+y*27+"px)";}
pad.addEventListener("pointerdown",e=>{e.preventDefault();pad.setPointerCapture(e.pointerId);padPoint(e);});
pad.addEventListener("pointermove",e=>{if(e.buttons)padPoint(e);});
function resetPad(){stick={x:0,y:0};knob.style.transform="translate(0,0)";}
pad.addEventListener("pointerup",resetPad);pad.addEventListener("pointercancel",resetPad);
function frame(t){
 if(!gameStarted)return;const dt=Math.min(32,t-(lastTick||t));lastTick=t;
 let dx=stick.x,dy=stick.y;
 if(keys.w||keys.arrowup)dy-=1;if(keys.s||keys.arrowdown)dy+=1;if(keys.a||keys.arrowleft)dx-=1;if(keys.d||keys.arrowright)dx+=1;
 if(Math.abs(dx)+Math.abs(dy)>0){target=null;movePlayer(dx,dy);}
 else if(target){const tx=target.x-player.x,ty=target.y-player.y,dist=Math.hypot(tx,ty);if(dist>5)movePlayer(tx,ty);else target=null;}
 dayMinutes=(dayMinutes+dt*.012)%1440;const hours=Math.floor(dayMinutes/60),mins=Math.floor(dayMinutes%60);
 document.querySelector("#game-time").textContent="DAY 1 · "+String(hours).padStart(2,"0")+":"+String(mins).padStart(2,"0");
 drawScene();requestAnimationFrame(frame);
}
function startGame(){if(gameStarted)return;gameStarted=true;lastTick=0;requestAnimationFrame(frame);}
