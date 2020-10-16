import { Camera, Euler, Vector2 } from "three";

const minRotation = -Math.PI / 2;
const maxRotation = Math.PI / 2;

function lerp(a: number, b: number, f: number){
   return a + (b - a) * f;
}

export class NotOrbitControls{
   rotationX: number = 0;
   rotationY: number = 0;
   velocityX: number = 0;
   velocityY: number = 0;

   mouseDragging: boolean;
   mousePosition: Vector2;

   canvas: HTMLCanvasElement;
   camera: Camera;

   _mouseDownListener: any;
   _mouseUpListener: any;
   _mouseMoveListener: any;
   _mouseLeaveListener: any;

   _touchStartListener : any;
   _touchEndListener : any;
   _touchMoveListener : any;
   _touchCancelListener : any;
   
   touchID: number;
   touchPosition: Vector2;

   _requestedAnimationFrame: number;

   constructor(canvas: HTMLCanvasElement, camera: Camera){
      // General settings
      this.canvas = canvas;
      this.camera = camera;

      // Rotation
      this.rotationX = 0;
      this.rotationY = 0;
      
      // Velocity
      this.velocityX = 0;
      this.velocityY = 0;

      // Mouse controlls
      this.mouseDragging = false;
      this.mousePosition = new Vector2();
      
      // touch controls
      this.touchID = -1;
      this.touchPosition = new Vector2();

      // Mouse listeners
      this._mouseDownListener = this.mouseDown.bind(this);
      this._mouseUpListener = this.mouseUp.bind(this);
      this._mouseMoveListener = this.mouseMove.bind(this);
      this._mouseLeaveListener = this.mouseLeave.bind(this);
      
      // Touch listeners
      this._touchStartListener = this.touchStart.bind(this);
      this._touchEndListener = this.touchEnd.bind(this);
      this._touchMoveListener = this.touchMove.bind(this);
      this._touchCancelListener = this.touchCancel.bind(this);

      // Animation
      this._requestedAnimationFrame = -1;
   }

   mount(){
      this.canvas.addEventListener("mousedown", this._mouseDownListener);
      this.canvas.addEventListener("mouseup", this._mouseUpListener);
      this.canvas.addEventListener("mousemove", this._mouseMoveListener);
      this.canvas.addEventListener("mouseleave", this._mouseLeaveListener);
      
      this.canvas.addEventListener("touchstart", this._touchStartListener);
      this.canvas.addEventListener("touchend", this._touchEndListener);
      this.canvas.addEventListener("touchmove", this._touchMoveListener);
      this.canvas.addEventListener("touchcancel", this._touchCancelListener);
   }

   unmount(){
      this.canvas.removeEventListener("mousedown", this._mouseDownListener);
      this.canvas.removeEventListener("mouseup", this._mouseUpListener);
      this.canvas.removeEventListener("mousemove", this._mouseMoveListener);
      this.canvas.removeEventListener("mouseleave", this._mouseLeaveListener);
      
      this.canvas.removeEventListener("touchstart", this._touchStartListener);
      this.canvas.removeEventListener("touchend", this._touchEndListener);
      this.canvas.removeEventListener("touchmove", this._touchMoveListener);
      this.canvas.removeEventListener("touchcancel", this._touchCancelListener);
   }

   // ====================================== //
   // Mouse Events
   // ====================================== //
   mouseDown(event: MouseEvent){
      this.mouseDragging = true;

      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
   }
   mouseUp(event: MouseEvent){
      this.mouseDragging = false;

      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;

      this._requestAnimationFrame();
   }
   mouseLeave(event: MouseEvent){
      this.mouseDragging = false;

      let deltaX = this.mousePosition.x - event.clientX;
      let deltaY = this.mousePosition.y - event.clientY;

      if(this.mouseDragging){
         this.rotate(-deltaY / this.sensitivity, -deltaX / this.sensitivity);      
      }

      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;

      this._requestAnimationFrame();
   }
   mouseMove(event: MouseEvent){
      let deltaX = this.mousePosition.x - event.clientX;
      let deltaY = this.mousePosition.y - event.clientY;

      if(this.mouseDragging){
         this.rotate(-deltaY / this.sensitivity, -deltaX / this.sensitivity);      
      }

      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
   }

   // ====================================== //
   // Touch events
   // ====================================== //
   touchStart(event: TouchEvent){
      event.preventDefault();

      if(this.touchID > 0) return;

      if(event.changedTouches.length === 0) return;

      let touch = event.changedTouches[0];
      
      this.touchID = touch.identifier;
      this.touchPosition.x = touch.clientX;
      this.touchPosition.y = touch.clientY;
   }
   touchEnd(event: TouchEvent){
      event.preventDefault();
      
      for(let i = 0; i < event.changedTouches.length; i++){
         let touch = event.changedTouches[i];

         if(touch.identifier !== this.touchID) break;

         let deltaX = this.touchPosition.x - touch.clientX;
         let deltaY = this.touchPosition.y - touch.clientY;

         this.rotate(-deltaY / this.sensitivity, -deltaX / this.sensitivity);

         this.touchID = -1;
         this.touchPosition.x = touch.clientX;
         this.touchPosition.y = touch.clientY;
      }
   }
   touchMove(event: TouchEvent){
      event.preventDefault();
      
      for(let i = 0; i < event.changedTouches.length; i++){
         let touch = event.changedTouches[i];

         if(touch.identifier !== this.touchID) break;

         let deltaX = this.touchPosition.x - touch.clientX;
         let deltaY = this.touchPosition.y - touch.clientY;

         this.rotate(-deltaY / this.sensitivity, -deltaX / this.sensitivity);

         this.touchPosition.x = touch.clientX;
         this.touchPosition.y = touch.clientY;
      }
   }
   touchCancel(event: TouchEvent){
      event.preventDefault();
      
      for(let i = 0; i < event.changedTouches.length; i++){
         let touch = event.changedTouches[i];

         if(touch.identifier !== this.touchID) break;

         this.touchID = -1;
      }
   }

   // ====================================== //
   // Rotate, apply and animate
   // ====================================== //
   rotate(deltaX: number, deltaY: number){
      this.rotationX += deltaX;
      this.rotationY += deltaY;

      if(deltaX > 0) this.velocityX = Math.max(this.velocityX, deltaX);
      if(deltaX < 0) this.velocityX = Math.min(this.velocityX, deltaX);

      if(deltaY > 0) this.velocityY = Math.max(this.velocityY, deltaY);
      if(deltaY < 0) this.velocityY = Math.min(this.velocityY, deltaY);
      
      this.velocityX = lerp(this.velocityX, deltaX, 0.1);
      this.velocityY = lerp(this.velocityY, deltaY, 0.1);
      
      this.apply();
      this._requestAnimationFrame();
   }
   apply(){
      if(this.rotationX > maxRotation) this.rotationX = maxRotation;
      if(this.rotationX < minRotation) this.rotationX = minRotation;

      this.camera.quaternion.setFromEuler(new Euler(this.rotationX, this.rotationY, 0, 'YXZ'));
   }
   animate(){
      if(this.touchID < 0 && !this.mouseDragging){
         this.rotationX += this.velocityX;
         this.rotationY += this.velocityY;
         
         this.apply();
      }

      this.velocityX /= 1.08;
      this.velocityY /= 1.08;

      let velocityLength = this.velocityX * this.velocityX + this.velocityY * this.velocityY;

      if(velocityLength > 0.00000001){
         this._requestAnimationFrame();
      }else{
         console.log("done!");
      }
   }

   // ====================================== //
   // Helper functions
   // ====================================== //
   _animate(){
      this._requestedAnimationFrame = -1;
      this.animate();
   }
   _requestAnimationFrame(){
      if(this._requestedAnimationFrame >= 0) return;

      this._requestedAnimationFrame = requestAnimationFrame(this._animate.bind(this));
   }
   _cancelAnimationFrame(){
      cancelAnimationFrame(this._requestedAnimationFrame);
   }

   // ====================================== //
   // Sensitivy settings
   // ====================================== //
   get sensitivity(){
      return this.canvas.height;
   }
}