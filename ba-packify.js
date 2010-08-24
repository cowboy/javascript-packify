/*!
 * JavaScript Packify - v0.4 - 8/24/2010
 * http://benalman.com/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Currently tested in WebKit console, TODO: node.js version.

function packify( input ) {
  var script = input,
    len,
    i,
    chunk,
    chunk_size,
    re,
    matches,
    savings,
    
    potential,
    potentials = {},
    potentials_arr = [],
    
    map = '',
    char_code,
    char,
    output;
  
  // Single quotes need to be escaped, so use double-quotes in your input
  // source whenever possible.
  script = script.replace( /'/g, "\\'" );
  
  // Replace any non-space whitespace with spaces (shouldn't be necessary).
  script = script.replace( /\s+/g, ' ' );
  
  // Return number of chars saved by replacing `count` occurences of `string`.
  function get_savings( string, count ) {
    return ( string.length - 1 ) * ( count - 1 ) - 2;
  };
  
  // Just trying to keep things DRY here... Let's match some patterns!
  function get_re_match( pattern, text ) {
    var re = RegExp( pattern.replace( /(\W)/g, '\\$1' ), 'g' );
    return [
      text.match( re ) || [],
      re
    ];
  };
  
  // Look for recurring patterns between 2 and 20 characters in length (could
  // have been between 2 and len / 2, but that gets REALLY slow).
  for ( chunk_size = 2, len = script.length; chunk_size <= 20; chunk_size++ ) {
    
    // Start at the beginning of the input string, go to the end.
    for ( i = 0; i < len - chunk_size; i++ ) {
      
      // Grab the "chunk" at the current position.
      chunk = script.substr( i, chunk_size );
      
      if ( !potentials[ chunk ] ) {
        // Find the number of chunk matches in the input script.
        matches = get_re_match( chunk, script )[0];
        
        // If any matches, save this chunk as a potential pattern. By using an
        // object instead of an array, we don't have to worry about uniquing
        // the array as new potentials will just overwrite previous potentials.
        if ( get_savings( chunk, matches.length ) >= 0 ) {
          potentials[ chunk ] = matches.length;
        }
      }
    }
  }
  
  // Since we'll need to sort the potentials, create an array from the object.
  for ( i in potentials ) {
    potentials.hasOwnProperty( i ) 
      && potentials_arr.push({ pattern: i, count: potentials[ i ] });
  }
  
  // Potentials get sorted first by byte savings, then by # of occurrences
  // (favoring smaller count, longer patterns), then lexicographically.
  function sort_potentials( a, b ) {
    return get_savings( b.pattern, b.count ) - get_savings( a.pattern, a.count )
      || a.count - b.count
      || ( a.pattern < b.pattern ? -1 : a.pattern > b.pattern ? 1 : 0 );
  };
  
  // Loop over all the potential patterns, unless we run out of replacement
  // chars first. Dealing with 7-bit ASCII, valid replacement chars are 1-31
  // & 127 (excluding ASCII 10 & 13).
  for ( char_code = 0; potentials_arr.length && char_code < 127; ) {
    
    // Re-calculate match counts.
    for ( i = 0, len = potentials_arr.length; i < len; i++ ) {
      potential = potentials_arr[i];
      matches = get_re_match( potential.pattern, script )[0];
      potential.count = matches.length;
    }
    
    // Sort the array of potentials such that replacements that will yield the
    // highest byte savings come first.
    potentials_arr.sort( sort_potentials );
    
    // Get the current best potential replacement.
    potential = potentials_arr.shift();
    
    // Find all chunk matches in the input string.
    chunk = potential.pattern;
    matches = get_re_match( chunk, script );
    re = matches[1];
    matches = matches[0];
    
    // Ensure that replacing this potential pattern still actually saves bytes.
    savings = get_savings( chunk, matches.length );
    if ( savings >= 0 ) {
      
      // Increment the current replacement character.
      char_code = ++char_code == 10 ? 11
        : char_code == 13 ? 14
        : char_code == 32 ? 127
        : char_code;
      
      // Get the replacement char.
      char = String.fromCharCode( char_code );
      
      //console.log( char_code, char, matches.length, chunk, savings );
      
      // Replace the pattern with the replacement character.
      script = script.replace( re, char );
      
      // Add the char + pattern combo into the map of replacements.
      map += char + chunk;
    }
  }
  
  // For each group of 1 low ASCII char / 1+ regular ASCII chars combo in the
  // map string, replace the low ASCII char in the script string with the
  // remaining regular ASCII chars, then eval the script string. Using with in
  // this manner ensures that the temporary _ var won't be leaked.
  output = ""
    + "with({_:'" + script + "'})"
    +   "'" + map + "'.replace(/.([ -~]+)/g,function(x,y){"
    +     "_=_.replace(RegExp(x[0],'g'),y)"
    +   "}),"
    +   "eval(_)";
  
  if ( eval( output.replace( 'eval(_)', '_' ) ) === input ) {
    // If the output *actually* evals to the input string, packing was
    // successful. Log some useful stats and return the output.
    console.log( 'Success, ' + input.length + 'b -> ' + output.length
      + 'b (' + ( input.length - output.length ) + 'b or '
      + ( ~~( ( 1 - output.length / input.length ) * 10000 ) / 100 )
      + '% savings)' );
    
    return output;
    
  } else {
    // Otherwise, exit with an error.
    console.log( 'Error!' );
    return input;
  }
};

// Small test string:

//packify('console.log("I like that you like your hat!")');

// Organ1k:

//packify('(function(J){var A,v,F,D,q,n,G=J.body.style,f=J.getElementById("c"),d=f.getContext("2d"),p=32,I=360,e=Math,B=e.min,b=e.sin,c=e.cos,l=e.random,z=e.PI*2,o=z/I,t=0,a=0,C=0,k=0,h=G.margin=0,H=2,s=2,r=3,E=6,g=p,u=[],i=[],m="f001fa01ff0107010ff100f14081e8e".split(1),j=l(G.overflow="hidden")*I,w=l(onmousemove=function(x){g=0;q=x.clientX-F;n=x.clientY-D})<.5?1:-1;setInterval(function(L,x,K,y,M){if(!(++t%p)){while(k==~~(y=l(M=l())*6));k=~~y;y<.4?w=-w:y<2?h++:y<3?C=M*7:y<4?H=M*8+1:y<5?s=M*3+1:r=B(E=M*8+4,l()*5+5)-2}A=f.width=innerWidth;v=f.height=innerHeight;L=B(F=A/2,D=v/2);x=L/I;L-=20*x;if(++g>p){if(C<1){j-=H*w*4;q=b(j*o)*L;n=c(j*o)*L}else{j-=H*w*2;y=e.abs(q=b(j*o)*L);q=y*c(M=e.atan2(0,q)+j*o/C);n=y*b(M)}}for(K=0;K<p;){y=u[K]=u[K]||{x:0,y:0};M=u[K-1];y.x=K?y.x+(M.x-y.x)/s:q;y.y=K++?y.y+(M.y-y.y)/s:n}for(K=0;y=u[K*4];){i[a++%I]={s:1,d:1,c:m[(h+K++)%8],x:y.x,y:y.y}}d.fillRect(K=0,0,A,v);while(y=i[K++]){M=y.s+=y.d;y.d=M>E?-1:M<r?1:y.d;d.beginPath(d.fillStyle="#"+y.c);d.fill(d.arc(F+y.x,D+y.y,M*x,0,z,0))}},p)})(document)')

// getify's JS1k entry:

//packify('j=document;e=Math;k=j.body;k.innerHTML="<p>Don\'t idle...or else!</p>"+k.innerHTML;o=0;w=e.random;l=j.getElementById("c");z=l.style;A=l.getContext("2d");B=[];m=[0,0];g=0;function h(C,G){return(w()*(G-C)+C)<<0}function D(){with(A){clearRect(0,0,u,v);for(t=2;t;){r=0xffffff&m[--t]<<4|h(4,14);for(i=5;i;){with((f=B[t])[--i]){s=h(4,8);x=e.min(U,e.max(0,x+a*b));y=e.min(V,e.max(0,y+c*d));if(x<=0||x>=U){a*=-1;b=s;m[t]=r}if(y<=0||y>=V){c*=-1;d=s;m[t]=r}}}beginPath();lineWidth=8;strokeStyle="#"+m[t].toString(16);moveTo((n=f[0]).x,n.y);for(i=5;i;){lineTo((n=f[--i]).x,n.y)}stroke();closePath()}}g||(g=setInterval(D,20))}function E(){clearTimeout(o);if(g){clearInterval(g);A.clearRect(g=0,0,u,v)}o=setTimeout(D,3E3)}function F(){U=(u=l.width=innerWidth)-1;V=(v=l.height=innerHeight)-1}with(k.style){margin="0";background="#000";color="#fff"}F();z.position="absolute";z.top="0";for(t=2;t;){f=B[--t]=[];for(i=5;i;){p=(1&((w()*9)<<0))?1:-1;q=h(4,8);f[--i]={x:h(1,U),y:h(1,V),a:p,c:p,b:q,d:q}}}E();j.onmousemove=j.onkeydown=E;onresize=F')

// aivopaas's JS1k entry (un-packed first)

//packify('w=document.getElementById("c"),g=w.getContext("2d"),E=4099,C=8191,R=[],e=l=n=L=0;I=function(a,c,d){return(i=[[[2,7],[2,6,2],[0,7,2],[2,3,2]],[[1,3,2],[6,3]],[[2,3,1],[3,6]],[[2,2,6],[0,7,1],[3,2,2],[4,7]],[[2,2,3],[1,7],[6,2,2],[0,7,4]],[[2,2,2,2],[0,15]],[[3,3]]][a%7])[(a+c)%i.length]};P=function(a,c,d){g.clearRect(0,0,99,w.height=171);g.fillText("Level",117,60);v(m,0,0);g.fillText((L/10<<0),150,60);v(I(l,0),14,1);g.fillText("Lines",117,70);v(I(k,r),x,y);g.fillText(L,150,70);g.fillText("Points",117,80);g.fillText(n,150,80);for(i in R){g.fillText(R[i][1],117,99+i*9);g.fillText(R[i][0],150,99+i*9);}};h=function(a,c,d){k=l;l=Math.random(r=0)*E<<0;x=6;y=-1};M=function(a,c,d){for(i in (o=I(k,r)))m[y+(i<<=0)]|=o[i]<<x;for(i=o=18,a=0;--o;m[o]-C?m[--i]=m[o]:a++);for(h();--i;m[i]=E)L++;a-->0&&(n+=100*1<<a);t(0,0,0)||s()};t=function(a,c,d){for(i in (o=I(k,r+d)))if(o[i]<<x+a&m[y+c+i++])return c&&M();r+=d;x+=a;P(y+=c);return 1};v=function(a,c,d){for(i in a){for(i=a[i],o=c-1;i;i%2&&g.fillRect(o*9,d*9,8,8),o++,i>>=1);d++}};B=function(a,c,d){for(i=R.length;i--&&R[i][1]<n;)R[i+1]=R[i];R[i+1]=[prompt("Nickname"),n]};s=function(a,c,d){n&&B(L=0);m=[];for(m[n=18]=C;n;m[--n]=E)h()};document.onkeydown=function(a,c,d){t((a=a.keyCode-37)?a-2?0:1:-1,a-3?0:1,a==1&1)};setInterval("if(++e>16-L/10){t(0,1,0);e=0}",40);s()')
