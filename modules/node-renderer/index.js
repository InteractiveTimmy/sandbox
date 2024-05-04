'use strict';

let myManager;
let myCTX;
let myCanvas;

class Point
{
  constructor ( position, velocity, hidden )
  {
    this.position = position;
    this.velocity = velocity;
    this.radius = 0.5 + Math.random( );
    this.distanceFromTarget = 0;
    this.hidden = hidden;
  }

  update ( bounds, speed, target )
  {
    if ( this.hidden ) { return; }

    this.distanceFromTarget = Math.sqrt(
      Math.pow( target.position[0] - this.position[0], 2 ) + 
      Math.pow( target.position[1] - this.position[1], 2 )
    );

    this.position[0] += this.velocity[0] * speed;
    this.position[1] += this.velocity[1] * speed;

    if ( this.position[1] < bounds[0] )
    { this.velocity[1] *= -1; this.velocity[0] = ( Math.random( ) - 0.5 ) * 2; this.position[1] = bounds[0] + 1; }
    if ( this.position[0] > bounds[1] )
    { this.velocity[0] *= -1; this.velocity[1] = ( Math.random( ) - 0.5 ) * 2; this.position[0] = bounds[1] - 1; }
    if ( this.position[1] > bounds[2] )
    { this.velocity[1] *= -1; this.velocity[0] = ( Math.random( ) - 0.5 ) * 2; this.position[1] = bounds[2] - 1; }
    if ( this.position[0] < bounds[3] )
    { this.velocity[0] *= -1; this.velocity[1] = ( Math.random( ) - 0.5 ) * 2; this.position[0] = bounds[3] + 1; }
  }

  draw ( canvas )
  {
    if ( this.hidden ) { return; }
    canvas.beginPath( );
    canvas.arc( ...this.position, this.radius, 0, 2 * Math.PI );
    canvas.closePath( );
    canvas.fillStyle = `rgb( 0, 160, 240 )`;
    canvas.fill( );
  }
}

class Line
{
  constructor ( start, end )
  {
    this.start = start;
    this.end = end;
    this.length = Math.sqrt(
      Math.pow( end.position[0] - start.position[0], 2 ) + 
      Math.pow( end.position[1] - start.position[1], 2 )
    );
  }

  draw ( canvas, maxLength )
  {
    canvas.beginPath( );
    canvas.moveTo( ...this.start.position );
    canvas.lineTo( ...this.end.position );
    canvas.closePath( );
    canvas.strokeStyle = `rgba( 0, 160, 240, ${( 1 - this.length / maxLength ) / 2} )`;
    canvas.stroke( );
  }

}

class Manager
{
  constructor ( canvas, points, speed, target )
  {
    this.target = target;

    this.points = points;
    this.points.push( target );

    this.lines = [ ];
    this.maxLineLength = Math.sqrt(
      Math.pow( canvas.width / 8, 2 ) + 
      Math.pow( canvas.height / 8, 2 )
    );

    this.bounds = [
      0 - Math.floor( canvas.width / 24 ),
      canvas.width + Math.floor( canvas.width / 24 ),
      canvas.height + Math.floor( canvas.width / 24 ),
      0 - Math.floor( canvas.width / 24 )
    ]; // [ top, right, bottom, left ]

    this.speed = speed

    this.canvas = canvas;
    this.ctx = this.canvas.getContext( '2d' );
  }

  validateProximity ( point, otherPoint )
  {
    if (
      Math.abs( point.position[0] - otherPoint.position[0] ) < this.canvas.width / ( point.distanceFromTarget / 32 ) && 
      Math.abs( point.position[1] - otherPoint.position[1] ) < this.canvas.height / ( point.distanceFromTarget / 32 )
    )
    { return true; }
    else
    { return false; }
  }

  update ( )
  {
    this.lines = [ ];

    this.points.forEach( ( point ) => {
      point.update( this.bounds, this.speed, this.target );

      this.points.forEach( ( otherPoint ) => {
        if ( this.validateProximity( point, otherPoint ) && point !== this.target && otherPoint !== this.target )
        { this.lines.push( new Line( point, otherPoint ) ); }
      } );
    } );
  }

  draw ( )
  {
    this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );

    this.lines.forEach( ( line, i ) => {
      line.draw( this.ctx, this.maxLineLength );
    } );

    this.points.forEach( ( point, i ) => {
      point.draw( this.ctx );
    } );
  }

  resize ( width, height )
  {
    this.canvas.width = width;
    this.canvas.height = height;

    this.maxLineLength = Math.sqrt(
      Math.pow( width / 8, 2 ) + 
      Math.pow( height / 8, 2 )
    );

    console.log( this.maxLineLength );
    this.bounds = [
      0 - Math.floor( width / 24 ),
      width + Math.floor( width / 24 ),
      height + Math.floor( width / 24 ),
      0 - Math.floor( width / 24 )
    ]; // [ top, right, bottom, left ]
  }
}

function init ( canvas, count, target )
{
  const points = [ ];

  for ( let i = 0; i < count; i++ )
  {
    points.push( new Point(
      [ Math.random( ) * canvas.width, Math.random( ) * canvas.height ],
      [ ( Math.random( ) - 0.5 ) * 2, ( Math.random( ) - 0.5 ) * 2 ]
    ) );
  }

  myManager = new Manager( canvas, points, 1, target );

  step( );

  return myManager;
}

function step ( )
{
  requestAnimationFrame( step );

  myManager.update( );
  myManager.draw( );
}