import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Environment, OrbitControls } from '@react-three/drei';

function AnimatedOrb() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Sphere ref={ref} args={[1.5, 128, 128]}>
      <MeshDistortMaterial
        color="#000000"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.1}
        metalness={0.9}
        emissive="#000000"
        emissiveIntensity={0.2}
        clearcoat={1}
      />
    </Sphere>
  );
}

export default function AvatarSection() {
  return (
    <section className="py-32 bg-white border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
         <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
               <div className="aspect-square bg-neutral-50 rounded-[40px] overflow-hidden border border-neutral-100 relative group">
                  <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
                     <img src="/avatar.png" className="w-full h-full object-cover" alt="Aura Assistant" />
                  </div>
                  
                  <div className="absolute bottom-10 left-10 z-30">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Virtual Assistant</p>
                     <p className="text-xl font-bold text-black flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Aura is Online
                     </p>
                  </div>
               </div>
            </div>
 
            <div className="order-1 lg:order-2 space-y-10 animate-fade-up">
               <div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight tracking-tight mb-6">
                    Talk to Aura <br/>
                    <span className="text-neutral-400">to book now</span>
                  </h2>
                  <p className="text-lg text-neutral-500 leading-relaxed font-medium">
                    Our AI assistant makes scheduling effortless. Simply speak or type to find the perfect time for your next appointment.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-10 pt-10 border-t border-neutral-100">
                  <div>
                    <p className="text-2xl font-bold text-black">Fast</p>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-2">Instant Response</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black">Easy</p>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-2">Simple Interface</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </section>
  );
}
