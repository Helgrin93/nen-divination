import {smooth} from './divinationTimeline.js';

// Measured in the original 1000 x 680 liquid crop. The painted waterline is
// at y=115 (front edge y=149), below the fixed glass lip centred at y=89.
// Erasing only the old y=105 +/- 29 cap left that front waterline untouched.
export function createRisingWater({original,base}){
 const material=Object.assign(document.createElement('canvas'),{width:320,height:112});
 const mc=material.getContext('2d');
 // Use the submerged transmitted colour and vertical reflections, sampled
 // below the baked waterline. No generated glass or opaque flat fill.
 mc.drawImage(base,340,154,320,60,0,0,320,112);
 const bowl=new Path2D('M342 86 C340 25 656 25 657 86 C672 225 640 374 521 400 L479 400 C370 374 334 231 342 86 Z');
 const rim=new Path2D();rim.ellipse(500,89,157,46,0,0,Math.PI*2);rim.ellipse(500,89,146,38,0,0,Math.PI*2);
 const sides=new Path2D('M349 144 L398 144 C391 231 416 321 454 344 L435 337 C385 307 350 217 349 144 Z M612 144 L650 144 C649 225 610 312 566 341 L554 345 C599 295 616 216 612 144 Z');
 return function draw(ctx,p){
  const rise=smooth((p-.08)/.22),convex=smooth((p-.30)/.10);
  const delta=26*rise+2*convex,cy=115-delta,rx=155-9*rise,ry=34+4*rise;
  ctx.save();ctx.clip(bowl);
  // Replace the complete OLD liquid surface, including the baked front line,
  // and the newly filled air gap before drawing the single moving surface.
  const replacement=new Path2D();replacement.ellipse(500,115,158,37,0,0,Math.PI*2);replacement.ellipse(500,cy,rx+1,ry+1,0,0,Math.PI*2);
  ctx.save();ctx.clip(replacement);ctx.globalAlpha=smooth(rise/.08);ctx.drawImage(material,340,40);ctx.restore();
  ctx.save();ctx.beginPath();ctx.ellipse(500,cy,rx,ry,0,0,Math.PI*2);ctx.clip();
  ctx.drawImage(base,345,81,310,68,500-rx,cy-ry,rx*2,ry*2);ctx.restore();
  ctx.strokeStyle='rgba(240,242,231,.42)';ctx.lineWidth=1.05;
  ctx.beginPath();ctx.ellipse(500,cy,rx-1,ry-.7,0,0,Math.PI*2);ctx.stroke();
  ctx.restore();
  // Fixed glass stays in front; side highlights below the old waterline keep
  // their original pixels. Never restore the old liquid surface with them.
  ctx.save();ctx.clip(sides);ctx.drawImage(original,0,0);ctx.restore();
  return {surfaceY:cy,leafY:105-delta,rise,convex,restoreRim(){ctx.save();ctx.clip(rim,'evenodd');ctx.drawImage(original,0,0);ctx.restore();}};
 };
}
