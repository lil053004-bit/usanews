let scene, camera, renderer, particles, lines;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThreeBackground() {
    const container = document.getElementById('three-container');

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    createParticles();
    createLines();
    createFloatingNumbers();

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    animate();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    const particleCount = 1500;

    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;

        vertices.push(x, y, z);

        const color = new THREE.Color();
        if (Math.random() > 0.7) {
            color.setHSL(0.29, 0.45, 0.55);
        } else if (Math.random() > 0.4) {
            color.setHSL(0.32, 0.5, 0.6);
        } else {
            color.setHSL(0.27, 0.4, 0.5);
        }
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createLines() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    const lineCount = 100;

    for (let i = 0; i < lineCount; i++) {
        const x1 = Math.random() * 2000 - 1000;
        const y1 = Math.random() * 2000 - 1000;
        const z1 = Math.random() * 1000 - 500;

        const x2 = x1 + (Math.random() * 200 - 100);
        const y2 = y1 + (Math.random() * 200 - 100);
        const z2 = z1 + (Math.random() * 200 - 100);

        vertices.push(x1, y1, z1);
        vertices.push(x2, y2, z2);

        const color = new THREE.Color();
        color.setHSL(0.29 + Math.random() * 0.06, 0.45, 0.5);
        colors.push(color.r, color.g, color.b);
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
    });

    lines = new THREE.LineSegments(geometry, material);
    scene.add(lines);
}

function createFloatingNumbers() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;

    const stocks = ['AAPL', 'TSLA', 'NVDA', 'GOOGL', 'AMZN', 'MSFT'];
    const numberCount = 50;

    for (let i = 0; i < numberCount; i++) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = 'Bold 22px Arial';
        context.fillStyle = Math.random() > 0.5 ? '#90c98b' : '#6fb368';

        const stock = stocks[Math.floor(Math.random() * stocks.length)];
        const change = (Math.random() * 10 - 5).toFixed(2);
        const sign = change > 0 ? '+' : '';
        context.fillText(`${stock} ${sign}${change}%`, 5, 35);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
        });

        const sprite = new THREE.Sprite(material);
        sprite.position.set(
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000,
            Math.random() * 1000 - 500
        );
        sprite.scale.set(150, 75, 1);

        sprite.userData.velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.5
        };

        scene.add(sprite);
    }
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.5;
    mouseY = (event.clientY - windowHalfY) * 0.5;
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0001;

    if (particles) {
        particles.rotation.x = time * 0.1;
        particles.rotation.y = time * 0.15;

        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i]) * 0.3;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    if (lines) {
        lines.rotation.x = time * 0.05;
        lines.rotation.y = time * 0.08;
    }

    scene.children.forEach(child => {
        if (child instanceof THREE.Sprite && child.userData.velocity) {
            child.position.x += child.userData.velocity.x;
            child.position.y += child.userData.velocity.y;
            child.position.z += child.userData.velocity.z;

            if (child.position.x > 1000 || child.position.x < -1000) child.userData.velocity.x *= -1;
            if (child.position.y > 1000 || child.position.y < -1000) child.userData.velocity.y *= -1;
            if (child.position.z > 500 || child.position.z < -500) child.userData.velocity.z *= -1;
        }
    });

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeBackground);
} else {
    initThreeBackground();
}
