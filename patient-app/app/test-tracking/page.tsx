'use client';

import { useState, useEffect } from 'react';

export default function TestTracking() {
  const [status, setStatus] = useState('Loading...');
  const [tfLoaded, setTfLoaded] = useState(false);

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        setStatus('Loading TensorFlow.js...');
        const tf = await import('@tensorflow/tfjs');
        console.log('TF loaded:', tf);
        setTfLoaded(true);
        setStatus('TensorFlow.js loaded successfully!');
        
        setStatus('Loading PoseNet...');
        const posenet = await import('@tensorflow-models/posenet');
        console.log('PoseNet loaded:', posenet);
        setStatus('PoseNet loaded successfully!');
        
        setStatus('Loading model...');
        const net = await posenet.load({
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: { width: 640, height: 480 },
          multiplier: 0.75,
        });
        console.log('Model loaded:', net);
        setStatus('✅ All libraries loaded successfully! Pose tracking should work.');
        
      } catch (error) {
        console.error('Error loading libraries:', error);
        setStatus(`❌ Error: ${(error as Error).message}`);
      }
    };

    loadLibraries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-white mb-6">TensorFlow.js Test</h1>
        <div className="space-y-4">
          <div className={`p-4 rounded ${tfLoaded ? 'bg-green-900' : 'bg-blue-900'}`}>
            <p className="text-white font-mono">{status}</p>
          </div>
          {tfLoaded && (
            <div className="mt-6">
              <a 
                href="/debug" 
                className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Test Pose Tracking
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}