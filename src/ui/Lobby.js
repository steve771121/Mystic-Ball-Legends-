import {CHARACTERS,ARENAS} from '../config/game.js?v=0.7.1';
export function renderLobby(container,info,{pics,onCharacter,onArena,onReady,onLeave}){
 const me=info.host?0:1,chosen=info.characters[me];
 container.innerHTML=`<div class="eyebrow">${info.round?'NEXT MATCH':'FRIENDS LOBBY'}</div><h2>${info.round?'再來一局':info.connected?'對手已抵達':'等待另一位傳奇'}</h2>
 <div class="lobby-code">房間 <b id="code-display"></b></div>
 <div class="lobby-players">${info.characters.map((id,i)=>`<div><img src="${pics[id]}" alt="${CHARACTERS[id].name}"><b>${i===1&&!info.connected?'等待玩家…':CHARACTERS[id].name}</b><small>${i===me?'你 · ':''}${info.ready[i]?'已準備':'等待準備'}</small></div>`).join('')}</div>
 <label>選擇你的夥伴</label><div class="lobby-characters">${Object.entries(CHARACTERS).map(([id,c])=>`<button data-lobby-character="${id}" aria-pressed="${chosen===id}" ${info.pendingSelection?'disabled':''}><img src="${pics[id]}" alt=""><b>${c.name}</b><small>${c.title}</small></button>`).join('')}</div>
 <label>選擇競技場${info.host?'':' · 由建立房間的玩家選擇'}</label><div class="lobby-arenas">${Object.entries(ARENAS).map(([id,a])=>`<button data-lobby-arena="${id}" aria-pressed="${info.config.arena===id}" ${info.host?'':'disabled'}><i style="background:${a.color}"></i>${a.name}</button>`).join('')}</div>
 <p class="lobby-note">選擇夥伴與競技場，再點準備好了。<br>${ARENAS[info.config.arena].name} · 先得 ${info.config.target} 分 · 技能${info.config.skills?'開啟':'關閉'}</p>
 <button id="ready" class="primary" ${!info.connected||info.ready[me]||info.pendingSelection?'disabled':''}>${info.pendingSelection?'正在同步…':info.ready[me]?'等待對方準備':'準備好了'}</button><button id="cancel-room" class="secondary">回首頁</button>`;
 container.querySelector('#code-display').textContent=info.code;
 container.querySelectorAll('[data-lobby-character]').forEach(b=>b.onclick=()=>onCharacter(b.dataset.lobbyCharacter));
 container.querySelectorAll('[data-lobby-arena]').forEach(b=>b.onclick=()=>onArena(b.dataset.lobbyArena));
 container.querySelector('#ready').onclick=onReady;container.querySelector('#cancel-room').onclick=onLeave;
}
