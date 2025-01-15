import * as Three from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
let camera, scene, renderer, controls;
const canvas = document.getElementById('canvas')

import * as CANNON from 'cannon-es'
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // m/s²
world.broadphase = new CANNON.NaiveBroadphase(); // 碰撞检测
world.solver.iterations = 10; // 迭代次数
// 设置容器宽高
const pos = {
    width:canvas.offsetWidth,
    height:canvas.offsetHeight
}
// 创建一个场景  参数可选可不选
scene = new Three.Scene({
    antialias:true, // 抗锯齿
    powerPreference:'high-performance', // 性能优先
    alpha:true, // 不透明
    stencil:true, // 深度测试
    preserveDrawingBuffer:true, // 保留缓冲区
})

// 创建一个透视相机
camera = new Three.PerspectiveCamera(45, pos.width / pos.height, 0.1, 1000)
// 设置相机位置
camera.position.set(5, 5, 20)
// 把相机添加到场景中
scene.add(camera)
renderer = new Three.WebGPURenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( pos.width, pos.height );
// compute texture
renderer.renderAsync( scene, camera );
// 添加阴影
renderer.shadowMap.enabled = true;
// 阴影类型
renderer.shadowMap.type = Three.PCFSoftShadowMap; 

// 添加背景
renderer.setClearColor( 0xefefef, 1 );
canvas.appendChild( renderer.domElement );

// 创建一个控制器
controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 1 // 最小距离
controls.maxDistance = 50 // 最大距离
controls.enableDamping = true // 开启惯性
// 限制相机旋转角度 
// x轴的旋转角度 上下视角限制
controls.minPolarAngle = 0; // 俯视视角
controls.maxPolarAngle = Math.PI / 2; // 90度 正视视角
// y轴的旋转角度 左右视角限制
controls.minAzimuthAngle = -Infinity; // 左视 参数和x轴的参数相反
controls.maxAzimuthAngle = Infinity; // 右视


// 添加坐标系
const axesHelper = new Three.AxesHelper(5)
scene.add(axesHelper)

// // 创建一个立方体
// const geometry = new Three.BoxGeometry(3, 3, 3)
// // 创建一个材质 opacity透明度 transparent是否透明 wireframe: true 是否显示线框
// const material = new Three.MeshBasicMaterial({color: 0x0000ff,opacity:0.8,transparent:true})
// // 创建一个网格模型 把材质和几何体绑定到一起
// const mesh = new Three.Mesh(geometry, material)
// // 设置模型的位置
// mesh.position.set(0, 0, 0)
// // 把模型添加到场景中
// scene.add(mesh)


// // 创建一个平面几何体
// const geometry1 = new Three.PlaneGeometry(10, 10, 50, 50); // 较大的平面，50x50的细分

// // 获取顶点位置数据
// const positions = geometry1.attributes.position.array; // 获取顶点坐标数组

// // 修改顶点高度
// for (let i = 0; i < positions.length; i += 3) {
//     const x = positions[i]; // x坐标
//     const y = positions[i + 1]; // y坐标
//     positions[i + 2] = Math.sin(x * 0.3) + Math.cos(y * 0.3); // 根据x, y调整z坐标（高度）
// }

// // 创建材质并应用
// const material1 = new Three.MeshBasicMaterial({ color: 0x0077ff });
// const plane = new Three.Mesh(geometry1, material1);
// plane.rotation.x = -Math.PI / 2; // 使平面水平放置
// scene.add(plane);


// // 获取平面顶点坐标，用于创建物理体
// const vertices = [];
// for (let i = 0; i < positions.length; i += 3) {
//     const x = positions[i];
//     const y = positions[i + 1];
//     const z = positions[i + 2];
//     vertices.push(new CANNON.Vec3(x, y, z)); // 将顶点转换为Cannon.js的Vec3格式
// }
// // 创建物理地面（ConvexPolyhedron）
// const shape = new CANNON.ConvexPolyhedron({
//     vertices: vertices,
//     faces: [] // 后续计算面
// });
// // 计算面
// const faces = [];
// const numVertices = vertices.length;
// for (let i = 0; i < numVertices; i++) {
//     faces.push([i, (i + 1) % numVertices, (i + 2) % numVertices]); // 简单示例，创建一个三角面
// }


// // 使用计算出的面来创建物理体
// const groundMaterial = new CANNON.Material();
// const groundBody = new CANNON.Body({
//     mass: 0, // 地面通常是静态的，因此质量为0
//     position: new CANNON.Vec3(0, 0, 0),
//     material: groundMaterial
// });
// // groundBody.addShape(shape);
// // 旋转物理体，使其与Three.js中的平面对齐
// groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 旋转90度使平面垂直于X-Y平面
// // 将物理地面添加到物理世界
// world.addBody(groundBody);

//创建一个地面
const groundGeometry = new Three.PlaneGeometry(50, 50, 50, 50);
groundGeometry.rotateX(-Math.PI / 2); // 使平面水平放置
const groundMaterial = new Three.MeshStandardMaterial({ color: 0xeeeeee,side:Three.DoubleSide });
const groundMesh = new Three.Mesh(groundGeometry, groundMaterial);
// 添加阴影
groundMesh.receiveShadow = true; // 使地面投射阴影（需要光源开启阴影投射）
scene.add(groundMesh);
// 创建地面刚体
const groundShape = new CANNON.Plane(); // 创建平面形状
const groundBody = new CANNON.Body({
    mass: 0, // 质量为0，表示静态物体
    position: new CANNON.Vec3(0, 0, 0) // 设置地面位置在Three.js中的y轴下方（因为我们旋转了90度）
});
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 旋转90度使平面垂直于X-Y平面
world.addBody(groundBody);

let bolls = []
function addGround(){
    // 创建一个物体来测试物理碰撞
    const radius = Math.random() * 2;
    const sphereShape = new CANNON.Sphere(radius); // 创建一个球体
    const sphereBody = new CANNON.Body({
        mass: 1, // 球体有质量
        position: new CANNON.Vec3(Math.random() - 0.5, 10, Math.random() - 0.5) // 设置初始位置
    });
   
    sphereBody.addShape(sphereShape);
    world.addBody(sphereBody);

    // 创建球体网格（与物理球体对应）
    const sphereGeometry = new Three.SphereGeometry(radius);
    const sphereMaterial = new Three.MeshStandardMaterial({ color: 0x990000 });
    const sphereMesh = new Three.Mesh(sphereGeometry, sphereMaterial);
     // 添加阴影
    sphereMesh.castShadow = true; // 使球体投射阴影（需要光源开启阴影投射）
    scene.add(sphereMesh);
    bolls.push({sphereBody, sphereMesh})
}
addGround()


// 添加环境光
const ambientLight = new Three.AmbientLight(0xffffff,1); // 环境光
scene.add(ambientLight);
// 添加平行光
const directionalLight = new Three.DirectionalLight(0xffffff, 10); // 强光源照射效果更明显
directionalLight.position.set(10, 10, 10); // 设置光源位置
directionalLight.castShadow = true; // 开启阴影投射
// 设置阴影的分辨率（增加阴影的清晰度）
directionalLight.shadow.mapSize.width = 256;  // 默认512，增加为1024提高分辨率
directionalLight.shadow.mapSize.height = 256; // 默认512，增加为1024提高分辨率

// 设置阴影摄像机的视野范围
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
// directionalLight.shadow.camera.near = 0.1;  // 设置近裁剪面
// directionalLight.shadow.camera.far = 500;    // 设置远裁剪面

// 调整阴影偏移，避免接触阴影的瑕疵
const directionalLightHelper = new Three.DirectionalLightHelper(directionalLight, 2); // 光源辅助对象，用于调试
scene.add(directionalLight,directionalLightHelper);

// 添加一个点光源
const pointLight = new Three.PointLight(0xff0000, 10); // 点光源
pointLight.position.set(-3, 3, 3); // 设置点光源位置
pointLight.castShadow = true; // 开启阴影投射
const pointerLightHelper = new Three.PointLightHelper(pointLight, 1); // 点光源辅助对象，用于调试
scene.add(pointLight,pointerLightHelper);

const btn = document.createElement('button')
btn.onclick = function(){
    addGround()
}
btn.innerHTML = '添加球体'
btn.style.cssText = 'position:fixed;top:100px;left:10px;z-index:999;'
document.body.appendChild(btn)


// 创建默认材质
const defaultMaterial = new CANNON.Material('default')
// 默认材质碰撞后的物理属性
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 1.5, // 摩擦系数
    restitution: 0.5, // 弹性系数
})
// 物理属性添加到世界
world.addContactMaterial(defaultContactMaterial)
// 设置所有刚体的材质为默认材质
world.defaultContactMaterial = defaultContactMaterial


// 需要在window.requestAnimationFrame()中添加代码
function animate(){
    // 更新物理世界
    world.step(1 / 60); // 每60帧更新一次物理世界
    // 更新球体位置
    for(let i = 0;i < bolls.length;i++){
        bolls[i].sphereMesh.position.copy(bolls[i].sphereBody.position);
        bolls[i].sphereMesh.quaternion.copy(bolls[i].sphereBody.quaternion);
        // console.log(bolls[i].sphereMesh.position) // 打印球体位置信息
    }

    // if(sphereBody.position.y > 0){
    //     sphereMesh.position.copy(sphereBody.position);
    //     sphereMesh.quaternion.copy(sphereBody.quaternion);
    //     console.log(sphereMesh.position) // 打印球体位置信息
    // }


    // 更新Three.js平面的位置（根据物理地面同步）
    // 注意，这里简单示例中，我们没有使地面变动，因此不需要更新地面位置

    // 绕y轴旋转
    // mesh.position.x = Math.sin(Date.now() * 0.001) * 5
    // mesh.position.z = Math.cos(Date.now() * 0.001) * 5
    // 自转
    // mesh.rotation.y = Math.sin(Date.now() * 0.003) * Math.PI * 0.75

    renderer.renderAsync(scene, camera)
    controls.update()
    window.requestAnimationFrame(animate)
}
animate()
// 全屏渲染 改变窗口大小时重新设置相机
window.addEventListener('resize', () => {
    pos.width = window.innerWidth -20
    pos.height = window.innerHeight -135
    camera.aspect = pos.width / pos.height // 设置相机纵横比
    camera.updateProjectionMatrix() // 更新相机矩阵
    renderer.setSize(pos.width, pos.height) // 设置渲染器尺寸
    renderer.setPixelRatio(window.devicePixelRatio) // 设置像素比
    renderer.outputEncoding = Three.PCFSoftShadowMap; //定义渲染器的输出编码 默认为THREE.LinearEncoding
    renderer.shadowMap.enabled = true;//阴影贴图
})
