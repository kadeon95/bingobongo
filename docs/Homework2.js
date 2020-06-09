"use strict";

var walk=false;

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;
var numPositions = 108;


// ######################################################################## ANIMATION VARIABLES
var animate=false;
var walking_speed=0.4;
var scratching_speed=0.4;
var motion_walk=3.0;
var motion_lowerArm_walk=1.5;
var torso_translation=30.0;
var torso_speed = 1.0;
var switch_direction=false;
var scene_rotation_speed = 1.0;
var scene_rotation = false;
var scene_rotation_angle = 0.0;
var tree_position = -5.0;
var torso_angle_up = -90;
var stand_up=false;
var rotation_to_backside=0;
var backside = false;
var vertical_translation_bear = -0.2;
var bear_scratch_down = true;
var bear_scratch_up = false;
var torso_angle_horizzontal = 0;
var backOnTrunk = false;
var translation_to_trunk = 0;
var on_knees = false;
// ######################################################################


// Vertices used for the cube 
var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

// Indices for the vector of angles of the hierachical model of the bear
var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var tailId=11;
var tail1Id=12;
var tail2Id=13;
			//0   1     2    3    4  5     6   7    8  9  10  11   12    13
var theta = [90,  0, -110, -20, -70, 0,  -110, 0, -70, 0,  0,  0,  45,-22.5];


// Sizes of the bear's components
var torsoHeight = 8.0;
var torsoWidth = 5.0;

var lowerArmHeight = 2.0;
var lowerArmWidth  = 1.5;

var upperArmHeight = 3.0;
var upperArmWidth  = 2.0;

var upperLegHeight = 3.0;
var upperLegWidth  = 2.0;

var lowerLegHeight = 2.0;
var lowerLegWidth  = 1.5;


var headHeight = 2.5;
var headWidth = 3.0;

var tailHeight = 1.5;
var tailWidth = 1.0;

// Number of node and number of angles of the structure.
var numNodes = 10;
var numAngles = 11;

// Number of vertices pushed for one cube.
var numVertices = 24;


// Stack used for using consistently the modelview matrix between parents and childs of the structure.
var stack = [];


// Structure of nodes of the bear.
var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];
var normalsArray = [];
var texCoordsArray = [];


//##################################
//##################################   Tree part.
// Parameters for the lookAt function.
var radius_eye = 80.0;
var theta_eye = 1.39; //  So that at the beginning the scene is clearly visible.
var phi_eye =-90.0* Math.PI/180.0;
var eye;
var at =vec3(20,50,10);
var up = vec3(0, -100, 670);

//Parameters for the perspective view
var  near = 0.01;
var  far = 600.0;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect=1.0;       // Viewport aspect ratio


// Constants used in order to build the geometry of the tree.
var scale_factor=20.0;

var base_foliage = 0.6 * scale_factor;
var cap = 0.90* scale_factor;
var middle_foliage_height = 0.30* scale_factor;
var upper_foliage_height = 0.60* scale_factor;

var torso_tree = 0.1* scale_factor;
var middle_foliage = 0.4* scale_factor;
var middle_foliage_cap_offset=0.10* scale_factor;
var upper_foliage_cap_offset=0.10* scale_factor;
var upper_foliage = 0.2* scale_factor;
var base_foliage_up = 0.2* scale_factor;
var middle_foliage_up = 0.1* scale_factor;

var ba=8;
var bb=9;
var bc=10;
var bd=11;

var ma=12;
var mb=13;
var mc=14;
var md=15;



var ua=16;
var ub=17;
var uc=18;
var ud=19;
var ucap=20;

var torso_b_a = 0;
var torso_b_b = 1;
var torso_b_c = 2;
var torso_b_d = 3;
var torso_u_a = 4;
var torso_u_b = 5;
var torso_u_c = 6;
var torso_u_d = 7;
var z_offset=0.3;



var lower_cap =  21;
var middle_cap = 22;

// Flag used in order to remove and apply again the texture.
var texture_tree_torso, texture_tree_foliage, texture_bear_body, texture_bear_face, texture_bear_head, texture_prato, texture_background;
var foliage_offset = 5;

//                                                                                      ARRAY OF vertices_tree
var vertices_tree = [
	vec4(-torso_tree,    -torso_tree,   -upper_foliage_height+z_offset* scale_factor,1.0),  //torso ba
	vec4(torso_tree,    -torso_tree,   -upper_foliage_height+z_offset* scale_factor,1.0),    // torso bb
	vec4(torso_tree,     torso_tree,   -upper_foliage_height+z_offset* scale_factor,1.0),       // torso bc
	vec4(-torso_tree,      torso_tree,   -upper_foliage_height+z_offset* scale_factor,1.0),     // torso bd // lower torso 3
	vec4(-torso_tree,    -torso_tree,     foliage_offset+0+z_offset* scale_factor,1.0),
	vec4(torso_tree,    -torso_tree,     foliage_offset+0+z_offset* scale_factor,1.0),
	vec4(torso_tree,     torso_tree,     foliage_offset+0+z_offset* scale_factor,1.0),
	vec4(-torso_tree,   torso_tree,     foliage_offset+0+z_offset* scale_factor,1.0), //upper torso 7
	vec4(-base_foliage, 0,  foliage_offset+0+z_offset* scale_factor,1.0),
	vec4(0,  -base_foliage,  foliage_offset+0+z_offset* scale_factor,1.0),
	vec4(base_foliage,  0,  foliage_offset+0+z_offset* scale_factor,1.0),
	vec4(0.0, base_foliage,  foliage_offset+0+z_offset* scale_factor,1.0), //lower chioma 11
	vec4(-middle_foliage, 0,  foliage_offset+middle_foliage_height+z_offset* scale_factor,1.0),
	vec4(0,  -middle_foliage,  foliage_offset+middle_foliage_height+z_offset* scale_factor,1.0),
	vec4(middle_foliage,  0,  foliage_offset+middle_foliage_height+z_offset* scale_factor,1.0),
	vec4(0.0, middle_foliage,  foliage_offset+middle_foliage_height+z_offset* scale_factor,1.0), //middle chioma 15
	vec4(-upper_foliage, 0,  foliage_offset+upper_foliage_height+z_offset* scale_factor,1.0),
	vec4(0,  -upper_foliage,  foliage_offset+upper_foliage_height+z_offset* scale_factor,1.0),
	vec4(upper_foliage,  0,  foliage_offset+upper_foliage_height+z_offset* scale_factor,1.0),
	vec4(0.0, upper_foliage,  foliage_offset+upper_foliage_height+z_offset* scale_factor,1.0), //upper chioma 19
	vec4(0.0, 0.0,  foliage_offset+cap+z_offset* scale_factor,1.0), // higher_puntale 20
	vec4(0.0, 0.0,  foliage_offset+middle_foliage_height+0.8+z_offset* scale_factor,1.0), //lower_puntale 21
	vec4(0.0, 0.0,  foliage_offset+upper_foliage_height+0.8+z_offset* scale_factor,1.0) //middle_puntale	22
];


// Coordinates for the texture of the triangular foliage
var texCoordTriangle = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(0.5, 1)
    ];
    
var texCoordPrato = [
    vec2(0, 0),
    vec2(0, 100),
    vec2(50, 100)
    ];
    
// Coordinates for the texture of the quadrilateral foliage  

var texCoord = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 8),
    vec2(1, 8)
];

var texCoordFoliage = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(1, 1)
];

var texCoordBear_Body = [
    
    vec2(1, 0),
    vec2(1, 1),

    vec2(0, 1),
    vec2(0, 0)
];




// Function used for building each single quadrilateral of the scene.
function quad_tree(a, b, c, d, what_texture ) {
	
    var t1 = subtract(vertices_tree[b], vertices_tree[a]);
    var t2 = subtract(vertices_tree[c], vertices_tree[a]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

	
	if ( what_texture == "tree_torso" ){
		
	
		pointsArray.push(vertices_tree[a]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[0]);

		pointsArray.push(vertices_tree[b]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[1]);

		pointsArray.push(vertices_tree[d]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[3]);

		pointsArray.push(vertices_tree[b]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[1]);

		pointsArray.push(vertices_tree[c]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[2]);

		pointsArray.push(vertices_tree[d]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[3]);
	}
	else if(what_texture=="tree_foliage")
	{
		pointsArray.push(vertices_tree[a]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[0]);

		pointsArray.push(vertices_tree[b]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[1]);

		pointsArray.push(vertices_tree[d]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[3]);

		pointsArray.push(vertices_tree[b]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[1]);

		pointsArray.push(vertices_tree[c]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[2]);

		pointsArray.push(vertices_tree[d]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[3]);
	}
  	else if(what_texture=="bear_body")
	{
		pointsArray.push(vertices[a]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordBear_Body[0]);

		pointsArray.push(vertices[b]);
        normalsArray.push(normal);
		texCoordsArray.push(texCoordBear_Body[1]);
		
		pointsArray.push(vertices[c]);
        normalsArray.push(normal);
		texCoordsArray.push(texCoordBear_Body[2]);
		
		pointsArray.push(vertices[d]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordBear_Body[3]);
		
    }

}


// Function used for building a single foliage ( they are 3 in total )
function cap_foliage(a, b, c, d, e) {
     
     var t1 = subtract(vertices_tree[b], vertices_tree[a]);
     var t2 = subtract(vertices_tree[e], vertices_tree[a]);
     var normal_face_1 = cross(t1, t2);
     normal_face_1 = vec3(normal_face_1);
     
     var t1 = subtract(vertices_tree[a], vertices_tree[d]);
     var t2 = subtract(vertices_tree[e], vertices_tree[d]);
     var normal_face_2 = cross(t1, t2);
     normal_face_2 = vec3(normal_face_2);
     
     var t1 = subtract(vertices_tree[d], vertices_tree[c]);
     var t2 = subtract(vertices_tree[e], vertices_tree[c]);
     var normal_face_3 = cross(t1, t2);
     normal_face_3 = vec3(normal_face_3);
     
     var t1 = subtract(vertices_tree[c], vertices_tree[b]);
     var t2 = subtract(vertices_tree[e], vertices_tree[b]);
     var normal_face_4 = cross(t1, t2);
     normal_face_4 = vec3(normal_face_4);



     pointsArray.push(vertices_tree[a]);
     normalsArray.push(normal_face_1);
     texCoordsArray.push(texCoordTriangle[0]);

     pointsArray.push(vertices_tree[b]);
     normalsArray.push(normal_face_1);
     texCoordsArray.push(texCoordTriangle[1]);

     pointsArray.push(vertices_tree[e]);
     normalsArray.push(normal_face_1);
     texCoordsArray.push(texCoordTriangle[2]);

     pointsArray.push(vertices_tree[a]);
     normalsArray.push(normal_face_2);
     texCoordsArray.push(texCoordTriangle[0]);

     pointsArray.push(vertices_tree[d]);
     normalsArray.push(normal_face_2);
     texCoordsArray.push(texCoordTriangle[1]);

     pointsArray.push(vertices_tree[e]);
     normalsArray.push(normal_face_2);     
     texCoordsArray.push(texCoordTriangle[2]);

     pointsArray.push(vertices_tree[d]);
     normalsArray.push(normal_face_3);
     texCoordsArray.push(texCoordTriangle[0]);

     pointsArray.push(vertices_tree[c]);
     normalsArray.push(normal_face_3);
     texCoordsArray.push(texCoordTriangle[1]);

     pointsArray.push(vertices_tree[e]);
     normalsArray.push(normal_face_3);     
     texCoordsArray.push(texCoordTriangle[2]);

     pointsArray.push(vertices_tree[c]);
     normalsArray.push(normal_face_4);
     texCoordsArray.push(texCoordTriangle[0]);

     pointsArray.push(vertices_tree[b]);
     normalsArray.push(normal_face_4);
     texCoordsArray.push(texCoordTriangle[1]);

     pointsArray.push(vertices_tree[e]);
     normalsArray.push(normal_face_4);
     texCoordsArray.push(texCoordTriangle[2]);

  // 12 fin qua, poi chiamo quad ---> +6 = 18 vertici ok
     quad_tree(a,b,c,d, "tree_foliage"); // base 
}


function build_foliage()  // 18*3 = 54  vertices_tree
{
    cap_foliage(ba, bb, bc, bd, lower_cap);    //18
    cap_foliage(ma, mb, mc, md, middle_cap); //18
    cap_foliage(ua, ub, uc, ud, ucap); // 18
}



function build_torso_(b_a, b_b ,b_c ,b_d ,u_a ,u_b ,u_c ,u_d)  //30 vertici pushati per il torso
{
    quad_tree(b_a, b_b, u_b, u_a, "tree_torso");
    quad_tree(b_b, b_c, u_c, u_b,"tree_torso");
    quad_tree(b_c, b_d, u_d, u_c,"tree_torso");
    quad_tree(b_d, b_a, u_a, u_d,"tree_torso");
    quad_tree(b_a, b_b, b_c, b_d,"tree_torso");

}

	
function build_torso()
{
	build_torso_(torso_b_a, torso_b_b, torso_b_c, torso_b_d, torso_u_a, torso_u_b, torso_u_c, torso_u_d);
} 
	
function build_tree()
{ 
	build_foliage();
	build_torso();
}


//###################################################################
//###################################################################
// End part of the code about the geometry of the tree



function configureTextureTreeFoliage( image ) {
    texture_tree_foliage = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_tree_foliage);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

function configureTextureTreeTorso( image ) {
    texture_tree_torso = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_tree_torso);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

function configureTextureBearBody( image ) {
    texture_bear_body = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

function configureTextureBearFace( image ) {
    texture_bear_face = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_bear_face);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

function configureTextureBearHead( image ) {
    texture_bear_head = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_bear_head);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

function configureTexturePrato( image ) {
    texture_prato= gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_prato);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

function configureTextureBackground( image ) {
    texture_background= gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture_background);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}




//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------

// Function used to create the node of the structure
function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}

// Function used to initialize the nodes and their relations and to assign to them the appropriate transformation matrices.
function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:
    
    m = translate( torso_translation , 0, 0);

    m = mult(m,translate(0, vertical_translation_bear , 0) );
    m = mult(m,translate(0, 0 , 0.3+translation_to_trunk) );

    m = mult(m,rotate(theta[torsoId], vec3(0, 1, 0) ));
    m = mult(m,rotate(torso_angle_up, vec3(1, 0, 0) ));
    m = mult(m,rotate(torso_angle_horizzontal, vec3(0, 0, 1) ));
    
    m = mult(m,rotate(rotation_to_backside, vec3(1, 0, 0)));
    
    if(switch_direction){
		m = mult(m,rotate(-180, vec3(0, 0, 1) ));
    }
	m = mult(m, rotate(scene_rotation_angle, vec3(0, 0, 1)) );

    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:


    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
	m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;


    case leftUpperArmId:

    m = translate(-(torsoWidth/2.0), 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate(torsoWidth/2.0, 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    m = translate(-(torsoWidth/2.0), 0.1*upperLegHeight, 0.0);
	  m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate(torsoWidth/2.0, 0.1*upperLegHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight-0.5, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight-0.5, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight-0.5, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight-0.5, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

	case tailId:
	case tail1Id:
	case tail2Id:


    m = translate(0.0, +0.75, -1.0);
	m = mult(m, rotate(theta[tail1Id], vec3(1, 0, 0)))
	m = mult(m, rotate(theta[tail2Id], vec3(0, 1, 0)));
    figure[tailId] = createNode( m, tail, null, null);
    break;
    
    
    }

}

function traverse(Id) {
   // Passo base: ho raggiunto la foglia
   if(Id == null) return;
   
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   
   // Per il figlio voglio che influisca la MV matrix del padre
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   // A mio fratello passo la MV matrix di " nostro padre " 
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

// Per ogni cubo faccio il push di 24 vertici.
// Notare che ad ogni iterazione di renderizzazione, tramite la funzione traverse, carico sempre tutti i vertici dell'orso.
// Notare che però, nonostante i vertici nella scena siano 24*11=264 vertici , in realtà usiamo sempre gli stessi 24 vertici
// che andiamo a traslare e a scalare a seconda del risultato che vogliamo.
// Quindi il punto di partenza è sempre il cubo classico che spazia da -0.5 a +0.5.
// Ognuna delle funzioni seguenti, quindi, cambia prima la MV matrix, poi chiama il drawarrays, così disegna effettivamente i 24 vertici e la figura corrispondente.
// Quindi il vertex-shader viene chiamato 11 volte con 11 MV matrix differenti.
// Notare ancora una volta che in queste 11 chiamate, i vertici sono sempre gli stessi. Quel che fa differenza è la MV matrix che trasla e scala.

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth/1.5));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
            gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    

    for(var i =0; i<6; i++) {
		if(i==0)     gl.bindTexture(gl.TEXTURE_2D, texture_bear_face);
		else if (i==1)		 gl.bindTexture(gl.TEXTURE_2D, texture_bear_head);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth/1.5, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
            gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth/1.5, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
            gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth/1.5, upperArmHeight, upperArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
          gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth/1.5, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
            gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth/1.5, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
            gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth/1.5, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
            gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth/1.5, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
            gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth/1.5, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
            gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

// Function for pushing the vertices of the tail and set the current MV matrix.
function tail() {
 
    instanceMatrix = mult(modelViewMatrix, translate(0.0, -0.5 * tailHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
            gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     pointsArray.push(vertices[b]);
     pointsArray.push(vertices[c]);
     pointsArray.push(vertices[d]);
}


function cube()
{
    quad_tree( 1, 0, 3, 2 , "bear_body" );
    quad_tree( 2, 3, 7, 6 , "bear_body");
    quad_tree( 3, 0, 4, 7 , "bear_body");
    quad_tree( 6, 5, 1, 2 , "bear_body");
    quad_tree( 4, 5, 6, 7 , "bear_body");
    quad_tree( 5, 4, 0, 1 , "bear_body");
}

// I use a different modelViewMatrix for the Tree
var modelViewMatrix2;
var projectionMatrix2;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    // Background color of the sky
    gl.clearColor( 0.70, 0.91, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    cube(); 												// 24 vertici pushati
    build_tree();
	
	// Code for the smeadow
	var vertices_2= [
		vec4(-3000,    -5,   -1000, 1.0),  //torso ba

		vec4(   0,      -5,   3000,     1.0),  //torso ba
		vec4(+3000,   -5,   -1000,  1.0)  //torso ba
	];

	var t3 = subtract(vertices_2[0], vertices_2[1]);
	var t4 = subtract(vertices_2[0], vertices_2[2]);
	var normal2 = cross(t3, t4);

	pointsArray.push(vertices_2[0]);
	pointsArray.push(vertices_2[1]);
	pointsArray.push(vertices_2[2]);
	normalsArray.push(normal2);
	normalsArray.push(normal2);
	normalsArray.push(normal2);
	texCoordsArray.push(texCoordPrato[0]);

	texCoordsArray.push(texCoordPrato[1]);

	texCoordsArray.push(texCoordPrato[2]);
	
        // This code was used for enabling also different backgrounds but it is no longer used
        // However could be useful for future improvements
		/*var vertices_3= [
			vec4(-200,    -300,   -100, 1.0),  //torso ba

			vec4( -200,      0,   300,     1.0),  //torso ba
			vec4(-200,   300,   -100,  1.0)  //torso ba
		];

		 t3 = subtract(vertices_3[0], vertices_3[1]);
		 t4 = subtract(vertices_3[0], vertices_3[2]);
		 normal2 = cross(t3, t4);

		pointsArray.push(vertices_3[0]);
		pointsArray.push(vertices_3[1]);
		pointsArray.push(vertices_3[2]);
		normalsArray.push(normal2);
		normalsArray.push(normal2);
		normalsArray.push(normal2);
		texCoordsArray.push(texCoordPrato[0]);

		texCoordsArray.push(texCoordPrato[1]);

		texCoordsArray.push(texCoordPrato[2]);
		
		var vertices_4= [
			vec4(-600,    -25,   -200, 1.0),  //torso ba5

			vec4( 0,      300,   -200,     1.0),  //torso ba
			vec4(600,   -25,   -200,  1.0)  //torso ba
		];

		 t3 = subtract(vertices_4[0], vertices_4[1]);
		 t4 = subtract(vertices_4[0], vertices_4[2]);
		 normal2 = cross(t3, t4);

		pointsArray.push(vertices_4[0]);
		pointsArray.push(vertices_4[1]);
		pointsArray.push(vertices_4[2]);
		normalsArray.push(normal2);
		normalsArray.push(normal2);
		normalsArray.push(normal2);
		texCoordsArray.push(vec2(0.5,1));

		texCoordsArray.push(vec2(0,0));

		texCoordsArray.push(vec2(0,1));
		*/
		// POSITIONS ARRAY
		
		
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );
    
        // TEXTURE ATTRIBUTE
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
    
    	// INITIALIZE THE TEXTURES. IN THIS CASE WE TAKE THEM FROM THE HTML FILE.
    var image = document.getElementById("texImageTreeFoliage");

    configureTextureTreeFoliage(image);
    
    image = document.getElementById("texImageTreeTorso");

    configureTextureTreeTorso(image);
    
    image = document.getElementById("texImageBearFace");

    configureTextureBearFace(image);

    image = document.getElementById("texImageBearBody");

    configureTextureBearBody(image);
    
    image = document.getElementById("texImagePrato");

    configureTexturePrato(image); 
    
    image = document.getElementById("texImageBackground");

    configureTextureBackground(image);
    
    image = document.getElementById("texImageBearHead");

    configureTextureBearHead(image);
    
    //   Sliders and Buttons
    
    document.getElementById("radiusSlider").onchange = function(event) {
       radius_eye= parseFloat(event.target.value);
    };
    document.getElementById("thetaSlider").onchange = function(event) {
        theta_eye = parseFloat(event.target.value)* Math.PI/180.0;
    };
    document.getElementById("phiSlider").onchange = function(event) {
        phi_eye = parseFloat(event.target.value)* Math.PI/180.0;
    };
    document.getElementById("aspectSlider").onchange = function(event) {
        aspect = parseFloat(event.target.value);
    };
    document.getElementById("fovSlider").onchange = function(event) {
        fovy = parseFloat(event.target.value);
    };
    
    document.getElementById("rotationButton").onclick = function() { 
		scene_rotation = !scene_rotation; 
		torso_translation=30.0;
		 animate=false;
		 walking_speed=0.4;
		 scratching_speed=0.4;
		 motion_walk=3.0;
		 motion_lowerArm_walk=1.5;
		 torso_speed = 1.0;
		 switch_direction=false;
		 scene_rotation_speed = 1.0;
		 scene_rotation_angle = 0.0;
		 tree_position = -5.0;
		 torso_angle_up = -90;
		 stand_up=false;
		 rotation_to_backside=0;
		 backside = false;
		 vertical_translation_bear = -0.2;
		 bear_scratch_down = true;
		 bear_scratch_up = false;
		 torso_angle_horizzontal = 0;
		 backOnTrunk = false;
		 translation_to_trunk = 0;
		 on_knees = false;
		 theta = [90,  0, -110, -20, -70, 0,  -110, 0, -70, 0, 0, 0, 45,-22.5];
			document.getElementById("walkButton").disabled = false;
			document.getElementById("animateButton").disabled = false;
			document.getElementById("WalkingSpeedSlider").disabled = true;
			document.getElementById("ScratchingSpeedSlider").disabled = true;
		if(scene_rotation) 	document.getElementById("RotationSpeedSlider").disabled = false;
		else document.getElementById("RotationSpeedSlider").disabled =  true;

			
		 
	};
	document.getElementById("view1Button").onclick = function() { 
		radius_eye = 30.05; 
		theta_eye = -1.48;
		phi_eye = -0.08726646;
		at=vec3(50,0,0);
		up=vec3(30, -10, 1000);
	};
	
	document.getElementById("view2Button").onclick = function() { 
		radius_eye = 30.05; 
		theta_eye = 1.48;
		phi_eye = 0.08726646;
		at=vec3(-50,0,10);
		up=vec3(920, 30, 0);
	};
	document.getElementById("view3Button").onclick = function() { 
		radius_eye = 80.0;
		theta_eye = 1.39; 
		phi_eye = -90.0* Math.PI/180.0;
		at=vec3(20,50,10);
		up=vec3(0, -100, 670);
	};
	
	document.getElementById("view4Button").onclick = function() { 
		radius_eye = 30.0;
		theta_eye = -1.570796326794896; 
		phi_eye = -1.570796326794896;
		at=vec3(-10, -80, 0);
		up=vec3(30,290,520);
	};

	document.getElementById("view5Button").onclick = function() { 
		radius_eye = 30.0;
		theta_eye = 1.39; 
		phi_eye = -1.8325957;
		at=vec3(0,60,0);
		up=vec3(30,290,520);
		document.getElementById("view5Button").selected = true;
	};

    document.getElementById("walkButton").onclick = function() { 
		walk = !walk;
		if(walk){

			scene_rotation_angle=0;
			scene_rotation=false;
			document.getElementById("rotationButton").disabled = true;
			document.getElementById("walkButton").disabled = false;
			document.getElementById("animateButton").disabled = true;
			document.getElementById("RotationSpeedSlider").disabled = true;
			document.getElementById("WalkingSpeedSlider").disabled = false;
			document.getElementById("ScratchingSpeedSlider").disabled = true;
			
		}else{
			document.getElementById("rotationButton").disabled = false;
			document.getElementById("walkButton").disabled = false;
			document.getElementById("animateButton").disabled = false;
		}
	};
    document.getElementById("WalkingSpeedSlider").onchange = function(event) { walking_speed = event.target.value; };
    document.getElementById("RotationSpeedSlider").onchange = function(event) { scene_rotation_speed = event.target.value/2; };
    document.getElementById("ScratchingSpeedSlider").onchange = function(event) { scratching_speed = event.target.value/2; };
    
    document.getElementById("animateButton").onclick = function() { 
		animate = !animate;
		if(animate){
			walking_speed = 0.4;
			scene_rotation_angle=0;
			scene_rotation=false;
			document.getElementById("rotationButton").disabled = true;
			document.getElementById("walkButton").disabled = true;
			document.getElementById("animateButton").disabled = false;
			document.getElementById("RotationSpeedSlider").disabled = true;
			document.getElementById("WalkingSpeedSlider").disabled = true;
			document.getElementById("ScratchingSpeedSlider").disabled = true;
			
		}else{
			walk=false;
			document.getElementById("rotationButton").disabled = false;
			document.getElementById("walkButton").disabled = true;
			document.getElementById("animateButton").disabled = false;
		} 
	};

	document.getElementById("walkButton").disabled = false;
	document.getElementById("animateButton").disabled = false;
	document.getElementById("WalkingSpeedSlider").disabled = true;
	document.getElementById("ScratchingSpeedSlider").disabled = true;
	document.getElementById("RotationSpeedSlider").disabled =  true;

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}

var render = function() {


        // Parameters for the lookAt function
        
		eye = vec3(radius_eye*Math.sin(theta_eye)*Math.cos(phi_eye),
			radius_eye*Math.sin(theta_eye)*Math.sin(phi_eye), radius_eye*Math.cos(theta_eye));

		
		modelViewMatrix = lookAt(eye, at , up);
		
		// Rotate the camera (consistently with objects)
		modelViewMatrix = mult(modelViewMatrix,rotate(-90,vec3(1,0,0)));
		
		// Perspective view
	    projectionMatrix = perspective(fovy, aspect, near, far);
	    
	    // Projection matrix sent to the shader
        gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

        gl.clear( gl.COLOR_BUFFER_BIT );
        
		gl.bindTexture(gl.TEXTURE_2D, texture_tree_foliage);

		modelViewMatrix2=modelViewMatrix;
		instanceMatrix = mult(modelViewMatrix2, translate(tree_position, 1.0, -5.0) );
		instanceMatrix = mult(instanceMatrix, rotate(90, vec3(0, 1, 0)) );
		instanceMatrix = mult(instanceMatrix, rotate(90, vec3(1, 0, 0)) );
		instanceMatrix = mult(instanceMatrix, rotate(scene_rotation_angle, vec3(0, 0, 1)) );
		
        if(scene_rotation){
			scene_rotation_angle += scene_rotation_speed;
		}
			
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
		
		
		gl.drawArrays(gl.TRIANGLES, 24, 54);
		
		// INITIALIZE THE TEXTURE. IN THIS CASE WE TAKE IT FROM THE HTML FILE.
		gl.bindTexture(gl.TEXTURE_2D, texture_tree_torso);


		gl.drawArrays(gl.TRIANGLES, 24 + 54 ,30);
		
		
        gl.bindTexture(gl.TEXTURE_2D, texture_bear_body);

		
		initNodes(tailId);

        traverse(torsoId);
        

        


        

			
        
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        
        if(walk){
			//Walking mode
			torso_translation -= walking_speed * torso_speed;

			theta[leftUpperArmId] += walking_speed * motion_walk;
			theta[rightUpperArmId]-= walking_speed * motion_walk;
			
			theta[leftUpperLegId]+= walking_speed * motion_walk;
			theta[rightUpperLegId]-= walking_speed * motion_walk;
			
			theta[leftLowerArmId] += walking_speed * motion_lowerArm_walk;
			theta[rightLowerArmId] -= walking_speed * motion_lowerArm_walk;
			
			theta[leftLowerLegId] += walking_speed * motion_lowerArm_walk;
			theta[rightLowerLegId] -= walking_speed * motion_lowerArm_walk;

			theta[tail2Id] += walking_speed*motion_walk;
			theta[head1Id] += walking_speed*motion_walk*0.5;
			
			// Change motion direction if at the bounds 
			if(torso_translation < -7.0 || torso_translation >38.0) {
				torso_speed=-torso_speed;
				switch_direction = !switch_direction;
			}
			
			// Arms and Legs motion consistently with walking mode
			if(theta[leftUpperArmId]>=-70 || theta[leftUpperArmId]<=-110 || theta[rightUpperArmId]>=-70 || theta[rightUpperArmId]<=-110 ){
				if (theta[leftUpperArmId]>=-70)  theta[leftUpperArmId]= -71;
				if (theta[leftUpperArmId]<=-110)  theta[leftUpperArmId]= -109;  // This is needed in order to avoid bugs when the motion_speed_slider is used during the switching
				if (theta[rightUpperArmId]>=-70)  theta[rightUpperArmId]= -71;
				if (theta[rightUpperArmId]<= -110)  theta[rightUpperArmId]= -109;
				motion_walk=-motion_walk;
				motion_lowerArm_walk = -motion_lowerArm_walk;
				
			}
			
			
		}
		
		if(animate){
			// Walk until it reaches the tree
			walk=true;

			if(switch_direction==false && (torso_translation - tree_position > -0.2) && (torso_translation - tree_position < 0.2) && !stand_up && !backside ){
					// Rotate 90 degrees 
					walk=false;

					if(torso_angle_horizzontal < 90 ){
						torso_angle_horizzontal += 1;
						if(torso_angle_horizzontal > 80 ){
						  translation_to_trunk -= 0.1;
						}
						if(torso_angle_horizzontal >= 90 ){
						    theta[leftUpperLegId]  = -90;
							theta[rightUpperLegId] = -90;
							theta[rightLowerLegId] = 0 ;
							theta[leftLowerLegId]  = 0 ;
						    theta[leftUpperArmId]  = -90;
							theta[rightUpperArmId] = -90;
							theta[rightLowerArmId] = -45 ;
							theta[leftLowerArmId]  = -45 ;
						}
						theta[leftUpperArmId] += walking_speed * motion_walk;

						theta[rightUpperArmId]-= walking_speed * motion_walk;
						
						theta[leftUpperLegId]+= walking_speed * motion_walk;
						theta[rightUpperLegId]-= walking_speed * motion_walk;
						
						theta[leftLowerArmId] += walking_speed * motion_lowerArm_walk;
						theta[rightLowerArmId] -= walking_speed * motion_lowerArm_walk;		
										
						// Arms and Legs motion consistently with rotating mode

						if(theta[leftUpperArmId]>=-70 || theta[leftUpperArmId]<=-110 || theta[rightUpperArmId]>=-70 || theta[rightUpperArmId]<=-110 ){
							if (theta[leftUpperArmId]>=-70)  theta[leftUpperArmId]= -70.1;
							if (theta[leftUpperArmId]<=-110)  theta[leftUpperArmId]= -109.9;  // This is needed in order to avoid bugs when the motion_speed_slider is used during the switching
							if (theta[rightUpperArmId]>=-70)  theta[rightUpperArmId]= -70.1;
							if (theta[rightUpperArmId]<= -110)  theta[rightUpperArmId]= -109.9;
							motion_walk=-motion_walk;
							motion_lowerArm_walk = -motion_lowerArm_walk;
							
						}
						
				
					}else{
						 // Once its back is close to the tree, then it want to be on its knees
						 if(!on_knees){
							theta[head1Id] =0;

							theta[leftUpperArmId] -= 0.5;

							theta[rightUpperArmId] -= 0.5;
							
							rotation_to_backside += 0.5;
							translation_to_trunk -=0.01;

							vertical_translation_bear -=0.01;
							theta[rightLowerLegId] -= 0.5 ;
							theta[leftLowerLegId]  -= 0.5 ;
							
							theta[rightLowerArmId] += 0.5 ;
							theta[leftLowerArmId]  += 0.5 ;
							if(theta[rightLowerLegId] ==-30) on_knees =true;
						 }else{
							rotation_to_backside += 1;
							theta[leftUpperLegId] -= 1;
							theta[rightUpperLegId] -= 1;
						}
						 if(rotation_to_backside>=90){
						  stand_up = true;
						  backside = true;
						}
					}
			}
			
			if(stand_up && backside && !backOnTrunk){
				// Go back a bit in order to get close to the torso of the tree
				walk=false;
				translation_to_trunk -=0.1;
					

				if( !(theta[leftUpperLegId]<-180 || theta[leftUpperLegId]>-150)){
					theta[leftUpperLegId] -= walking_speed * motion_walk * 5;
					theta[rightUpperLegId]-= walking_speed * motion_walk * 5;	
				}
				if (translation_to_trunk <-1.6){
					backOnTrunk =true;
				}
			}
				
			if(stand_up && backside && backOnTrunk){
				
				// It is well positioned now. Then scratch its back
				if( document.getElementById("ScratchingSpeedSlider").disabled == true ){
					console.log("DISABLED!");
					document.getElementById("ScratchingSpeedSlider").disabled = false;
				}

				walk=false;
				if(vertical_translation_bear >= 0.0 || theta[leftLowerLegId] >= 0){
					if(vertical_translation_bear>=0.0) vertical_translation_bear =-0.0001;
					if(theta[leftLowerLegId]>=0) theta[leftLowerLegId]=-0.0001; 
					bear_scratch_down=true;
					bear_scratch_up  = false;
				} else if(vertical_translation_bear <=-1.5 ){
					vertical_translation_bear = -1.4999;
					bear_scratch_down=false;
					bear_scratch_up  = true;
				}
				if(bear_scratch_down){
					vertical_translation_bear-=0.07*scratching_speed;
					theta[leftLowerLegId]-= 4*scratching_speed;
					theta[rightLowerLegId] -= 4*scratching_speed;
					theta[leftUpperLegId]+= 2*scratching_speed;
					theta[rightUpperLegId] += 2*scratching_speed;
					theta[tail1Id] += 2*scratching_speed;
					theta[head2Id] += 1*scratching_speed;
				
					theta[leftUpperArmId] += scratching_speed ;

					theta[rightUpperArmId]-= scratching_speed ;

					theta[leftLowerArmId] += scratching_speed ;
					theta[rightLowerArmId] -= scratching_speed ;	
				}
				if(bear_scratch_up){
					vertical_translation_bear+= 0.07*scratching_speed;
					theta[leftLowerLegId]+= 4 *scratching_speed;
					theta[rightLowerLegId]+= 4*scratching_speed ;
					theta[leftUpperLegId]-= 2*scratching_speed;
					theta[rightUpperLegId] -= 2*scratching_speed;
					theta[tail1Id] -= 2*scratching_speed;
				    theta[head2Id] -= 1*scratching_speed;
					theta[leftUpperArmId] -= scratching_speed ;

					theta[rightUpperArmId]+= scratching_speed ;

					theta[leftLowerArmId] -= scratching_speed ;
					theta[rightLowerArmId] += scratching_speed ;

				}
				
			}

		}
		
		// Initialize the nodes so that they are sent again to the graphic card
		initNodes(head1Id);
		initNodes(tailId);
		initNodes(torsoId);
		
		initNodes(leftUpperArmId);
		initNodes(rightUpperArmId);
		
		initNodes(leftLowerArmId);
		initNodes(rightLowerArmId);
		
		initNodes(leftUpperLegId);
		initNodes(rightUpperLegId);
		
		initNodes(rightLowerLegId);
		initNodes(leftLowerLegId);
		
		initNodes(tailId);
		
		gl.bindTexture(gl.TEXTURE_2D, texture_prato);

        gl.drawArrays(gl.TRIANGLES,numPositions,3);
        
        
        // This code was used for enabling also different backgrounds but it is no longer used
        // However could be useful for future improvements
        
        //gl.bindTexture(gl.TEXTURE_2D, texture_background);

        //gl.drawArrays(gl.TRIANGLES,numPositions+3,3);
        //gl.drawArrays(gl.TRIANGLES,numPositions+6,3);
        
        requestAnimationFrame(render);
}
