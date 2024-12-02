import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { v4 as uuidv4 } from "uuid"; // Import uuid4 (v4)
import { OrbitControls } from "@react-three/drei"; // Import OrbitControls
import * as THREE from "three"; // For using Shape and ExtrudeGeometry

const ARM_RADIUS = 2.7; // Approximate radius for horizontal calculation (fog water line)
const ROTATION_SPEED = 0.10;
const INIT_BALL_POSITION = new THREE.Vector3(2.7, 10.1, 2.4);

const BallLauncherFixture: React.FC = () => {
  // State to track whether the arm should rotate
  const [isRotating, setIsRotating] = useState(false);
  const [ballThrown, setBallThrown] = useState(false); // Track if the ball was thrown

  // Function to toggle the rotation
  const toggleRotation = () => {
    setIsRotating((prev) => !prev);
  };

  return (
    <>
      <Canvas
        camera={{
          position: [-20, 20, 20], // Move the camera farther back
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        style={{
          height: "100vh",
        }}
      >
        <BallLauncherScene
          isRotating={isRotating}
          ballThrown={ballThrown}
          setBallThrown={setBallThrown}
        />
      </Canvas>

      {/* Button to throw the ball */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
        }}
      >
        {/* Button to toggle rotation */}
        <button
          onClick={toggleRotation}
          style={{
            padding: "10px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isRotating ? "Stop Rotation" : "Start Rotation"}
        </button>
        {/* Button to throw the ball */}
        <button
          style={{
            padding: "10px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            marginLeft: "12px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
        <button
          onClick={() => setBallThrown(true)}
          style={{
            padding: "10px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            marginLeft: "12px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Throw Ball
        </button>

        <button
          onClick={() => setBallThrown(true)}
          style={{
            padding: "10px",
            backgroundColor: "darkred",
            color: "white",
            border: "none",
            marginLeft: "12px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Speed up
        </button>

        <button
          onClick={() => setBallThrown(true)}
          style={{
            padding: "10px",
            backgroundColor: "darkgreen",
            color: "white",
            border: "none",
            marginLeft: "12px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Speed down
        </button>
      </div>
    </>
  );
};

// A separate component for rendering the BallLauncher scene
const BallLauncherScene: React.FC<{
  isRotating: boolean;
  ballThrown: boolean;
  setBallThrown: (thrown: boolean) => void;
}> = ({ isRotating, ballThrown, setBallThrown }) => {
  const part1Ref = useRef<Mesh>(null);
  const part2Ref = useRef<Mesh>(null);
  const axisRef = useRef<Mesh>(null); // Reference for the axis
  const armRef = useRef<Mesh>(null); // Reference for the arm
  const armPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0)); // Reference for the arm
  const groupRef = useRef<THREE.Group>(null); // Reference for the group containing axis and arm
  const ballRef = useRef<Mesh>(null); // Reference for the ball

  const [velocity, setVelocity] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 0, 0)
  ); // Initial velocity
  const [gravity, setGravity] = useState<THREE.Vector3>(
    new THREE.Vector3(0, -9.8, 0)
  );
  const [position, setPosition] = useState<THREE.Vector3>(INIT_BALL_POSITION); // Ball position

  // Create half circle shape (filled) for extrude geometry
  const createHalfCircleShape = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); // Move to the origin
    shape.arc(0, 0, 0.5, 0, Math.PI, false); // Half circle arc
    return shape;
  };

  const halfCircleGeometry = new THREE.ExtrudeGeometry(
    createHalfCircleShape(),
    {
      depth: 0.2, // Depth of the extrusion
      bevelEnabled: false,
    }
  );

  // Animation: Rotate the arm around the axis when isRotating is true
  // useFrame(() => {
  //   if (groupRef.current && isRotating) {
  //     groupRef.current.rotation.z += 0.03; // Speed of rotation can be adjusted here
  //   }

  //   // If the ball has been thrown, update its position based on velocity and gravity
  //   if (ballThrown && ballRef.current) {
  //     const deltaTime = 0.016; // Simulating a frame time of 16ms (60fps)
  //     const gravity = new THREE.Vector3(0, -9.8, 0); // Gravity vector
  //     setVelocity((prevVelocity) => {
  //       return prevVelocity.add(gravity.multiplyScalar(deltaTime));
  //     });

  //     setPosition((prevPosition) => {
  //       return prevPosition.add(velocity.clone().multiplyScalar(deltaTime));
  //     });

  //     // Check if the ball has hit the ground (Y <= 0)
  //     if (position.y <= 0) {
  //       setBallThrown(false); // Stop the ball once it hits the ground
  //     }
  //   }
  // });
  useEffect(() => {
    // let launchSpeed = ARM_RADIUS * Math.tan(ROTATION_SPEED);
    let launchSpeed = 0;
    if(isRotating && groupRef.current)
      launchSpeed = 10;
    let launchGravity = launchSpeed*launchSpeed/ARM_RADIUS;
    if (ballThrown && groupRef.current) {
      const launchAngle = - groupRef.current.rotation.z;
      // setGravity(
      //   new THREE.Vector3(
      //     launchGravity * Math.cos(launchAngle),
      //     -9.8 + launchGravity * Math.sin(launchAngle),
      //     0
      //   )
      // );
      const initialVelocity = new THREE.Vector3(
        launchSpeed * Math.cos(launchAngle + Math.PI / 2),
        // launchSpeed * Math.cos(launchAngle),
        launchSpeed * Math.sin(launchAngle + Math.PI / 2),
        0 // Assume no motion along Z-axis
      );
      setVelocity(initialVelocity); // Set initial velocity
    }
  }, [groupRef, ballThrown]);

  useFrame(() => {
    const deltaTime = 0.016; // Frame time (approx. 60 FPS)

    if (isRotating && groupRef.current) {
      groupRef.current.rotation.z -= ROTATION_SPEED; // Adjust rotation speed as needed
      if (!ballThrown) {
        const angleInRadians = -groupRef.current.rotation.z + 0.04;
        groupRef.current.getWorldPosition(armPositionRef.current);

        const offset1 = Math.cos(angleInRadians) * ARM_RADIUS;
        const offset2 = Math.sin(angleInRadians) * ARM_RADIUS;
        const armBasePosition = armPositionRef.current;
        setPosition(
          (prev) =>
            new THREE.Vector3(
              armBasePosition.x + offset1,
              armBasePosition.y + offset2,
              prev.z
            )
        );
      }
    }

    if (ballThrown && ballRef.current) {
      // Launch the ball with an initial velocity
      if (velocity.length() === 0) {
        const initialVelocity = new THREE.Vector3(
          0,
          // launchSpeed * Math.cos(launchAngle),
          0,
          0 // Assume no motion along Z-axis
        );
        setVelocity(initialVelocity); // Set initial velocity
      }

      // Apply gravity to the velocity
      setVelocity((prevVelocity) =>
        prevVelocity.add(gravity.clone().multiplyScalar(deltaTime))
      );

      // Update the ball's position based on velocity
      setPosition((prevPosition) =>
        prevPosition.add(velocity.clone().multiplyScalar(deltaTime))
      );

      // Update ball position in the mesh
      ballRef.current.position.copy(position);

      // Reset if the ball hits the ground
      if (position.y <= 0) {
        setBallThrown(false); // Stop updating the ball's motion
        setPosition(INIT_BALL_POSITION); // Reset to initial position
        setVelocity(new THREE.Vector3(0, 0, 0)); // Reset velocity
      }
    }
  });

  return (
    <>
      {/* OrbitControls for dragging and rotating the scene */}
      <OrbitControls />
      {/* Lighting */}
      <ambientLight intensity={0.5} /> {/* Soft ambient light */}
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <axesHelper args={[100]} /> {/* Size of the axes helper */}
      {/* Directional light */}
      {/* Part 1: Rounded Rectangle with Projections */}
      <group position={[0, 10, 0.2]} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
        <mesh ref={part1Ref} key={uuidv4()}>
          <boxGeometry args={[2, 0.2, 1]} /> {/* Main body of part 1 */}
          <meshStandardMaterial color="darkgray" />
        </mesh>

        {/* Half Circles on each side of Part 1 */}
        <mesh position={[-1, 0.1, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <bufferGeometry attach="geometry" {...halfCircleGeometry} />
          <meshStandardMaterial color="darkgray" />
        </mesh>
        <mesh
          position={[1, -0.1, 0]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        >
          <bufferGeometry attach="geometry" {...halfCircleGeometry} />
          <meshStandardMaterial color="darkgray" />
        </mesh>

        {/* Part 2: Cylinder (Fitting Pillar) */}
        <mesh ref={part2Ref} position={[0, 1, 0]} key={uuidv4()}>
          <cylinderGeometry args={[0.45, 0.45, 2]} /> {/* Cylinder (Part 2) */}
          <meshStandardMaterial color="darkgray" />
        </mesh>

        {/* Axis at the top of the pillar */}
        <mesh ref={axisRef} position={[0, 2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          {/* Thin cylinder for the axis */}
          <meshStandardMaterial color="red" />
        </mesh>

        {/* Group for the rotating arm */}
        <group position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          {/* Arm rotation happens here */}
          <group ref={groupRef}>
            <mesh ref={armRef} position={[0, 1.3, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.3 + ARM_RADIUS]} />
              {/* Thin cylinder for the arm */}
              <meshStandardMaterial color="white" />
            </mesh>
          </group>
        </group>
      </group>
      {/* Ball at the edge of the arm */}
      <mesh ref={ballRef} position={position.toArray()}>
        <sphereGeometry args={[0.08, 16, 16]} /> {/* Ball at the edge */}
        <meshStandardMaterial color="red" />
      </mesh>
      {/* Wall (Background) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="lightgray" side={2} />
        <planeGeometry args={[100, 100]} /> {/* Plane wall */}
      </mesh>
      {/* Floor (Background) */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="darkgray" side={2} />
        <planeGeometry args={[100, 100]} /> {/* Plane wall */}
      </mesh>
    </>
  );
};

export default BallLauncherFixture;
