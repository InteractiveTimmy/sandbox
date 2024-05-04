'use strict';

function openURL( url, target ) {
  if ( target == '_blank' || target == '_self' )
  {
    let myWindow = window.open( url, target );
    myWindow.focus( );
  }

  if ( target == 'id' )
  {
    document.getElementById( url ).scrollIntoView( );
  }
}

function getParams ( loc ) {
  let temp, result = { };

  loc.search.substr( 1 ).split( '&' ).forEach( ( item ) => {
    temp = item.split( '=' );
    result[temp[0]] = temp[1];
  } );
  
  return result;
}

function generateEllipsis ( elements )
{
  let words;

  for ( let i = 0; i < elements.length; i++ )
  {
    words = elements[i].innerHTML.split( ' ' );

    while ( elements[i].scrollHeight > elements[i].clientHeight )
    {
      words.pop( );
      elements[i].innerHTML = words.join( ' ' ) + '...';
    }
  }
}

function createCard ( type, index, color, data )
{
  let element, image, text, title, hr, body;
  
  element = document.createElement( 'div' );
  element.className = `card card-${color}`;
  element.onclick = ( data.link ) ? ( ) => { openURL( data.link, '_blank' ); } : null;

  text = document.createElement( 'div' );
  text.className = 'card-text';

  if ( data.image )
  {
    image = document.createElement( 'img' );
    image.className = 'card-img'
    image.src = data.image;
    image.alt = ( data.title ) ? data.title : data.image;
    element.appendChild( image );
  }

  if ( data.title )
  {
    title = document.createElement( 'h3' );
    title.innerHTML = data.title;

    hr = document.createElement( 'hr' );

    text.appendChild( title );
    text.appendChild( hr );
  }

  if ( data.body )
  {
    body = document.createElement( 'p' );
    body.className= 'card-body';
    body.innerHTML = data.body;

    text.appendChild( body );
  }

  element.appendChild( text );

  return element;
}

function checkScroll ( position ) {
  return ( position > 0 ) ? true : false;
}