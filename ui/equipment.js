/* Equipment metadata only: availability never certifies that a support is safe. */
const LadderEquipment=(()=>{
 'use strict';
 const VERSION=1;
 const CAPABILITIES=Object.freeze({
  floor:'Floor space',wall:'Wall',chair:'Stable chair',bar:'Pull-up bar',weights:'A suitable hand-held weight',
  counter:'Stable counter',bench:'Stable exercise bench',dipBars:'Dip bars',straightDipBar:'Straight bar suitable for dips',twoChairs:'Two stable chairs suitable for support holds',
  lowBar:'Low bar suitable for rows and jumping pull-ups',doorway:'Door frame suitable for supporting a row',table:'Sturdy table suitable for bodyweight rows',balanceSupport:'Secure hand support for assisted squats',
  anchor:'Secure Nordic curl foot anchor',band:'Suitable resistance band',post:'Secure post for a resistance band',
  towel:'Towel',pairWeights:'Two suitable hand-held weights',heavyBag:'Heavy bag suitable for carrying',
  pinchLoad:'Heavy books or plates suitable for a pinch grip',swingLoad:'Kettlebell or jug suitable for swings',mat:'Exercise mat',step:'Stable step'
 });
 const BASE=Object.freeze({floor:true,wall:true,chair:true});
 const group=(description,...anyOf)=>({description,anyOf});
 // These strings are the complete current TRACKS step[6] vocabulary. Do not
 // interpret arbitrary text as "None", or infer specialist supports from home furniture.
 const GEAR={
  'none':[],
  'wall':[group('Wall','wall')],
  'chair':[group('Stable chair','chair')],
  'counter':[group('Stable counter','counter')],
  'bench':[group('Stable exercise bench','bench')],
  'dip bars':[group('Dip bars','dipBars')],
  'dip bars or 2 chairs':[group('Dip bars or two suitable stable chairs','dipBars','twoChairs')],
  'bar':[group('Pull-up bar','bar')],
  // Explicit app-level refinement of the ambiguous "Bar" on straight-bar dips.
  'straight dip bar':[group('Straight bar suitable for dips','straightDipBar')],
  'low bar':[group('Low bar suitable for this movement','lowBar')],
  'doorway':[group('Door frame suitable for a bodyweight row','doorway')],
  'table':[group('Sturdy table suitable for bodyweight rows','table')],
  'table + chair':[group('Sturdy table suitable for bodyweight rows','table'),group('Stable chair','chair')],
  'anchor':[group('Secure Nordic curl foot anchor','anchor')],
  'band + post':[group('Suitable resistance band','band'),group('Secure resistance-band post','post')],
  'towel':[group('Towel','towel')],
  'jug or bag':[group('A suitable hand-held load such as a jug or bag','weights')],
  '2 jugs':[group('Two suitable hand-held loads','pairWeights')],
  'heavy bag':[group('Heavy bag suitable for carrying','heavyBag')],
  'heavy books or plates':[group('Heavy books or plates suitable for a pinch grip','pinchLoad')],
  'kettlebell or jug':[group('Kettlebell or jug suitable for swings','swingLoad')],
  'mat':[group('Exercise mat','mat')],
  'step':[group('Stable step','step')]
 };
 const status=value=>value===true?true:value===false?false:null;
 function normalize(source){
  const input=source&&typeof source==='object'&&!Array.isArray(source)?source:{};
  return Object.fromEntries(Object.keys(CAPABILITIES).map(key=>[key,
   Object.prototype.hasOwnProperty.call(input,key)?status(input[key]):BASE[key]??null]));
 }
 function requirements(gear,{stepName}={}){
  const text=typeof gear==='string'?gear.trim():'';
  let key=text.toLowerCase().replace(/\s+/g,' ');
  const name=String(stepName||'').trim().toLowerCase();
  if(key==='bar'&&name==='straight bar dip')key='straight dip bar';
  const known=Object.prototype.hasOwnProperty.call(GEAR,key);
  const groups=[group('Floor space for the exercise','floor'),...(known?GEAR[key].map(g=>({description:g.description,anyOf:g.anyOf.slice()})):[])];
  // Actual TRACKS cues refine gear fields that currently say only "None".
  // A wall or balancing support cannot be silently assumed after an explicit denial.
  if(key==='none'&&name==='wall push-up')groups.push(group('Wall','wall'));
  if(key==='none'&&['assisted squat','assisted pistol squat'].includes(name))groups.push(group('Secure hand support for this assisted squat','balanceSupport'));
  if(key==='counter'&&name==='incline push-up')groups[1]=group('Stable counter or exercise bench','counter','bench');
  return {gear:text,known,groups,description:known?groups.map(g=>g.description).join(' and '):(text||'Equipment not specified')};
 }
 function check(gear,source,context){
  const caps=normalize(source),req=requirements(gear,context),missing=[],unknown=[],missingKeys=[],unknownKeys=[];
  if(!req.known)unknown.push(req.description);
  for(const g of req.groups){
   if(g.anyOf.some(k=>caps[k]===true))continue;
   const pending=g.anyOf.filter(k=>caps[k]===null);
   if(pending.length){unknown.push(g.description);unknownKeys.push(...pending);}
   else {missing.push(g.description);missingKeys.push(...g.anyOf);}
  }
  return {compatible:!missing.length&&!unknown.length,missing,unknown,
   missingKeys:[...new Set(missingKeys)],unknownKeys:[...new Set(unknownKeys)],requirements:req};
 }
 return {VERSION,CAPABILITIES,normalize,requirements,check};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=LadderEquipment;
