/*!
 * JavaScript Packify - v0.1pre - 8/22/2010
 * http://benalman.com/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

function packify( input ) {
  var len,
    i,
    chunk,
    chunk_size,
    re,
    matches,
    
    potential,
    potentials = {},
    potentials_arr = [],
    
    replace_map = [],
    char_code,
    char,
    output;
  
  // Single quotes need to be escaped, so use double-quotes in the input.
  input = input.replace( /'/g, "\\'" );
  
  // Replace any non-space whitespace with spaces.
  input = input.replace( /\s+/g, ' ' );
  
  // Look for recurring patterns between 2 and 20 characters in length.
  for ( chunk_size = 2, len = input.length; chunk_size <= 20; chunk_size++ ) {
    
    // Go from the beginning to the end of the input string.
    for ( i = 0; i < len - chunk_size; i++ ) {
      
      // Grab the "chunk" at the current position.
      chunk = input.substr( i, chunk_size );
      
      // Find all chunk matches in the input string.
      re = RegExp( chunk.replace( /(\W)/g, '\\$1' ), 'g' );
      matches = input.match( re ) || [];
      
      // If 2+ matches, save this chunk as a potential pattern. By using an
      // object instead of an array, we don't have to worry about uniquing
      // the array.
      if ( matches.length > 1 ) {
        potentials[ chunk ] = matches.length;
      }
    }
  }
  
  // Since we need to sort the potentials, create an array.
  for ( i in potentials ) {
    potentials_arr.push({ pattern: i, count: potentials[ i ] });
  }
  
  // Sort the array of potentials such that replacements with the highest byte
  // savings come first.
  potentials_arr.sort(function(a,b){
    return b.count * ( b.pattern.length - 1 ) - a.count * ( a.pattern.length - 1 );
  });
  
  char_code = 0;
  
  // Loop over all the potential patterns (unless we run out of replacement chars).
  for ( i = 0, len = potentials_arr.length; i < len && char_code < 31; i++ ) {
    potential = potentials_arr[i];
    
    // Ensure this potential pattern still actually matches something in the
    // input string.
    re = RegExp( potential.pattern.replace( /(\W)/g, '\\$1' ), 'g' );
    if ( re.test( input ) ) {
      
      // Increment the current replacement character (skipping ASCII 10 and 13).
      char_code = ++char_code == 10 ? 11 : char_code == 13 ? 14 : char_code; //char_code == 32 ? 128 : char_code;
      
      // Get the replacement char.
      char = String.fromCharCode( char_code );
      
      console.log( i, char_code, char, potential.count, potential.pattern );
      
      // Add the char + pattern combo into the map of replacements.
      replace_map.push( char + potential.pattern );
      
      // Replace the pattern with the replacement character.
      input = input.replace( re, char );
    }
  }
  
  // To be explained later...
  output = "(function(a){'" + replace_map.join('') + "'.replace(/.([\x20-\x7F]+)/g,function(x,y){a=a.replace(RegExp(x[0],'g'),y)});eval(a)})('" + input + "')";
  
  console.log( 'length', output.length );
  
  return output;
};


// Organ1k:

//packify('(function(J){var A,v,F,D,q,n,G=J.body.style,f=J.getElementById("c"),d=f.getContext("2d"),p=32,I=360,e=Math,B=e.min,b=e.sin,c=e.cos,l=e.random,z=e.PI*2,o=z/I,t=0,a=0,C=0,k=0,h=G.margin=0,H=2,s=2,r=3,E=6,g=p,u=[],i=[],m="f001fa01ff0107010ff100f14081e8e".split(1),j=l(G.overflow="hidden")*I,w=l(onmousemove=function(x){g=0;q=x.clientX-F;n=x.clientY-D})<.5?1:-1;setInterval(function(L,x,K,y,M){if(!(++t%p)){while(k==~~(y=l(M=l())*6));k=~~y;y<.4?w=-w:y<2?h++:y<3?C=M*7:y<4?H=M*8+1:y<5?s=M*3+1:r=B(E=M*8+4,l()*5+5)-2}A=f.width=innerWidth;v=f.height=innerHeight;L=B(F=A/2,D=v/2);x=L/I;L-=20*x;if(++g>p){if(C<1){j-=H*w*4;q=b(j*o)*L;n=c(j*o)*L}else{j-=H*w*2;y=e.abs(q=b(j*o)*L);q=y*c(M=e.atan2(0,q)+j*o/C);n=y*b(M)}}for(K=0;K<p;){y=u[K]=u[K]||{x:0,y:0};M=u[K-1];y.x=K?y.x+(M.x-y.x)/s:q;y.y=K++?y.y+(M.y-y.y)/s:n}for(K=0;y=u[K*4];){i[a++%I]={s:1,d:1,c:m[(h+K++)%8],x:y.x,y:y.y}}d.fillRect(K=0,0,A,v);while(y=i[K++]){M=y.s+=y.d;y.d=M>E?-1:M<r?1:y.d;d.beginPath(d.fillStyle="#"+y.c);d.fill(d.arc(F+y.x,D+y.y,M*x,0,z,0))}},p)})(document)')

// getify's JS1k entry:

//packify('j=document;e=Math;k=j.body;k.innerHTML="<p>Don\'t idle...or else!</p>"+k.innerHTML;o=0;w=e.random;l=j.getElementById("c");z=l.style;A=l.getContext("2d");B=[];m=[0,0];g=0;function h(C,G){return(w()*(G-C)+C)<<0}function D(){with(A){clearRect(0,0,u,v);for(t=2;t;){r=0xffffff&m[--t]<<4|h(4,14);for(i=5;i;){with((f=B[t])[--i]){s=h(4,8);x=e.min(U,e.max(0,x+a*b));y=e.min(V,e.max(0,y+c*d));if(x<=0||x>=U){a*=-1;b=s;m[t]=r}if(y<=0||y>=V){c*=-1;d=s;m[t]=r}}}beginPath();lineWidth=8;strokeStyle="#"+m[t].toString(16);moveTo((n=f[0]).x,n.y);for(i=5;i;){lineTo((n=f[--i]).x,n.y)}stroke();closePath()}}g||(g=setInterval(D,20))}function E(){clearTimeout(o);if(g){clearInterval(g);A.clearRect(g=0,0,u,v)}o=setTimeout(D,3E3)}function F(){U=(u=l.width=innerWidth)-1;V=(v=l.height=innerHeight)-1}with(k.style){margin="0";background="#000";color="#fff"}F();z.position="absolute";z.top="0";for(t=2;t;){f=B[--t]=[];for(i=5;i;){p=(1&((w()*9)<<0))?1:-1;q=h(4,8);f[--i]={x:h(1,U),y:h(1,V),a:p,c:p,b:q,d:q}}}E();j.onmousemove=j.onkeydown=E;onresize=F')
