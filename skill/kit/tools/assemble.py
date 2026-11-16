L=open('/home/user/sv/v4/main_default.js').read().split('\n')
head=L[:89]; cards=L[281:371]; rest=L[379:]
txt='\n'.join(head).replace('const W = 1080, H = 1920;','const W = 720, H = 1280;')
out=txt+'\n'+open('/home/user/sv/v4/world_part.js').read()+'\n'+'\n'.join(cards)+'\n'+open('/home/user/sv/v4/ws_part.js').read()+'\n'+'\n'.join(rest)
out=out.replace("c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);","if (a.full) { c.mesh.lookAt(cam.position); } else c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);")
out=out.replace("const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);","const m = new THREE.Mesh(geo, mat); if (mat && mat.userData && mat.userData.ndSkip) m.userData.ndSkip = true; m.position.set(x, y, z);")
open('/home/user/sv/v4/web/main.js','w').write(out)
