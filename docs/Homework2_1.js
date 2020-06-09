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
var motion_speed=0.4;
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
// ######################################################################
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

var torsoHeight = 8.0;
var torsoWidth = 5.0;

var lowerArmHeight = 2.0;
var lowerArmWidth  = 0.5;

var upperArmHeight = 3.0;
var upperArmWidth  = 0.5;

var upperLegHeight = 3.0;
var upperLegWidth  = 0.5;

var lowerLegHeight = 2.0;
var lowerLegWidth  = 0.5;


var headHeight = 1.5;
var headWidth = 1.0;

var tailHeight = 1.0;
var tailWidth = 0.5;

var numNodes = 10;
var numAngles = 11;
var angle = 0;
			//0   1     2    3    4  5     6  7    8  9  10 11 12  13
var theta = [90,  0, -110, -20, -70, 0,  -110, 0, -70, 0, 0, 0, 45, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];
var normalsArray = [];
var texCoordsArray = [];


//##################################
//##################################   PARTE PER ALBERO
// Parameters for the lookAt function.
var radius_eye = 7.0;
var theta_eye = 1.39; //  So that at the beginning the tree is clearly visible.
var phi_eye = -90.0* Math.PI/180.0;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

//Parameters for the perspective view
var  near = 0.01;
var  far = 30.0;
var  fovy = 20.0;  // Field-of-view in Y direction angle (in degrees)
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
var lflag=true;
var texture_tree_torso, texture_tree_foliage, texture_bear_body, texture_bear_face;
var foliage_offset = 5;

//                                                                                      ARRAY OF vertices_tree
var vertices_tree = [
	vec4(-torso_tree,    0,   -upper_foliage_height+z_offset* scale_factor,1.0),  //torso ba
	vec4(0,    -torso_tree,   -upper_foliage_height+z_offset* scale_factor,1.0),    // torso bb
	vec4(torso_tree,     0,   -upper_foliage_height+z_offset* scale_factor,1.0),       // torso bc
	vec4(0.0,   torso_tree,   -upper_foliage_height+z_offset* scale_factor,1.0),     // torso bd // lower torso 3
	vec4(-torso_tree,    0,     foliage_offset+0+z_offset* scale_factor,1.0),
	vec4(0,    -torso_tree,     foliage_offset+0+z_offset* scale_factor,1.0),
	vec4(torso_tree,     0,     foliage_offset+0+z_offset* scale_factor,1.0),
	vec4(0.0,   torso_tree,     foliage_offset+0+z_offset* scale_factor,1.0), //upper torso 7
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
	vec4(0.0, 0.0,  foliage_offset+middle_foliage_height+0.1+z_offset* scale_factor,1.0), //lower_puntale 21
	vec4(0.0, 0.0,  foliage_offset+upper_foliage_height+0.1+z_offset* scale_factor,1.0) //middle_puntale	22
];


// Coordinates for the texture of the triangular foliage
var texCoordTriangle = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(0.5, 1)
    ];
    
// Coordinates for the texture of the quadrilateral foliage and the 

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
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(1, 1)
];

