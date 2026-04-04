import * as THREE from 'three'
import { IPlayerState } from './GameState'

const otherPlayers: Map<number, THREE.Mesh> = new Map()

export function clearOtherPlayers() {
    otherPlayers.clear()
}

export function addOtherPlayer(state: IPlayerState, scene: THREE.Scene) {
    const bigCube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0xffaa00 })
    )
    bigCube.position.set(state.x, state.y, state.z)
    otherPlayers.set(state.user_id, bigCube)
    scene.add(bigCube);
    console.log("Added player", state.user_id, "at position", bigCube.position);
    return bigCube;
}

export function updateOtherPlayer(state: IPlayerState, scene: THREE.Scene) {

    let playerMesh = otherPlayers.get(state.user_id)
    console.log("Updating player", playerMesh);
    if (!playerMesh) {
        playerMesh = addOtherPlayer(state, scene);
    } else if (playerMesh.parent !== scene) {
        scene.add(playerMesh);
    }

    playerMesh.position.set(state.x, state.y, state.z);
}

