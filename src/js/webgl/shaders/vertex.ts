/*export const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
	attribute vec4 aVertexColor;
	
	varying lowp vec4 vColor;
	
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	  vColor = aVertexColor;
    }
  `;*/

  export const vertexShaderSource  = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying highp vec2 vTextureCoord;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
  }
`;