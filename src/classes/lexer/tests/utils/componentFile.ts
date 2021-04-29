/**
 * the component that had some performance issues
 * when was parsed
 */
export const component1 = `
import type { GLClearColorType, WebGLFusionType } from './public/types.ts';
// WebGL coordinates:
//   x: horizontal right direction is positive
//   y: vertical top direction is positive
//   z: depth line of sight is negative

// the attributes: width and height are required

// around > 1500 points
// there is a performance issue with mousemove and the for statement
// drawing each time the mouse move x points is not good for performances
// using requestAnimationFrame for draws solves the performance issue

// can't use attributes on a fragment shader
// fragment shader only accepts uniforms as properties
// vertex shader accepts attributes as properties
<template>
  <canvas
    width="500px"
    height="500px"
    ref="canvases" />
    <div>
      number of points: $\{this.count}
    </div>
</template>
<proto
  type="app"
  base="./public">
  declare:
    count: number = 0;
    // create the animation service
    animationSet = new Set();
    saveRenderingAnimation(animation: Function) {
      this.animationSet.add(animation);
    }
    render() {
      try {
        for (let animate of this.animationSet) {
          (animate as Function)();
        }
      } catch (err) {
        throw err;
      }
    }
    delete(animation: Function) {
      this.animationSet.delete(animation);
    }
    clearAllAnimations() {
      this.animationSet.clear();
    }
    getWebGLContext(canvas: HTMLCanvasElement): WebGLFusionType | never {
      try {
        // need to get the correct webgl context
        const gl = canvas.getContext('webgl2')
          || canvas.getContext('webgl')
          || canvas.getContext('experimental-webgl');
        if (gl && (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
          console.log('Ogone - WebGL context retrieved');
        } else {
          throw new Error('Ogone is not able to get WebGL context, your browser or device may not support WebGL.')
        }
        return gl;
      } catch (err) {
        throw err;
      }
    }
    setCanvasBackground(gl: WebGLFusionType, color: GLClearColorType): void {
      try {
        // set the color of the background
        // a VXComponent can provide it with the attribute background
        gl.clearColor(...color); // RGBA
        // apply the clear color to get the result
        gl.clear(gl.COLOR_BUFFER_BIT);
      } catch (err) {
        throw err;
      }
    }
    createVertexShader(gl: WebGLFusionType, source: string,): any {
      try {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (!vertexShader) throw new Error('Ogone - failed to vertex shader.');
        gl.shaderSource(vertexShader, source.trim());
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
          var info = gl.getShaderInfoLog(vertexShader);
          throw new Error('failed to compile vertex shader.\n\n' + info);
        }
        return vertexShader;
      } catch (err) {
        throw err;
      }
    }
    createFragmentShader(gl: WebGLFusionType, source: string,): any {
      try {
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fragmentShader) throw new Error('Ogone - failed to create fragment shader.');
        gl.shaderSource(fragmentShader, source.trim());
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
          var info = gl.getShaderInfoLog(fragmentShader);
          throw new Error('failed to compile fragment shader.\n\n' + info);
        }
        return fragmentShader;
      } catch (err) {
        throw err;
      }
    }
    createProgram(gl: WebGLFusionType, opts: [string, string] = ['', '']): WebGLProgram {
      try {
        // the variable gl_Position is required
        const vertexShader = this.createVertexShader(gl, opts[0]);
        const fragmentShader = this.createFragmentShader(gl, opts[1]);
        const program = gl.createProgram();
        if (!program) throw new Error('Ogone - failed to create program.');
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
          var info = gl.getShaderInfoLog(fragmentShader);
          throw new Error('Ogone - failed to compile WebGL Program.\n\n' + info);
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        if (!gl.getProgramParameter( program, gl.LINK_STATUS)) {
          const info = gl.getProgramInfoLog(program);
          throw new Error('Could not compile WebGL program. \n\n' + info);
        }
        // use the program defined before
        gl.validateProgram(program);
        gl.useProgram(program);
        return program;
      } catch(err) {
        throw err;
      }
    }

    createBufferWithVertices(gl: WebGLFusionType, program: WebGLProgram, vertices: Float32Array): WebGLBuffer {
      try {
        const buffer = gl.createBuffer();
        if (!buffer)  {
          throw new Error(\`Failed to create a buffer\`);
        }
        // bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        // write data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        this.assignBufferToAttribute(gl, program, buffer, 'positionAttr');
        return buffer;
      } catch(err) {
        throw err;
      }
    }
    assignBufferToAttribute(gl: WebGLFusionType, program: WebGLProgram, buffer: WebGLBuffer, attributeName: string) {
      try {
        const attributeLocation = this.getAttributeLocation(gl, program, attributeName);
        // Assign the buffer object to the attribute variable
        gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0);
        // enable the assignment to the attribute variable
        gl.enableVertexAttribArray(attributeLocation);
      } catch(err) {
        throw err;
      }
    }
    getAttributeLocation(gl: WebGLFusionType, program: WebGLProgram, name: string): number {
      try {
        // retrieve the attribute location of the attribute, in the program
        const vertexAttributeLocation = gl.getAttribLocation(program, name);
        // if it's under 0, it doesn't exist inside the program
        if (!(vertexAttributeLocation >= 0)) {
          throw new Error('failed to get the storage location of the attribute ' + name);
        }
        return vertexAttributeLocation;
      } catch(err) {
        throw err;
      }
    }
    setVertexAttribute(gl: WebGLFusionType, program: WebGLProgram, name: string, ...values: any[]) {
      try {
        const vertexAttributeLocation = this.getAttributeLocation(gl, program, name);
        // 3f means like : 3 floating values
        // vertexAttrib[1...4]f are available
        // The vector versions of these methods are also available.
        // Their name contains “v” (vector),
        // and they take a typed array as a parameter.
        // The number in the method name indicates the number of elements in the array.
        // example:
        //  const position = new Float32Array([1.0, 2.0, 3.0, 1.0]);
        //  gl.vertexAttrib4fv(a_Position, position);
        switch (values.length) {
          case 1:
            gl.vertexAttrib1f(vertexAttributeLocation, values[0]);
            break;
          case 2:
            gl.vertexAttrib2f(vertexAttributeLocation, values[0], values[1]);
            break;
          case 3:
            gl.vertexAttrib3f(vertexAttributeLocation, values[0], values[1], values[2]);
            break;
          default:
          case 4:
            gl.vertexAttrib4f(vertexAttributeLocation, values[0], values[1], values[2], values[3]);
            break;
        }
        return vertexAttributeLocation;
      } catch (err) {
        throw err;
      }
    }
    getUniformLocation(gl: WebGLFusionType, program: WebGLProgram, name: string) {
      try {
        const uniform = gl.getUniformLocation(program, name);
        if (!uniform) {
          throw new Error(\`Failed to get uniform location for the uniform: $\{name}\`);
        }
        return uniform;
      } catch (err) {
        throw err;
      }
    }
    setUniform(gl: WebGLFusionType, program: WebGLProgram, name: string, ...values: any[]) {
      try {
        const uniform = this.getUniformLocation(gl, program, name);
        switch (values.length) {
          case 1: gl.uniform1f(uniform, values[0]); break;
          case 2: gl.uniform2f(uniform, values[0], values[1]); break;
          case 3: gl.uniform3f(uniform, values[0], values[1], values[2]); break;
          default:
          case 4: gl.uniform4f(uniform, values[0], values[1], values[2], values[3]); break;
        }
        return uniform;
      } catch (err) {
        throw err;
      }
    }
  before-each:
    const [canvas] = Refs.canvases as HTMLCanvasElement[];
    const gl = this.getWebGLContext(canvas as unknown as HTMLCanvasElement);
    const BASIC_BACKGROUND_COLOR: GLClearColorType = [0, 0, 0, 1];
    const vertices = new Float32Array([
      -0.5, -0.5,
      0.5, -0.5,
      0.0, 0,5,
    ]);
  default:
    this.setCanvasBackground(gl, BASIC_BACKGROUND_COLOR);
    // don't forget to set the gl_PointSize value
    // if you use an undefined attribute variable
    // the value will be replaced by 0.0
    const program = this.createProgram(gl, [
        \`
      attribute vec4 positionAttr;
      void main() {
        gl_Position = positionAttr;
        gl_PointSize = 10.0;
      }
        \`,
        \`
      precision mediump float;
      uniform vec4 colorUnif;
      void main() {
        gl_FragColor = colorUnif;
      }\`]);
    const render = () => {
      let amount = 1;
      // clear canvas;
      // background color should defined before anything
      // need to set the background before each draw
      this.setCanvasBackground(gl, BASIC_BACKGROUND_COLOR);
      // create the shape with buffer
      // binding it with bindBuffer and bufferData right after
      const buffer = this.createBufferWithVertices(gl, program, vertices);
      amount = Math.floor(vertices.length / 2);
      this.count = amount;
      this.setUniform(gl, program, 'colorUnif', 1.0, 0.0, 0.0, 1.0);
      if (gl instanceof WebGLRenderingContext) {
        gl.drawArrays(gl.POINTS,
        // the first vertex is 0
        // this is the start for the program
        0,
        // the number of vertices
        amount);
      } else if (gl instanceof WebGL2RenderingContext) {
        gl.drawArraysInstanced(gl.POINTS, 0, amount, 1);
      }
    };
    this.saveRenderingAnimation(render);
    const animate = () => {
      this.render();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    break;
</proto>
  `;