// Add only audio you may redistribute publicly. Vite includes existing files;
// an absent track stays null and never creates an HTTP request.
const files=import.meta.glob('../assets/audio/*.{mp3,m4a,ogg,wav}',{eager:true,query:'?url',import:'default'});
const track=(name)=>Object.entries(files).find(([path])=>path.split('/').pop().replace(/\.[^.]+$/,'')===name)?.[1]??null;
export const musicTracks={
 intro:{src:track('intro-quiz'),loop:true},
 divination:{src:track('divination'),loop:true},
 result:{src:track('result'),loop:true},
};
export const musicSettings={volume:.22,fadeMs:280};
