import { NotOrbitControls } from "Panorama/NotOrbitControls";
import { Panorama } from "Panorama/Panorama";
import * as THREE from "three";
import { TextureDataType, Vector2, Vector3, Vector4 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';


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

// function addMouseControl(canvas: HTMLCanvasElement, camera: THREE.Camera){
//    let rotationX = 0;
//    let rotationY = 0;

//    let dragging = false;
//    let pos = {
//       x: 0,
//       y: 0
//    }

//    let mouseDown = (event: MouseEvent) => {
//       dragging = true;

//       pos.x = event.clientX;
//       pos.y = event.clientY;
//    }
//    let mouseUp = (event: MouseEvent) => {
//       dragging = false;

//       pos.x = event.clientX;
//       pos.y = event.clientY;
//    }

//    let mouseMove = (event: MouseEvent) => {
//       let deltaX = pos.x - event.clientX;
//       let deltaY = pos.y - event.clientY;

//       if(dragging){
//          rotationY -= deltaX / 400;
//          rotationX -= deltaY / 400;

//          if(rotationX > Math.PI / 2) rotationX = Math.PI / 2;
//          if(rotationX < -Math.PI / 2) rotationX = -Math.PI / 2;

//          camera.quaternion.setFromEuler(new THREE.Euler(rotationX, rotationY, 0, 'YXZ'));
//       }

//       pos.x = event.clientX;
//       pos.y = event.clientY;
//    };

//    canvas.addEventListener("mousedown", mouseDown);
//    canvas.addEventListener("mouseup", mouseUp);
//    canvas.addEventListener("mousemove", mouseMove);
// }

// function addTouchControl(canvas: HTMLCanvasElement, camera: THREE.Camera){
//    let rotationX = 0;
//    let rotationY = 0;

//    let id = 0;
//    let dragging = false;
//    let pos = {
//       x: 0,
//       y: 0
//    }

//    let touchDown = (event: TouchEvent) => {
//       dragging = true;

//       let touches = event.changedTouches;

//       for(let i = 0; i < touches.length; i++){

//       }

//       pos.x = event.clientX;
//       pos.y = event.clientY;
//    }
//    let touchUp = (event: TouchEvent) => {
//       dragging = false;

//       pos.x = event.clientX;
//       pos.y = event.clientY;
//    }

//    let touchMove = (event: TouchEvent) => {
//       let deltaX = pos.x - event.clientX;
//       let deltaY = pos.y - event.clientY;

//       if(dragging){
//          rotationY -= deltaX / 400;
//          rotationX -= deltaY / 400;

//          if(rotationX > Math.PI / 2) rotationX = Math.PI / 2;
//          if(rotationX < -Math.PI / 2) rotationX = -Math.PI / 2;

//          camera.quaternion.setFromEuler(new THREE.Euler(rotationX, rotationY, 0, 'YXZ'));
//       }

//       pos.x = event.clientX;
//       pos.y = event.clientY;
//    };

//    canvas.addEventListener("mousedown", mouseDown);
//    canvas.addEventListener("mouseup", mouseUp);
//    canvas.addEventListener("mousemove", mouseMove);
// }

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
   let texture = new THREE.TextureLoader().load( "assets/img/panorama.jpg");
   texture.wrapS = THREE.RepeatWrapping;
   texture.wrapT = THREE.RepeatWrapping;

   let panorama = new Panorama(renderer, texture);
   panorama.addToScene(scene);
   
   // let material = new THREE.MeshBasicMaterial( { map: texture } );
   
   // // Load the obj file
   // const loader = new OBJLoader();
   // loader.load(
   //    '/assets/models/sphere.obj',
   //    (object) => {
   //       let mesh = object.children[0] as any;
   //       mesh.material = material;
   //       scene.add( mesh );
   //    }
   // );
   
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
   // addMouseControl(canvas, camera);
   let controls = new NotOrbitControls(canvas, camera);
   controls.mount();

   // ======================================== //
   // Animate
   // ======================================== //
   let animate = () => {
      // Render and request more
      requestAnimationFrame(animate);
      renderer.render(scene, camera);

      // Find the camera forward vector
      let cameraVector = new Vector3(0,0,-1).applyQuaternion(camera.quaternion);

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
         
         newPos.z = 0;
         // console.log(newPos.length());
         pointer.element.classList.toggle("close", newPos.length() < 0.4);

         // Set the position correctly (the pos is normalized from -1 to 1 and our output mapping is from 0 to canvas.width or canvas.height)
         pointer.element.style.left = ((newPos.x + 1) / 2 * canvas.width) + "px";
         pointer.element.style.top = ((-newPos.y + 1) / 2 * canvas.height) + "px";
      });
   }

   // Call the initial animate
   animate();
});
