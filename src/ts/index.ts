import * as THREE from "three";
import { TextureDataType, Vector2, Vector3 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const DEBUG_SHOW_CAMERA_CHOORDS = false;

class Pointer {
   element: HTMLElement;

   position: THREE.Vector3;

   constructor(element: HTMLElement){
      this.element = element;
      this.position = new Vector3(
         parseFloat(this.element.getAttribute("data-x")),
         parseFloat(this.element.getAttribute("data-y")),
         parseFloat(this.element.getAttribute("data-z")));
   }
}

function addMouseControl(canvas: HTMLCanvasElement, camera: THREE.Camera){
   let rotationX = 0;
   let rotationY = 0;

   let dragging = false;
   let pos = {
      x: 0,
      y: 0
   }

   let mouseDown = (event: MouseEvent) => {
      dragging = true;

      pos.x = event.clientX;
      pos.y = event.clientY;
   }
   let mouseUp = (event: MouseEvent) => {
      dragging = false;

      pos.x = event.clientX;
      pos.y = event.clientY;
   }

   let mouseMove = (event: MouseEvent) => {
      let deltaX = pos.x - event.clientX;
      let deltaY = pos.y - event.clientY;

      if(dragging){
         rotationY -= deltaX / 400;
         rotationX -= deltaY / 400;

         camera.quaternion.setFromEuler(new THREE.Euler(rotationX, rotationY, 0, 'YXZ'));
      }

      pos.x = event.clientX;
      pos.y = event.clientY;
   };

   canvas.addEventListener("mousedown", mouseDown);
   canvas.addEventListener("mouseup", mouseUp);
   canvas.addEventListener("mousemove", mouseMove);


}

document.addEventListener("DOMContentLoaded", ()=>{
   let canvas = document.getElementById("canvas") as HTMLCanvasElement;
   canvas.width = canvas.offsetWidth;
   canvas.height = canvas.offsetHeight;
   
   // ======================================== //
   // Settingup THREE.js
   // ======================================== //
   let scene = new THREE.Scene();
   let camera = new THREE.PerspectiveCamera( 60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000 );

   let renderer = new THREE.WebGLRenderer({
      canvas: canvas
   });
   
   // ======================================== //
   // Setting up pannorama
   // ======================================== //
   var texture = new THREE.TextureLoader().load( "assets/img/panorama.jpg");
   texture.wrapS = THREE.RepeatWrapping;
   texture.wrapT = THREE.RepeatWrapping;
   
   let material = new THREE.MeshBasicMaterial( { map: texture } );
   
   // Load the obj file
   const loader = new OBJLoader();
   loader.load(
      '/assets/models/sphere.obj',
      (object) => {
         let mesh = object.children[0] as any;
         mesh.material = material;
         scene.add( mesh );
      }
   );
   
   // ======================================== //
   // Get all the hotspoints/pointers
   // ======================================== //
   let pointers: Pointer[] = [];

   document.querySelectorAll("[data-pointer]").forEach(pointer => {
      pointers.push(new Pointer(pointer as HTMLElement));
   });

   // ======================================== //
   // Add mouse controls (todo add drag finger controls)
   // ======================================== //
   addMouseControl(canvas, camera);

   // ======================================== //
   // Animate
   // ======================================== //
   let animate = () => {
      // Render and request more
      requestAnimationFrame(animate);
      renderer.render(scene, camera);

      // Find the camera forward vector
      let cameraVector = new Vector3(0,0,-1).applyQuaternion(camera.quaternion);

      if(DEBUG_SHOW_CAMERA_CHOORDS){
         console.log("forward:" + cameraVector.x + ", " + cameraVector.y + ", " + cameraVector.z);
      }

      // Update the hotspots/pointers
      pointers.forEach(pointer => {

         // Project the pointer position on the camera plane
         let newPos = pointer.position.clone().project(camera);


         // If the hotspot is behind us, don't display it
         if(pointer.position.dot(cameraVector) < 0){
            pointer.element.style.display = "none";
            return;
         }else{
            pointer.element.style.display = "block";
         }

         // Set the position correctly (the pos is normalized from -1 to 1 and our output mapping is from 0 to canvas.width or canvas.height)
         pointer.element.style.left = ((newPos.x + 1) / 2 * canvas.width) + "px";
         pointer.element.style.top = ((-newPos.y + 1) / 2 * canvas.height) + "px";
      });
   }

   // Call the initial animate
   animate();
});
