import { Camera, Geometry, Material, Mesh, MeshBasicMaterial, Object3D, Scene, Sphere, SphereGeometry, Texture, Vector2, Vector3, Vector4, VertexColors, WebGLRenderer } from "three";
import * as THREE from "three";

export class Hotspot{
   element: HTMLElement;
   position: THREE.Vector3;

   constructor(element: HTMLElement, position: Vector3){
      this.element = element;
      this.position = position;
   }
}

export class HotspotPrefab{
   element: HTMLElement;

   constructor(element: HTMLElement){
      this.element = element;
   }

   create(position: Vector3) : Hotspot{
      return new Hotspot(this.element.cloneNode(true) as HTMLElement, position);
   }
}

export class Panorama{
   private hotspots: Hotspot[];
   private renderer: WebGLRenderer;
   private texture: Texture;

   private material: Material;
   private mesh: Mesh;

   constructor(renderer: WebGLRenderer, texture: Texture){
      this.hotspots = [];
      this.renderer = renderer;
      

      this.texture = texture;
      this.material = new MeshBasicMaterial( { map: texture, side: THREE.FrontSide } );
      this.mesh = new Mesh(new SphereGeometry(100, 64, 64), this.material);
      
      this.setupUVS();
   }

   addToScene(scene: Scene){
      scene.add(this.mesh);
   }

   addHotspot(hotspot: Hotspot){
      this.hotspots.push(hotspot);
   }

   update(camera: Camera){
      let width = this.renderer.domElement.offsetWidth;
      let height = this.renderer.domElement.offsetHeight;

      // Find the camera forward vector
      let cameraVector = new Vector3(0,0,-1).applyQuaternion(camera.quaternion);

      // Update the hotspots/pointers
      this.hotspots.forEach(hotspot => {
         // Project the pointer position on the camera plane
         let newPos = hotspot.position.clone().project(camera);

         // If the hotspot is behind us, don't display it
         if(hotspot.position.dot(cameraVector) < 0){
            hotspot.element.style.display = "none";
            return;
         }else{
            hotspot.element.style.display = "block";
         }

         newPos.z = 0;

         console.log(newPos.length());

         hotspot.element.classList.toggle("close", newPos.length() < 0.5);

         // Set the position correctly (the pos is normalized from -1 to 1 and our output mapping is from 0 to canvas.width or canvas.height)
         hotspot.element.style.left = ((newPos.x + 1) / 2 * width) + "px";
         hotspot.element.style.top = ((-newPos.y + 1) / 2 * height) + "px";
      });
   }

   private setupUVS(){
      let geo = this.mesh.geometry as Geometry;


      for (var i = 0; i < geo.vertices.length; i++) {
         var vert = geo.vertices[i];
         vert.x = -vert.x;
      }
      
      geo.computeFaceNormals();
      geo.computeVertexNormals();

      geo.elementsNeedUpdate = true;
   }
}