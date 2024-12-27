import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import axios from 'axios';

function App() {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Prevent scrolling
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    // Set up the scene
    const scene = new THREE.Scene();

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf8f0e3); // Light cream background
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting (soft and warm feel)
    const ambientLight = new THREE.AmbientLight(0xf0e1d6, 1.5); // Soft warm ambient light
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(0xffa0b0, 2, 50); // Soft pink point light
    pinkLight.position.set(-5, 5, 5);
    scene.add(pinkLight);

    const softGreenLight = new THREE.PointLight(0xa8f0a1, 2, 50); // Soft green light
    softGreenLight.position.set(5, -5, 5);
    scene.add(softGreenLight);

    // Load the .glb model
    const loader = new GLTFLoader();
    loader.load(
      'models/dragon.glb',
      (gltf) => {
        const model = gltf.scene;
    
        // Fix orientation and scale
        model.rotation.y = Math.PI; // Rotate to face forward
        model.scale.set(0.5, 0.5, 0.5); // Reduced scale
        model.position.set(0, -1.5, 0); // Center the model
    
        scene.add(model);
        modelRef.current = model; // Reference the model
    
        console.log('Model loaded:', model); // Log model loading
      },
      undefined,
      (error) => {
        console.error('An error occurred loading the model:', error);
      }
    );
    

    // Handle mouse movement to rotate the model
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1; // NDC for x
      const y = -(event.clientY / window.innerHeight) * 2 + 1; // NDC for y

      if (modelRef.current) {
        // Rotate the model around x and y axes
        modelRef.current.rotation.y = x * Math.PI; // Rotate based on horizontal movement
        modelRef.current.rotation.x = y * Math.PI * 0.5; // Rotate based on vertical movement
      } else {
        console.log('Model is not loaded yet.');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle resizing the window
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Fetch motivational quote from OpenAI API
  const fetchQuote = async () => {
    console.log('Fetching quote...');
    try {
      const response = await axios.post(
        'https://api.openrouter.ai/v1/completions',
        {
          prompt: "Generate a motivational quote that is sweet and kind, suitable for Ellen.",
          max_tokens: 50,
          temperature: 0.7,
          n: 1,
          stop: null,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      console.log('Fetched quote:', response.data.choices[0].text.trim());
      setQuote(response.data.choices[0].text.trim());
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote("You are stronger than you think, Ellen. Keep shining!");
    }
  };

  // Fetch quote every 1 minute
  useEffect(() => {
    fetchQuote(); // Initial fetch on mount
    const intervalId = setInterval(fetchQuote, 60000); // Fetch quote every 1 minute (60,000 ms)

    return () => {
      clearInterval(intervalId); // Clean up the interval on unmount
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: '#f8f0e3', // Soft background color
        position: 'relative',
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          padding: '10px 20px',
          background: '#f9c9b6', // Soft peach
          color: '#fff',
          fontFamily: 'Cursive',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textTransform: '',
            letterSpacing: '1px',
          }}
        >
          A Sweet Dragon for Ellen
        </div>
      </nav>

      {/* Motivational Quote */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          fontSize: '1.5rem',
          fontFamily: 'Cursive',
          textShadow: '0 0 10px #ff80bf, 0 0 20px #99ffcc',
          zIndex: 5,
          textAlign: 'center',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '10px',
        }}
      >
        {quote}
      </div>

      {/* 3D Canvas */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      ></div>
    </div>
  );
}

export default App;
