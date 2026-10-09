(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function s(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=s(r);fetch(r.href,o)}})();const x={HOME:"HOME",ROOM_HOST_SETUP:"ROOM_HOST_SETUP",ROOM_JOIN_SETUP:"ROOM_JOIN_SETUP",ROOM_LOBBY:"ROOM_LOBBY",ROOM_LOBBY_WAITING:"ROOM_LOBBY_WAITING",GUESSING:"GUESSING",WINNER:"WINNER"};function F(){return{screen:x.HOME,isHost:!1,roomCode:null,myPlayerId:null,myPlayerName:"",myPlayerSecret:null,playerCount:4,maxNumber:40,players:[],currentPlayerIndex:0,guessedNumbers:[],round:1,turnCount:0,lastGuessResult:null,winner:null,historyLog:[],rulesModalOpen:!1,inviteModalOpen:!1,trackerTab:"grid",copiedInviteToast:!1,stats:{totalGuesses:0,totalEliminations:0}}}class Q{constructor(){this.state=F(),this.listeners=[]}getState(){return this.state}setState(e){typeof e=="function"?this.state={...this.state,...e(this.state)}:this.state={...this.state,...e},this.notify()}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(s=>s!==e)}}notify(){for(const e of this.listeners)e(this.state)}reset(){this.state=F(),this.notify()}}const l=new Q;class K{constructor(){this.audioCtx=null,this.soundEnabled=!0}init(){if(!this.audioCtx){const e=window.AudioContext||window.webkitAudioContext;e&&(this.audioCtx=new e)}this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume()}toggleSound(){return this.soundEnabled=!this.soundEnabled,this.soundEnabled}playClick(){if(!this.soundEnabled||(this.init(),!this.audioCtx))return;const e=this.audioCtx.createOscillator(),s=this.audioCtx.createGain();e.type="sine",e.frequency.setValueAtTime(600,this.audioCtx.currentTime),e.frequency.exponentialRampToValueAtTime(300,this.audioCtx.currentTime+.06),s.gain.setValueAtTime(.12,this.audioCtx.currentTime),s.gain.exponentialRampToValueAtTime(.001,this.audioCtx.currentTime+.06),e.connect(s),s.connect(this.audioCtx.destination),e.start(),e.stop(this.audioCtx.currentTime+.06)}playConfirm(){if(!this.soundEnabled||(this.init(),!this.audioCtx))return;const e=this.audioCtx.currentTime,s=this.audioCtx.createOscillator(),n=this.audioCtx.createGain();s.type="triangle",s.frequency.setValueAtTime(440,e),s.frequency.setValueAtTime(659.25,e+.08),n.gain.setValueAtTime(.15,e),n.gain.exponentialRampToValueAtTime(.001,e+.22),s.connect(n),n.connect(this.audioCtx.destination),s.start(),s.stop(e+.22)}playElimination(){if(!this.soundEnabled||(this.init(),!this.audioCtx))return;const e=this.audioCtx.currentTime,s=this.audioCtx.createOscillator(),n=this.audioCtx.createGain();s.type="sawtooth",s.frequency.setValueAtTime(240,e),s.frequency.exponentialRampToValueAtTime(70,e+.35),n.gain.setValueAtTime(.25,e),n.gain.exponentialRampToValueAtTime(.001,e+.35),s.connect(n),n.connect(this.audioCtx.destination),s.start(),s.stop(e+.35)}playMiss(){if(!this.soundEnabled||(this.init(),!this.audioCtx))return;const e=this.audioCtx.currentTime,s=this.audioCtx.createOscillator(),n=this.audioCtx.createGain();s.type="sine",s.frequency.setValueAtTime(320,e),s.frequency.exponentialRampToValueAtTime(200,e+.15),n.gain.setValueAtTime(.12,e),n.gain.exponentialRampToValueAtTime(.001,e+.15),s.connect(n),n.connect(this.audioCtx.destination),s.start(),s.stop(e+.15)}playVictory(){if(!this.soundEnabled||(this.init(),!this.audioCtx))return;const e=[523.25,659.25,783.99,1046.5],s=this.audioCtx.currentTime;e.forEach((n,r)=>{const o=this.audioCtx.createOscillator(),i=this.audioCtx.createGain(),a=s+r*.12;o.type="triangle",o.frequency.setValueAtTime(n,a),i.gain.setValueAtTime(.2,a),i.gain.exponentialRampToValueAtTime(.001,a+.35),o.connect(i),i.connect(this.audioCtx.destination),o.start(a),o.stop(a+.35)})}}const b=new K;class X{constructor(e="confetti-canvas"){this.canvas=document.getElementById(e),this.ctx=this.canvas?this.canvas.getContext("2d"):null,this.particles=[],this.animationFrame=null,this.colors=["#2563EB","#10B981","#F59E0B","#EF4444","#06B6D4","#FFFFFF"]}resize(){this.canvas&&(this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight)}start(e=4e3){if(!this.canvas)return;this.resize(),this.particles=[];const s=Math.min(180,Math.floor(window.innerWidth/8));for(let o=0;o<s;o++)this.particles.push({x:Math.random()*this.canvas.width,y:Math.random()*this.canvas.height-this.canvas.height,size:Math.random()*8+4,color:this.colors[Math.floor(Math.random()*this.colors.length)],speedX:(Math.random()-.5)*6,speedY:Math.random()*4+3,rotation:Math.random()*360,rotationSpeed:(Math.random()-.5)*10,opacity:1});const n=Date.now(),r=()=>{const o=Date.now()-n;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);let i=!1;for(const a of this.particles)a.x+=a.speedX,a.y+=a.speedY,a.rotation+=a.rotationSpeed,o>e-1e3&&(a.opacity=Math.max(0,1-(o-(e-1e3))/1e3)),a.y<this.canvas.height&&a.opacity>0&&(i=!0,this.ctx.save(),this.ctx.globalAlpha=a.opacity,this.ctx.translate(a.x,a.y),this.ctx.rotate(a.rotation*Math.PI/180),this.ctx.fillStyle=a.color,this.ctx.fillRect(-a.size/2,-a.size/2,a.size,a.size*.6),this.ctx.restore());i&&o<e?this.animationFrame=requestAnimationFrame(r):this.stop()};this.animationFrame&&cancelAnimationFrame(this.animationFrame),this.animationFrame=requestAnimationFrame(r)}stop(){this.animationFrame&&(cancelAnimationFrame(this.animationFrame),this.animationFrame=null),this.ctx&&this.canvas&&this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}}function w(t){return typeof t!="string"?"":t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function E(t="light"){typeof navigator<"u"&&navigator.vibrate&&(t==="light"?navigator.vibrate(25):t==="heavy"&&navigator.vibrate([60,40,60]))}const Z="modulepreload",ee=function(t){return"/"+t},J={},te=function(e,s,n){let r=Promise.resolve();if(s&&s.length>0){let i=function(h){return Promise.all(h.map(g=>Promise.resolve(g).then(S=>({status:"fulfilled",value:S}),S=>({status:"rejected",reason:S}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),f=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=i(s.map(h=>{if(h=ee(h),h in J)return;J[h]=!0;const g=h.endsWith(".css"),S=g?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${h}"]${S}`))return;const v=document.createElement("link");if(v.rel=g?"stylesheet":Z,g||(v.as="script"),v.crossOrigin="",v.href=h,f&&v.setAttribute("nonce",f),document.head.appendChild(v),g)return new Promise((d,c)=>{v.addEventListener("load",d),v.addEventListener("error",()=>c(new Error(`Unable to preload CSS for ${h}`)))})}))}function o(i){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=i,window.dispatchEvent(a),!a.defaultPrevented)throw i}return r.then(i=>{for(const a of i||[])a.status==="rejected"&&o(a.reason);return e().catch(o)})};class se{constructor(){this.peer=null,this.connections=new Map,this.hostConnection=null,this.broadcastChannel=null,this.isHost=!1,this.myPlayerId=null,this.roomCode=null}initBroadcastChannel(e){this.broadcastChannel&&this.broadcastChannel.close();try{this.broadcastChannel=new BroadcastChannel(`lns_room_${e}`),this.broadcastChannel.onmessage=s=>{this.handleIncomingMessage(s.data)}}catch(s){console.warn("BroadcastChannel not supported",s)}}generateRoomCode(){const e="23456789ABCDEFGHJKLMNPQRSTUVWXYZ";let s="";for(let n=0;n<4;n++)s+=e.charAt(Math.floor(Math.random()*e.length));return`LNS-${s}`}getPeerId(e){return`lns-game-${e.toLowerCase().replace(/[^a-z0-9]/g,"")}`}createRoom(e,s,n,r){this.isHost=!0,this.roomCode=this.generateRoomCode(),this.myPlayerId="host_"+Math.random().toString(36).substring(2,8);const o=Math.max(10,parseInt(r,10)||40);this.initBroadcastChannel(this.roomCode);const i={id:1,networkId:this.myPlayerId,name:e||"Host (Player 1)",secretNumber:s,isHost:!0,ready:!0,active:!0,eliminatedInRound:null};l.setState({isHost:!0,roomCode:this.roomCode,myPlayerId:this.myPlayerId,playerCount:n,maxNumber:o,players:[i],screen:x.ROOM_LOBBY}),this.initHostPeer(this.roomCode)}initHostPeer(e){const s=this.getPeerId(e);try{typeof window.Peer<"u"&&(this.peer&&this.peer.destroy(),this.peer=new window.Peer(s,{debug:1}),this.peer.on("open",n=>{console.log("Host Peer opened with ID:",n)}),this.peer.on("connection",n=>{this.handleClientConnection(n)}),this.peer.on("error",n=>{console.warn("PeerJS Host warning/error (Local BroadcastChannel will remain active):",n)}))}catch(n){console.warn("PeerJS initialization skipped:",n)}}handleClientConnection(e){e.on("open",()=>{e.on("data",s=>{this.handleIncomingMessage(s,e)})}),e.on("close",()=>{for(const[s,n]of this.connections.entries())if(n===e){this.connections.delete(s);break}})}joinRoom(e,s,n){this.isHost=!1,this.roomCode=e.toUpperCase().trim(),this.myPlayerId="client_"+Math.random().toString(36).substring(2,8),this.initBroadcastChannel(this.roomCode),l.setState({gameMode:"ONLINE_ROOM",isHost:!1,roomCode:this.roomCode,myPlayerId:this.myPlayerId,myPlayerName:s,myPlayerSecret:n,screen:x.ROOM_LOBBY_WAITING});const r=this.getPeerId(this.roomCode);try{typeof window.Peer<"u"&&(this.peer&&this.peer.destroy(),this.peer=new window.Peer({debug:1}),this.peer.on("open",()=>{const o=this.peer.connect(r,{reliable:!0});this.hostConnection=o,o.on("open",()=>{o.send({type:"PLAYER_JOIN",networkId:this.myPlayerId,name:s,secretNumber:n})}),o.on("data",i=>{this.handleIncomingMessage(i)})}),this.peer.on("error",o=>{console.warn("PeerJS Client connection:",o)}))}catch(o){console.warn("Peer connection error",o)}this.sendBroadcast({type:"PLAYER_JOIN",networkId:this.myPlayerId,name:s,secretNumber:n})}queryRoomInfo(e){if(!e)return;const s=e.toUpperCase().trim();this.roomCode=s,this.initBroadcastChannel(s),this.sendBroadcast({type:"QUERY_ROOM_INFO",roomCode:s});const n=this.getPeerId(s);try{if(typeof window.Peer<"u"){(!this.peer||this.peer.destroyed)&&(this.peer=new window.Peer({debug:1}));const r=()=>{try{const o=this.peer.connect(n,{reliable:!0});o.on("open",()=>{o.send({type:"QUERY_ROOM_INFO",roomCode:s})}),o.on("data",i=>{this.handleIncomingMessage(i)})}catch(o){console.warn("Failed to query peer",o)}};this.peer.open?r():this.peer.on("open",()=>r())}}catch(r){console.warn("Query room error:",r)}}handleIncomingMessage(e,s=null){if(!(!e||!e.type))if(this.isHost)switch(e.type){case"PLAYER_JOIN":{const n=l.getState();if(n.players.findIndex(f=>f.networkId===e.networkId)!==-1)return;if(n.players.length>=n.playerCount){const f={type:"JOIN_REJECTED",reason:"Room is already full!"};s&&s.send(f),this.sendBroadcast(f);return}const o=Number(e.secretNumber);if(!Number.isInteger(o)||o<1||o>n.maxNumber){const f={type:"JOIN_REJECTED",networkId:e.networkId,reason:`Your secret number (${e.secretNumber}) is out of range! The host set the number limit to 1–${n.maxNumber}.`,maxNumber:n.maxNumber};s&&s.send(f),this.sendBroadcast(f);return}s&&this.connections.set(e.networkId,s);const i={id:n.players.length+1,networkId:e.networkId,name:e.name||`Player ${n.players.length+1}`,secretNumber:o,isHost:!1,ready:!0,active:!0,eliminatedInRound:null},a=[...n.players,i];b.playConfirm(),E("light"),l.setState({players:a}),this.broadcastLobbyState(a,n.playerCount,n.maxNumber);break}case"QUERY_ROOM_INFO":{const n=l.getState(),r={type:"ROOM_INFO_RESPONSE",roomCode:n.roomCode,maxNumber:n.maxNumber,playerCount:n.playerCount};s&&s.send(r),this.sendBroadcast(r);break}case"SUBMIT_GUESS":{e.networkId&&te(async()=>{const{GameActions:n}=await Promise.resolve().then(()=>ne);return{GameActions:n}},void 0).then(({GameActions:n})=>{n.submitGuess(e.guess)});break}}else switch(e.type){case"JOIN_REJECTED":{(!e.networkId||e.networkId===this.myPlayerId)&&(b.playMiss(),E("heavy"),l.setState({screen:x.ROOM_JOIN_SETUP,maxNumber:e.maxNumber||l.getState().maxNumber}),setTimeout(()=>{const n=document.querySelector("#join-validation-error");n&&(n.textContent=e.reason||"Secret number out of range!",n.classList.remove("hidden"))},50));break}case"ROOM_INFO_RESPONSE":{if(e.roomCode===this.roomCode||!this.roomCode){l.setState({maxNumber:e.maxNumber,playerCount:e.playerCount});const n=document.querySelector("#join-range-badge");n&&(n.textContent=`Host Range: 1–${e.maxNumber}`);const r=document.querySelector("#join-secret-input");r&&(r.max=e.maxNumber,r.placeholder=`Pick number (1–${e.maxNumber})`)}break}case"LOBBY_STATE_SYNC":{l.setState({playerCount:e.playerCount,maxNumber:e.maxNumber,players:e.players.map(n=>({...n,secretNumber:n.networkId===this.myPlayerId?l.getState().myPlayerSecret:null}))});break}case"START_GAME_SYNC":{b.playConfirm(),l.setState({players:e.players.map(n=>({...n,secretNumber:n.networkId===this.myPlayerId?l.getState().myPlayerSecret:null})),maxNumber:e.maxNumber,currentPlayerIndex:e.currentPlayerIndex,round:e.round,turnCount:e.turnCount,guessedNumbers:e.guessedNumbers,screen:x.GUESSING});break}case"GUESS_RESULT_SYNC":{(e.lastGuessResult&&e.lastGuessResult.eliminated?e.lastGuessResult.eliminated.length:0)>0?(b.playElimination(),E("heavy")):b.playClick(),l.setState({players:e.players.map(r=>({...r,secretNumber:r.networkId===this.myPlayerId?l.getState().myPlayerSecret:null})),guessedNumbers:e.guessedNumbers,lastGuessResult:e.lastGuessResult,turnCount:e.turnCount,currentPlayerIndex:e.currentPlayerIndex!==void 0?e.currentPlayerIndex:l.getState().currentPlayerIndex,round:e.round,historyLog:e.historyLog,stats:e.stats,screen:x.GUESSING});break}case"TURN_ADVANCE_SYNC":{l.setState({currentPlayerIndex:e.currentPlayerIndex,round:e.round,screen:x.GUESSING});break}case"WINNER_SYNC":{b.playVictory(),l.setState({winner:e.winner,screen:x.WINNER});break}case"RESET_GAME_SYNC":{b.playClick(),l.setState({screen:x.HOME});break}}}broadcastToAll(e){for(const s of this.connections.values())s&&s.open&&s.send(e);this.sendBroadcast(e)}sendBroadcast(e){if(this.broadcastChannel)try{this.broadcastChannel.postMessage(e)}catch(s){console.warn("Broadcast send error",s)}}broadcastLobbyState(e,s,n){const r=e.map(o=>({id:o.id,networkId:o.networkId,name:o.name,isHost:o.isHost,ready:o.ready,active:o.active}));this.broadcastToAll({type:"LOBBY_STATE_SYNC",playerCount:s,maxNumber:n,players:r})}hostStartGame(){const e=l.getState(),s=e.players.map(n=>({id:n.id,networkId:n.networkId,name:n.name,isHost:n.isHost,ready:n.ready,active:n.active}));this.broadcastToAll({type:"START_GAME_SYNC",players:s,maxNumber:e.maxNumber,currentPlayerIndex:0,round:1,turnCount:0,guessedNumbers:[]}),l.setState({currentPlayerIndex:0,round:1,turnCount:0,guessedNumbers:[],screen:x.GUESSING})}hostBroadcastGuessResult(e){const s=e.players.map(n=>({id:n.id,networkId:n.networkId,name:n.name,isHost:n.isHost,ready:n.ready,active:n.active,eliminatedInRound:n.eliminatedInRound}));this.broadcastToAll({type:"GUESS_RESULT_SYNC",players:s,guessedNumbers:e.guessedNumbers,lastGuessResult:e.lastGuessResult,turnCount:e.turnCount,currentPlayerIndex:e.currentPlayerIndex,round:e.round,historyLog:e.historyLog,stats:e.stats})}hostBroadcastTurnAdvance(e,s){this.broadcastToAll({type:"TURN_ADVANCE_SYNC",currentPlayerIndex:e,round:s})}hostBroadcastWinner(e){this.broadcastToAll({type:"WINNER_SYNC",winner:e})}clientSendGuess(e){const s={type:"SUBMIT_GUESS",networkId:this.myPlayerId,guess:e};this.hostConnection&&this.hostConnection.open&&this.hostConnection.send(s),this.sendBroadcast(s)}clientRequestContinue(){const e={type:"REQUEST_CONTINUE",networkId:this.myPlayerId};this.hostConnection&&this.hostConnection.open&&this.hostConnection.send(e),this.sendBroadcast(e)}}const I=new se;function D(t){const e=parseInt(t,10);return isNaN(e)||e<2?20:e>10?100:e*10}function $(t,e){if(t===""||t===null||t===void 0)return{valid:!1,error:"Please enter a secret number."};const s=Number(t);return Number.isInteger(s)?s<1?{valid:!1,error:"Number must be at least 1."}:s>e?{valid:!1,error:`Number cannot exceed the room limit of ${e}.`}:{valid:!0,number:s}:{valid:!1,error:"Please enter a whole integer without decimals."}}function M(t,e,s,n){if(t===""||t===null||t===void 0)return{valid:!1,error:"Please enter a guess."};const r=Number(t);return Number.isInteger(r)?r<1||r>e?{valid:!1,error:`Please enter a valid number between 1 and ${e}.`}:s.includes(r)?{valid:!1,error:`Number ${r} has already been guessed. Try another number!`}:n!==null&&r===n?{valid:!1,error:"You cannot guess your own secret number!"}:{valid:!0,number:r}:{valid:!1,error:"Please enter a whole integer."}}function z(t,e){const s=t.length;for(let n=1;n<=s;n++){const r=(e+n)%s;if(t[r]&&t[r].active)return r}return e}const m={openHostRoomSetup(){b.playClick(),l.setState({screen:x.ROOM_HOST_SETUP})},openJoinRoomSetup(t=""){b.playClick();const e=(t||l.getState().roomCode||"").toUpperCase().trim();l.setState({roomCode:e,screen:x.ROOM_JOIN_SETUP}),e&&I.queryRoomInfo(e)},setPlayerCount(t){const e=Math.max(2,Math.min(10,parseInt(t,10)||2)),s=D(e);l.setState({playerCount:e,maxNumber:s})},setMaxNumber(t){const e=Math.max(10,Math.min(1e3,parseInt(t,10)||40));l.setState({maxNumber:e})},submitHostRoom(t,e,s,n){const r=Math.max(2,Math.min(10,parseInt(s,10)||4)),o=Math.max(10,parseInt(n,10)||40),i=$(e,o);return i.valid?(b.playConfirm(),I.createRoom(t.trim()||"Host",i.number,r,o),{valid:!0}):i},submitJoinRoom(t,e,s){if(!t||t.trim().length<3)return{valid:!1,error:"Please enter a valid Room Code (e.g. LNS-4821)"};if(!e||e.trim().length===0)return{valid:!1,error:"Please enter your player name."};const r=l.getState().maxNumber||40,o=$(s,r);return o.valid?(b.playConfirm(),I.joinRoom(t.trim(),e.trim(),o.number),{valid:!0}):o},hostStartRoomMatch(){if(l.getState().players.length<2){alert("Need at least 2 players in the room to start the game!");return}b.playConfirm(),I.hostStartGame()},submitGuess(t){const e=l.getState(),s=e.players[e.currentPlayerIndex];if(!e.isHost){const c=e.myPlayerSecret,y=M(t,e.maxNumber,e.guessedNumbers,c);return y.valid?(I.clientSendGuess(y.number),{valid:!0}):(b.playMiss(),E("heavy"),y)}const n=M(t,e.maxNumber,e.guessedNumbers,s?s.secretNumber:null);if(!n.valid)return b.playMiss(),E("heavy"),n;const r=n.number,o=[...e.guessedNumbers,r],i=[],a=e.players.map(c=>c.active&&c.id!==s.id&&c.secretNumber===r?(i.push(c),{...c,active:!1,eliminatedInRound:e.round}):c);i.length>0?(b.playElimination(),E("heavy")):b.playClick();const f={round:e.round,turn:e.turnCount+1,guesser:s?s.name:"Player",guessedNumber:r,eliminatedNames:i.map(c=>c.name)},h=a.filter(c=>c.active);if(h.length===1){b.playVictory();const c={players:a,guessedNumbers:o,turnCount:e.turnCount+1,lastGuessResult:{guesser:s,guessedNumber:r,eliminated:i},historyLog:[f,...e.historyLog],stats:{totalGuesses:e.stats.totalGuesses+1,totalEliminations:e.stats.totalEliminations+i.length},winner:h[0],screen:x.WINNER};return l.setState(c),e.isHost&&(I.hostBroadcastWinner(h[0]),I.hostBroadcastGuessResult(c)),{valid:!0,eliminatedCount:i.length}}const g=z(a,e.currentPlayerIndex),v=g<=e.currentPlayerIndex?e.round+1:e.round,d={players:a,guessedNumbers:o,turnCount:e.turnCount+1,currentPlayerIndex:g,round:v,lastGuessResult:{guesser:s,guessedNumber:r,eliminated:i},historyLog:[f,...e.historyLog],stats:{totalGuesses:e.stats.totalGuesses+1,totalEliminations:e.stats.totalEliminations+i.length},screen:x.GUESSING};return l.setState(d),e.isHost&&I.hostBroadcastGuessResult(d),{valid:!0,eliminatedCount:i.length}},playAgain(){b.playClick(),l.reset(),l.setState({screen:x.HOME})},goToHome(){b.playClick(),l.reset(),l.setState({screen:x.HOME})},toggleRules(t){b.playClick(),l.setState(e=>({rulesModalOpen:typeof t=="boolean"?t:!e.rulesModalOpen}))},toggleInviteModal(t){b.playClick(),l.setState(e=>({inviteModalOpen:typeof t=="boolean"?t:!e.inviteModalOpen,copiedInviteToast:!1}))},setTrackerTab(t){b.playClick(),l.setState({trackerTab:t})},getInviteLink(){const t=l.getState(),e=new URL(window.location.href);return t.roomCode&&(e.searchParams.set("room",t.roomCode),e.searchParams.set("limit",t.maxNumber.toString())),e.toString()},async copyInviteLink(){const t=this.getInviteLink();try{if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(t);else{const e=document.createElement("input");e.value=t,document.body.appendChild(e),e.select(),document.execCommand("copy"),document.body.removeChild(e)}return b.playConfirm(),l.setState({copiedInviteToast:!0}),setTimeout(()=>{l.setState({copiedInviteToast:!1})},3e3),!0}catch(e){return console.error("Failed to copy link: ",e),!1}},async shareInvite(){const t=this.getInviteLink(),e=l.getState(),s=e.roomCode?` (Room Code: ${e.roomCode})`:"";if(navigator.share)try{await navigator.share({title:"Last Number Standing - Join Room!",text:`Join our Last Number Standing game room!${s} (Number Limit: 1–${e.maxNumber}).`,url:t}),b.playConfirm()}catch{}else await this.copyInviteLink()},loadFromUrlParams(){try{const t=new URLSearchParams(window.location.search),e=t.get("room"),s=t.get("limit");if(e){const n=e.toUpperCase().trim(),r=s?Math.max(10,parseInt(s,10)||40):40;return l.setState({roomCode:n,maxNumber:r,screen:x.ROOM_JOIN_SETUP}),setTimeout(()=>{I.queryRoomInfo(n)},150),!0}}catch(t){console.warn("Could not parse invite params",t)}return!1}},ne=Object.freeze(Object.defineProperty({__proto__:null,GameActions:m,calculateMaxNumber:D,getNextActivePlayerIndex:z,validateGuessInput:M,validateSecretNumberInput:$},Symbol.toStringTag,{value:"Module"}));let R=null;function re(){const t=document.getElementById("app");R=new X("confetti-canvas"),window.addEventListener("resize",()=>{R&&R.resize()}),l.subscribe(e=>{W(t,e)}),W(t,l.getState())}function W(t,e){if(!t)return;e.screen===x.WINNER?R&&R.start(6e3):R&&R.stop();let s="";switch(e.screen){case x.HOME:s=V();break;case x.ROOM_HOST_SETUP:s=oe(e);break;case x.ROOM_JOIN_SETUP:s=ae(e);break;case x.ROOM_LOBBY:s=ie(e);break;case x.ROOM_LOBBY_WAITING:s=le(e);break;case x.GUESSING:s=de(e);break;case x.WINNER:s=ce(e);break;default:s=V()}t.innerHTML=`
    <div class="min-h-screen flex flex-col justify-between p-3 sm:p-5 md:p-6 max-w-5xl mx-auto">
      <!-- Header / Top Bar -->
      <header class="flex items-center justify-between py-3 mb-4 border-b border-slate-800 gap-3">
        <button id="nav-brand-btn" class="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
            #
          </div>
          <div>
            <h1 class="text-sm sm:text-base font-bold tracking-tight text-white uppercase leading-tight font-display">
              Last Number Standing
            </h1>
            <span class="text-[11px] text-slate-400 font-medium">
              ${e.roomCode?`Room: <strong class="text-blue-400 font-mono">${e.roomCode}</strong>`:"Multiplayer Elimination"}
            </span>
          </div>
        </button>

        <div class="flex items-center gap-2">
          <!-- Invite / Share Button -->
          <button id="btn-open-invite" aria-label="Invite Friends" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 focus:outline-none cursor-pointer">
            <span>🔗</span>
            <span class="hidden xs:inline">Invite Link</span>
          </button>

          <!-- Sound Toggle Button -->
          <button id="btn-toggle-sound" aria-label="Toggle Sound" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition focus:outline-none cursor-pointer">
            ${b.soundEnabled?"🔊":"🔇"}
          </button>

          <!-- Rules Modal Button -->
          <button id="btn-open-rules" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 focus:outline-none cursor-pointer">
            <span>📖</span>
            <span class="hidden sm:inline">Rules</span>
          </button>
        </div>
      </header>

      <!-- Dynamic Screen Content -->
      <main class="flex-1 flex flex-col justify-center my-auto py-2">
        ${s}
      </main>

      <!-- Footer -->
      <footer class="text-center py-3 mt-6 text-xs text-slate-500 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>Strategic number elimination party game • Multi-Device Multiplayer</p>
        <p class="text-slate-400 font-medium">100% Client-Side • Serverless P2P</p>
      </footer>
    </div>

    <!-- Invite Friends Modal -->
    ${e.inviteModalOpen?ue(e):""}

    <!-- Rules Modal -->
    ${e.rulesModalOpen?me():""}
  `,be(t,e)}function V(){return`
    <div class="animate-fade-in flex flex-col items-center text-center max-w-xl mx-auto">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-5">
        <span>🎮 Multi-Device Elimination Game</span>
      </div>

      <!-- Hero Title -->
      <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight font-display mb-3">
        LAST NUMBER STANDING
      </h2>

      <!-- Subtitle -->
      <p class="text-sm sm:text-base text-slate-300 mb-8 max-w-md leading-relaxed">
        Secretly choose your number. Guess your friends' numbers to eliminate them one by one. Be the <strong class="text-blue-400">last player standing</strong>!
      </p>

      <!-- Action Cards -->
      <div class="w-full space-y-3.5 mb-6">
        <button id="btn-home-create-room" class="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg transition cursor-pointer flex items-center justify-center gap-2">
          <span>🌐</span>
          <span>Create Game Room & Invite Friends</span>
          <span>➔</span>
        </button>

        <!-- Join Room Card -->
        <div class="game-card p-4 rounded-xl border border-slate-800 flex items-center gap-2">
          <input
            type="text"
            id="home-join-code-input"
            placeholder="Enter Room Code (e.g. LNS-4821)"
            class="w-full text-center uppercase font-mono font-bold text-sm py-2.5 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-blue-500 outline-none"
          />
          <button id="btn-home-join-code" class="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition shrink-0 cursor-pointer">
            Join Room 🔑
          </button>
        </div>
      </div>

      <button id="btn-home-rules" class="text-xs font-medium text-slate-400 hover:text-blue-300 transition underline underline-offset-4 cursor-pointer">
        Read Full Game Rules
      </button>
    </div>
  `}function oe(t){const e=t.playerCount||4,s=t.maxNumber||40,r=[2,3,4,5,6,7,8,9,10].map(a=>`
      <button
        type="button"
        data-count="${a}"
        class="btn-select-player-count py-2.5 rounded-lg font-bold text-xs border transition cursor-pointer ${a===e?"bg-blue-600 border-blue-500 text-white shadow-sm":"bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"}"
      >
        ${a}P
      </button>
    `).join(""),i=[20,30,40,50,100].map(a=>`
      <button
        type="button"
        data-limit="${a}"
        class="btn-select-limit-preset px-2.5 py-1 rounded-md font-mono text-xs border transition cursor-pointer ${a===s?"bg-blue-600/30 border-blue-500 text-blue-300 font-bold":"bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"}"
      >
        1–${a}
      </button>
    `).join("");return`
    <div class="animate-fade-in max-w-lg mx-auto w-full game-card p-6 rounded-2xl border border-slate-800">
      <div class="text-center mb-5">
        <span class="text-xs font-bold text-blue-400 tracking-wider uppercase">Host Room Setup</span>
        <h2 class="text-2xl font-bold text-white font-display">Create Game Room</h2>
        <p class="text-xs text-slate-400 mt-1">Select player count and customize your secret number limit</p>
      </div>

      <form id="form-host-setup" class="space-y-4">
        <!-- 1. Player Count (Discrete Buttons - NO SLIDER) -->
        <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Number of Players:
            </label>
            <span class="text-xs font-bold text-blue-400 font-mono">${e} Players</span>
          </div>
          <div class="grid grid-cols-9 gap-1">
            ${r}
          </div>
        </div>

        <!-- 2. Host Custom Number Limit -->
        <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <label for="host-max-number-input" class="text-xs font-bold uppercase tracking-wider text-slate-300">
              Secret Number Limit (1 to Max):
            </label>
            <span class="text-xs font-mono font-bold text-emerald-400">1 – ${s}</span>
          </div>

          <div class="flex items-center gap-2 mb-2">
            <input
              type="number"
              id="host-max-number-input"
              min="10"
              max="1000"
              step="1"
              value="${s}"
              required
              class="w-full p-2 bg-slate-950 font-mono font-bold text-white text-center rounded-lg border border-slate-800 focus:border-blue-500 outline-none"
            />
          </div>

          <!-- Quick Presets -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] text-slate-500 uppercase font-bold">Presets:</span>
            ${i}
          </div>
        </div>

        <!-- 3. Host Name -->
        <div>
          <label for="host-name-input" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Your Name (Host):
          </label>
          <input
            type="text"
            id="host-name-input"
            placeholder="Host (Player 1)"
            maxlength="20"
            required
            class="w-full p-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
        </div>

        <!-- 4. Host Secret Number -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="host-secret-input" class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Secret Number:
            </label>
            <span id="host-secret-range-hint" class="text-xs font-mono text-emerald-400 font-semibold">Valid: 1–${s}</span>
          </div>
          <input
            type="number"
            id="host-secret-input"
            min="1"
            max="${s}"
            required
            placeholder="e.g. 17"
            class="w-full p-2.5 text-center text-xl font-bold bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
          <div id="host-secret-error" class="hidden mt-2 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800 p-2 rounded-lg text-center"></div>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer"
        >
          Create Room & Open Lobby ➔
        </button>
      </form>
    </div>
  `}function ae(t){const e=t.roomCode||"",s=t.maxNumber||40;return`
    <div class="animate-fade-in max-w-md mx-auto w-full game-card p-6 rounded-2xl border border-slate-800">
      <div class="text-center mb-5">
        <span class="text-xs font-bold text-blue-400 tracking-wider uppercase">Invited Player</span>
        <h2 class="text-2xl font-bold text-white font-display">Join Game Room</h2>
        <p class="text-xs text-slate-400 mt-1">Enter your player name and choose your secret number</p>
      </div>

      <form id="form-join-setup" class="space-y-4">
        <!-- Room Code -->
        <div>
          <label for="join-room-code-input" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Room Code:
          </label>
          <input
            type="text"
            id="join-room-code-input"
            value="${w(e)}"
            placeholder="LNS-4821"
            required
            class="w-full p-2.5 uppercase font-mono font-bold text-center text-base bg-slate-900 text-blue-400 rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
        </div>

        <!-- Player Name -->
        <div>
          <label for="join-player-name-input" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Your Player Name:
          </label>
          <input
            type="text"
            id="join-player-name-input"
            placeholder="Enter your name..."
            maxlength="20"
            required
            autofocus
            class="w-full p-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
        </div>

        <!-- Secret Number -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="join-secret-input" class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Secret Number:
            </label>
            <span id="join-range-badge" class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              Host Range: 1–${s}
            </span>
          </div>
          <input
            type="number"
            id="join-secret-input"
            min="1"
            max="${s}"
            required
            placeholder="Pick number (1–${s})"
            class="w-full p-2.5 text-center text-xl font-bold bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
          />
          <div id="join-validation-error" class="hidden mt-2 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800 p-2 rounded-lg text-center"></div>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer"
        >
          Join Room & Lock Secret Number 🔒
        </button>
      </form>
    </div>
  `}function ie(t){const e=t.roomCode||"LNS-ROOM",s=t.players||[],n=t.playerCount||4,r=s.length>=2;let o="";for(let i=0;i<n;i++){const a=s[i];a?o+=`
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-blue-950 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-800">
              ${a.isHost?"👑":i+1}
            </span>
            <div class="text-sm font-bold text-white flex items-center gap-2">
              <span>${w(a.name)}</span>
              ${a.isHost?'<span class="text-[9px] bg-amber-950 text-amber-300 px-1 py-0.2 rounded border border-amber-800">HOST</span>':""}
            </div>
          </div>
          <span class="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            ✓ Ready
          </span>
        </div>
      `:o+=`
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-slate-900 text-slate-600 font-bold text-xs flex items-center justify-center">
              ${i+1}
            </span>
            <span class="text-xs italic">Waiting for player ${i+1} to join...</span>
          </div>
          <span class="text-xs text-slate-500">⏳ Waiting</span>
        </div>
      `}return`
    <div class="animate-fade-in max-w-lg mx-auto w-full game-card p-6 rounded-2xl border border-slate-800">
      <div class="text-center mb-5">
        <span class="text-xs font-bold text-blue-400 tracking-wider uppercase">Host Lobby</span>
        <h2 class="text-2xl font-bold text-white font-display">Room: <span class="text-blue-400 font-mono">${e}</span></h2>
        <p class="text-xs text-slate-400 mt-1">Number Limit: <strong class="text-emerald-400 font-mono">1–${t.maxNumber}</strong></p>
      </div>

      <!-- Share Box -->
      <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-800 mb-4 flex items-center justify-between gap-2">
        <div class="text-xs text-slate-300">
          Players: <strong class="text-emerald-400 font-bold">${s.length} / ${n} Ready</strong>
        </div>
        <button id="btn-lobby-invite" class="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold text-xs flex items-center gap-1 transition cursor-pointer">
          <span>🔗</span> Copy Invite Link
        </button>
      </div>

      <!-- Players List -->
      <div class="space-y-2 mb-5">
        ${o}
      </div>

      <!-- Start Match Button -->
      <button
        id="btn-host-start-match"
        class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition ${r?"cursor-pointer":"opacity-40 cursor-not-allowed"}"
        ${r?"":"disabled"}
      >
        ${r?"START GAME 🚀":`Waiting for Players (${s.length}/${n})...`}
      </button>
    </div>
  `}function le(t){const e=t.roomCode||"LNS-ROOM",s=t.players||[],n=t.playerCount||4;let r="";return s.forEach((o,i)=>{const a=o.networkId===t.myPlayerId;r+=`
      <div class="flex items-center justify-between p-2.5 rounded-xl ${a?"bg-blue-950/40 border border-blue-800 text-white":"bg-slate-900 border border-slate-800 text-slate-300"}">
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
            ${o.isHost?"👑":i+1}
          </span>
          <div class="text-xs font-bold">
            <span>${w(o.name)}</span>
            ${a?'<span class="text-[10px] text-blue-400 bg-blue-950 px-1 py-0.2 rounded ml-1 font-normal">You</span>':""}
          </div>
        </div>
        <span class="text-xs font-bold text-emerald-400">✓ Ready</span>
      </div>
    `}),`
    <div class="animate-fade-in max-w-md mx-auto w-full game-card p-6 rounded-2xl border border-slate-800 text-center">
      <div class="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3">
        ⏳
      </div>

      <span class="text-xs font-bold text-blue-400 tracking-wider uppercase">Connected to Room</span>
      <h2 class="text-2xl font-bold text-white font-display mb-1">
        ${e}
      </h2>
      <p class="text-xs text-slate-300 mb-5">
        Your secret number is locked in! Waiting for Host to start the match.
      </p>

      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 mb-4 text-left">
        <div class="flex items-center justify-between mb-2 text-xs font-bold text-slate-400">
          <span>Players in Room</span>
          <span class="text-emerald-400">${s.length} / ${n}</span>
        </div>
        <div class="space-y-1.5">
          ${r}
        </div>
      </div>

      <div class="text-xs text-slate-500">
        The match will begin automatically on this screen when the Host clicks Start!
      </div>
    </div>
  `}function de(t){const e=t.players[t.currentPlayerIndex]||{name:"Player"},s=t.players.filter(d=>d.active),n=t.maxNumber,r=t.guessedNumbers,o=t.trackerTab||"grid",i=t.isHost&&e.isHost||!t.isHost&&e.networkId===t.myPlayerId;let a="";t.players.forEach(d=>{const c=d.id===e.id,y=t.isHost&&d.isHost||!t.isHost&&d.networkId===t.myPlayerId;d.active?a+=`
        <div class="flex items-center justify-between p-2 rounded-xl text-xs transition ${c?"bg-blue-950/70 border border-blue-500 text-white font-bold":"bg-slate-900 border border-slate-800 text-slate-200"}">
          <div class="flex items-center gap-2 truncate">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="truncate">${w(d.name)}</span>
            ${y?'<span class="text-[9px] text-blue-300 bg-blue-950 px-1 rounded border border-blue-800">You</span>':""}
            ${c?'<span class="text-[9px] text-blue-400 bg-blue-950 px-1 py-0.2 rounded font-bold uppercase">Turn</span>':""}
          </div>
          <span class="text-emerald-400 font-bold text-[11px] shrink-0">● Active</span>
        </div>
      `:a+=`
        <div class="flex items-center justify-between p-2 rounded-xl text-xs bg-red-950/70 border border-red-600/90 text-red-300 font-bold transition">
          <div class="flex items-center gap-2 truncate line-through opacity-85">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
            <span class="truncate">${w(d.name)}</span>
            ${y?'<span class="text-[9px] text-red-400 bg-red-950 px-1 rounded border border-red-800 no-underline">You</span>':""}
          </div>
          <span class="text-red-400 font-black text-[11px] shrink-0 uppercase tracking-wider">✕ Eliminated</span>
        </div>
      `});let f="";for(let d=1;d<=n;d++)if(r.includes(d)){const y=t.historyLog.find(O=>O.guessedNumber===d),T=y&&y.eliminatedNames&&y.eliminatedNames.length>0;f+=`
        <button
          type="button"
          disabled
          title="Number ${d} was guessed in Round ${y?y.round:"?"}${T?" (Eliminated player!)":""}"
          class="aspect-square flex flex-col items-center justify-center rounded-lg font-mono font-bold text-xs border ${T?"bg-red-950/80 border-red-600 text-red-300 line-through":"bg-slate-950 border-slate-800 text-slate-600 line-through"} cursor-not-allowed"
        >
          <span>${d}</span>
          <span class="text-[8px] no-underline font-sans">${T?"💥":"✕"}</span>
        </button>
      `}else f+=`
        <button
          type="button"
          data-number="${d}"
          ${i?"":"disabled"}
          class="btn-pick-number aspect-square flex items-center justify-center rounded-lg font-mono font-bold text-xs bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-800 hover:border-blue-400 transition ${i?"cursor-pointer active:scale-95":"cursor-default opacity-80"}"
        >
          ${d}
        </button>
      `;let h="";t.historyLog.length===0?h='<div class="text-xs text-slate-500 italic text-center py-5">No guesses made yet.</div>':h=t.historyLog.map(d=>{const c=d.eliminatedNames&&d.eliminatedNames.length>0;return`
          <div class="p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${c?"bg-red-950/50 border-red-700/80 text-red-200 font-semibold":"bg-slate-900 border-slate-800 text-slate-300"}">
            <div class="flex items-center gap-1.5 truncate">
              <span class="font-bold text-blue-400">R${d.round}:</span>
              <span class="font-bold text-white">${w(d.guesser)}</span>
              <span>guessed</span>
              <span class="font-mono font-bold px-1.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">${d.guessedNumber}</span>
            </div>
            <div class="shrink-0 font-bold ${c?"text-red-400":"text-slate-500"}">
              ${c?`💥 Eliminated ${d.eliminatedNames.map(w).join(", ")}`:"Miss"}
            </div>
          </div>
        `}).join("");const g=t.lastGuessResult;let S="";if(g){const d=g.eliminated&&g.eliminated.length>0,c=d?g.eliminated.map(y=>y.name).join(", "):"";S=`
      <div class="mb-3 p-3 rounded-xl border ${d?"bg-red-950/80 border-red-600 text-red-200":"bg-slate-900 border-slate-800 text-slate-200"} flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">${d?"💥":"🎯"}</span>
          <div class="text-xs">
            <span class="font-bold text-white">${w(g.guesser?g.guesser.name:"Player")}</span>
            <span>guessed number</span>
            <strong class="font-mono text-sm px-1.5 py-0.5 rounded bg-slate-950 ${d?"text-red-400 border border-red-700":"text-blue-400 border border-slate-800"}">${g.guessedNumber}</strong>
          </div>
        </div>
        <div class="text-xs font-bold text-right ${d?"text-red-400":"text-slate-400"}">
          ${d?`✕ ${w(c)} ELIMINATED!`:"No eliminations"}
        </div>
      </div>
    `}const v=n-r.length;return`
    <div class="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-5xl mx-auto w-full">
      <!-- Left Column: Current Turn & Guess Input (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-3">
        <div class="game-card p-5 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800 text-xs">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-300">
                Round ${t.round}
              </span>
              <span class="text-slate-400">
                Range: <strong class="text-emerald-400 font-mono">1–${n}</strong>
              </span>
            </div>
            <span class="text-slate-400">
              Turn <strong class="text-white">#${t.turnCount+1}</strong>
            </span>
          </div>

          <div class="text-center mb-4">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
              ${i?"Your Turn":"Active Turn"}
            </span>
            <h2 class="text-xl sm:text-2xl font-bold text-white font-display">
              ${w(e.name)}
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              ${i?"Enter or tap any number on the board to guess":`Waiting for ${w(e.name)} to guess...`}
            </p>
          </div>

          ${i?`
                <form id="form-make-guess" class="space-y-3">
                  <div>
                    <label for="guess-number-input" class="sr-only">Enter Guess</label>
                    <input
                      type="number"
                      id="guess-number-input"
                      min="1"
                      max="${n}"
                      step="1"
                      required
                      autofocus
                      placeholder="e.g. 17"
                      class="w-full text-center text-3xl font-bold py-2.5 bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-blue-500 outline-none"
                    />
                    <div id="guess-validation-error" class="hidden mt-2 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800 p-2 rounded-lg text-center"></div>
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-guess"
                    class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer"
                  >
                    Submit Guess 🎯
                  </button>
                </form>
              `:`
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                  <div class="text-2xl mb-1">⏳</div>
                  <p class="text-xs font-bold text-slate-300">
                    Waiting for ${w(e.name)}'s guess...
                  </p>
                  <p class="text-[11px] text-slate-500 mt-1">
                    The board will update immediately when they submit.
                  </p>
                </div>
              `}
        </div>

        <!-- Player Status List (Showing Eliminated Players in Red) -->
        <div class="game-card p-4 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between mb-2 text-xs font-bold">
            <span class="uppercase tracking-wider text-slate-400">Players Status</span>
            <span class="text-emerald-400">${s.length} / ${t.players.length} Active</span>
          </div>
          <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            ${a}
          </div>
        </div>
      </div>

      <!-- Right Column: Number Keeping Box & Tracker (7 cols) -->
      <div class="lg:col-span-7 game-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
        <div>
          <!-- Live Guess Status Banner on top of Number Keeping Box -->
          ${S}

          <!-- Tracker Header & Tabs -->
          <div class="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800 text-xs">
            <div>
              <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                Number Board (${v} Available, ${r.length} Guessed)
              </h3>
            </div>

            <!-- Tab Buttons -->
            <div class="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 font-semibold">
              <button
                id="btn-tab-grid"
                class="px-2.5 py-1 rounded transition cursor-pointer ${o==="grid"?"bg-blue-600 text-white font-bold":"text-slate-400 hover:text-slate-200"}"
              >
                🔢 Grid
              </button>
              <button
                id="btn-tab-history"
                class="px-2.5 py-1 rounded transition cursor-pointer ${o==="history"?"bg-blue-600 text-white font-bold":"text-slate-400 hover:text-slate-200"}"
              >
                📜 History (${t.historyLog.length})
              </button>
            </div>
          </div>

          <!-- Tab Content 1: Number Grid -->
          <div id="tracker-grid-view" class="${o==="grid"?"":"hidden"}">
            <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-72 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-900">
              ${f}
            </div>
          </div>

          <!-- Tab Content 2: History Log -->
          <div id="tracker-history-view" class="${o==="history"?"":"hidden"}">
            <div class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              ${h}
            </div>
          </div>
        </div>

        <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Guessed List:</span>
          <span class="font-mono text-cyan-300 font-bold truncate max-w-[280px]">
            ${r.length>0?[...r].sort((d,c)=>d-c).join(", "):"None yet"}
          </span>
        </div>
      </div>
    </div>
  `}function ce(t){const e=t.winner||{name:"Player"},s=t.round,n=t.stats.totalGuesses,r=t.players.length;return`
    <div class="animate-scale-in max-w-md mx-auto w-full game-card p-6 rounded-2xl border border-blue-600/70 text-center">
      <div class="w-16 h-16 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
        🏆
      </div>

      <span class="text-xs font-bold tracking-widest text-amber-400 uppercase block mb-1">
        WINNER!
      </span>

      <h2 class="text-3xl font-black text-white font-display mb-1">
        ${w(e.name)}
      </h2>

      <p class="text-xs text-slate-300 mb-5">
        Last Player Standing!
      </p>

      <div class="grid grid-cols-3 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800 mb-5 text-center">
        <div>
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Players</span>
          <strong class="text-sm font-bold text-white">${r}</strong>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Rounds</span>
          <strong class="text-sm font-bold text-blue-400">${s}</strong>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Guesses</span>
          <strong class="text-sm font-bold text-emerald-400">${n}</strong>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2.5">
        <button id="btn-play-again" class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition cursor-pointer">
          Play Again 🔄
        </button>
        <button id="btn-winner-home" class="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer">
          Home
        </button>
      </div>
    </div>
  `}function ue(t){const e=m.getInviteLink(),s=t.copiedInviteToast;return`
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm modal-overlay">
      <div class="game-card p-6 rounded-2xl max-w-md w-full border border-slate-800 modal-content">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔗</span>
            <h3 class="text-base font-bold text-white font-display">Invite Players</h3>
          </div>
          <button id="btn-close-invite" aria-label="Close Modal" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition cursor-pointer">
            ✕
          </button>
        </div>

        <p class="text-xs text-slate-300 mb-4 leading-relaxed">
          Share this direct link with other players. When they open it, it opens directly in the room to enter their name & number:
        </p>

        <!-- Room Summary -->
        <div class="bg-slate-900 p-3 rounded-xl border border-slate-800 mb-4 text-xs text-slate-300 flex items-center justify-between">
          <div>
            <span>Room Code: </span>
            <strong class="text-blue-400 font-mono font-bold">${t.roomCode||"LNS-GAME"}</strong>
          </div>
          <span class="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            ${t.playerCount} Players (1–${t.maxNumber})
          </span>
        </div>

        <!-- Link Box -->
        <div class="relative mb-4">
          <label for="invite-link-input" class="sr-only">Game Invite Link</label>
          <input
            type="text"
            id="invite-link-input"
            readonly
            value="${w(e)}"
            class="w-full text-xs font-mono p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 pr-24 select-all outline-none"
          />
          <button
            id="btn-copy-invite-link"
            class="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg font-bold text-xs transition cursor-pointer ${s?"bg-emerald-600 text-white":"bg-blue-600 hover:bg-blue-500 text-white"}"
          >
            ${s?"✓ Copied!":"Copy"}
          </button>
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <button
            id="btn-share-native"
            class="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>📱</span> Share on WhatsApp / Mobile
          </button>
          <button
            id="btn-close-invite-btn"
            class="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>

        ${s?'<p class="text-xs text-emerald-400 text-center font-bold mt-2.5">Link copied to clipboard!</p>':""}
      </div>
    </div>
  `}function me(){return`
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm modal-overlay">
      <div class="game-card p-6 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-800 modal-content">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-xl">📖</span>
            <h3 class="text-base font-bold text-white font-display">How to Play</h3>
          </div>
          <button id="btn-close-rules" aria-label="Close Rules" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition cursor-pointer">
            ✕
          </button>
        </div>

        <div class="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <strong class="text-blue-400 block mb-1">1. Host Creates Room</strong>
            <p>Host sets player count (2–10) and custom secret number limit (e.g. 1 to 50).</p>
          </div>

          <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <strong class="text-blue-400 block mb-1">2. Players Join via Invite Link</strong>
            <p>Each player opens the link, enters their name, and privately picks their secret number on their phone.</p>
          </div>

          <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <strong class="text-blue-400 block mb-1">3. Turns & Elimination</strong>
            <p>Players take turns guessing numbers on their screen. If anyone has that secret number, they are instantly eliminated and marked in red!</p>
          </div>

          <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <strong class="text-amber-400 block mb-1">⚠️ Special Rules</strong>
            <ul class="list-disc list-inside space-y-1">
              <li>You cannot guess your own secret number.</li>
              <li>Previously guessed numbers cannot be guessed again.</li>
              <li>Duplicate secret numbers are allowed (both eliminated if guessed!).</li>
            </ul>
          </div>
        </div>

        <button id="btn-close-rules-bottom" class="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer">
          Got it!
        </button>
      </div>
    </div>
  `}function be(t,e){const s=t.querySelector("#nav-brand-btn");s&&s.addEventListener("click",()=>m.goToHome());const n=t.querySelector("#btn-toggle-sound");n&&n.addEventListener("click",()=>{const u=b.toggleSound();n.textContent=u?"🔊":"🔇"});const r=t.querySelector("#btn-open-invite");r&&r.addEventListener("click",()=>m.toggleInviteModal(!0));const o=t.querySelector("#btn-lobby-invite");o&&o.addEventListener("click",()=>m.toggleInviteModal(!0));const i=t.querySelector("#btn-close-invite");i&&i.addEventListener("click",()=>m.toggleInviteModal(!1));const a=t.querySelector("#btn-close-invite-btn");a&&a.addEventListener("click",()=>m.toggleInviteModal(!1));const f=t.querySelector("#btn-copy-invite-link");f&&f.addEventListener("click",()=>m.copyInviteLink());const h=t.querySelector("#btn-share-native");h&&h.addEventListener("click",()=>m.shareInvite());const g=t.querySelector("#btn-open-rules");g&&g.addEventListener("click",()=>m.toggleRules(!0));const S=t.querySelector("#btn-close-rules");S&&S.addEventListener("click",()=>m.toggleRules(!1));const v=t.querySelector("#btn-close-rules-bottom");v&&v.addEventListener("click",()=>m.toggleRules(!1));const d=t.querySelector("#btn-home-create-room");d&&d.addEventListener("click",()=>m.openHostRoomSetup());const c=t.querySelector("#btn-home-join-code");c&&c.addEventListener("click",()=>{const u=t.querySelector("#home-join-code-input");u&&u.value.trim()&&m.openJoinRoomSetup(u.value.trim())});const y=t.querySelector("#btn-home-rules");y&&y.addEventListener("click",()=>m.toggleRules(!0)),t.querySelectorAll(".btn-select-player-count").forEach(u=>{u.addEventListener("click",()=>{const p=u.getAttribute("data-count");m.setPlayerCount(p)})}),t.querySelectorAll(".btn-select-limit-preset").forEach(u=>{u.addEventListener("click",()=>{const p=u.getAttribute("data-limit");m.setMaxNumber(p)})});const B=t.querySelector("#host-max-number-input");B&&B.addEventListener("input",u=>{const p=parseInt(u.target.value,10);if(!isNaN(p)&&p>=10){m.setMaxNumber(p);const C=t.querySelector("#host-secret-range-hint");C&&(C.textContent=`Valid: 1–${p}`);const k=t.querySelector("#host-secret-input");k&&(k.max=p)}});const G=t.querySelector("#form-host-setup");G&&G.addEventListener("submit",u=>{u.preventDefault();const p=t.querySelector("#host-name-input").value,C=t.querySelector("#host-secret-input").value,k=t.querySelector("#host-max-number-input").value,N=t.querySelector("#host-secret-error"),P=m.submitHostRoom(p,C,e.playerCount,k);!P.valid&&N&&(N.textContent=P.error,N.classList.remove("hidden"))});const L=t.querySelector("#join-room-code-input");if(L){const u=()=>{const p=L.value.trim().toUpperCase();p.length>=3&&I.queryRoomInfo(p)};L.addEventListener("blur",u),L.addEventListener("change",u)}const H=t.querySelector("#form-join-setup");H&&H.addEventListener("submit",u=>{u.preventDefault();const p=t.querySelector("#join-room-code-input").value,C=t.querySelector("#join-player-name-input").value,k=t.querySelector("#join-secret-input").value,N=t.querySelector("#join-validation-error"),P=m.submitJoinRoom(p,C,k);!P.valid&&N&&(N.textContent=P.error,N.classList.remove("hidden"))});const _=t.querySelector("#btn-host-start-match");_&&_.addEventListener("click",()=>{m.hostStartRoomMatch()});const A=t.querySelector("#btn-tab-grid");A&&A.addEventListener("click",()=>m.setTrackerTab("grid"));const j=t.querySelector("#btn-tab-history");j&&j.addEventListener("click",()=>m.setTrackerTab("history")),t.querySelectorAll(".btn-pick-number").forEach(u=>{u.addEventListener("click",()=>{const p=u.getAttribute("data-number"),C=t.querySelector("#guess-number-input");C&&p&&(b.playClick(),C.value=p,C.focus())})});const q=t.querySelector("#form-make-guess");if(q){const u=t.querySelector("#guess-number-input"),p=t.querySelector("#guess-validation-error");q.addEventListener("submit",C=>{C.preventDefault();const k=u.value,N=m.submitGuess(k);!N.valid&&p&&(p.textContent=N.error,p.classList.remove("hidden"))}),u&&u.addEventListener("input",()=>{p&&p.classList.add("hidden")})}const U=t.querySelector("#btn-play-again");U&&U.addEventListener("click",()=>{m.playAgain()});const Y=t.querySelector("#btn-winner-home");Y&&Y.addEventListener("click",()=>{m.goToHome()})}document.addEventListener("DOMContentLoaded",()=>{m.loadFromUrlParams(),re()});
