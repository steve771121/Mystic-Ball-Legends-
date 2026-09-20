export const CHARACTERS = {
 bear: {name:'皮皮熊',en:'PIPI BEAR',title:'彈性伸長',role:'反彈支援',color:'#ffa7bd',icon:'🐻',desc:'5 秒內在指定半徑伸展身體，幫你反彈幻球。'},
 duck: {name:'吸吸鴨',en:'SIP SIP DUCK',title:'吸力定球',role:'控球高手',color:'#ffe58b',icon:'🐤',desc:'5 秒內吸引並固定附近幻球，等你推盤撞擊射門。'},
 cat: {name:'跳跳貓',en:'HOP HOP CAT',title:'跳躍防線',role:'敏捷防守',color:'#b6adff',icon:'🐱',desc:'5 秒內在我方後半場左右跳動，攔截來球。'}
};
export const ARENAS = {
 classic:{name:'經典競技場',en:'CLASSIC',desc:'標準球速・純粹對決',color:'#8ddfd0',surface:0x184e53,drag:.11,max:22},
 space:{name:'星際漫遊',en:'SPACE',desc:'黑洞傳送・低阻力滑行',color:'#a0aaff',surface:0x292452,drag:.025,max:24},
 ice:{name:'極光冰原',en:'GLACIER',desc:'冰面加速・快速攻防',color:'#a4e5ff',surface:0x508797,drag:.015,max:28},
 desert:{name:'流沙神殿',en:'DESERT',desc:'流沙減速・路線博弈',color:'#efc586',surface:0x806044,drag:.13,max:22},
 wind:{name:'魔風谷',en:'WIND VALLEY',desc:'變向氣流・預判反擊',color:'#c5e9a1',surface:0x416754,drag:.08,max:24}
};
export const W=10,H=16,CORNER_RADIUS=1.45,GOAL=3.4,STEP=1/240,COOLDOWN=14;
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function legalSkill(x,z,side){return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=3.8 && z*side>=1.2 && z*side<=5.3 && Math.hypot(x,z-side*8)>2.7;}

export const MALLET_SCALE=1.06;
export const MALLET_RADIUS=.62*MALLET_SCALE;
