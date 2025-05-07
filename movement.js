// Import the jump strength from constants
import { getJumpStrength } from "./constants.js";

// Reset positions to initial values when 'r' key is pressed
export function resetPositions(initialPositions, initialVelocities, initialAccelerations, keys, player, x, ẋ, ẍ) {
    if (keys["r"]) {
        for (let i = 0; i < player.length; i++) {
            player[i].x = initialPositions[i][0];
            player[i].y = initialPositions[i][1];
            player[i].velocity_x = initialVelocities[i][0];
            player[i].velocity_y = initialVelocities[i][1];
            player[i].acceleration_x = initialAccelerations[i][0];
            player[i].acceleration_y = initialAccelerations[i][1];

            x.positions[i][0] = player[i].x;
            x.positions[i][1] = player[i].y;
            ẋ.positions[i][0] = player[i].velocity_x;
            ẋ.positions[i][1] = player[i].velocity_y;
            ẍ.positions[i][0] = player[i].acceleration_x;
            ẍ.positions[i][1] = player[i].acceleration_y;
        }
    }
}

// Initialize impulse values that persist between frames
let impulse_x = 0;
let impulse_y = 0;
let jumpRequested = false;

// Enable movement - only handles horizontal movement now
export function move(keys) {
    // Only reset horizontal impulse here
    impulse_x = 0;
    
    // Apply impulses based on key presses
    if (keys["a"] || keys["arrowleft"]) {
        impulse_x -= 1.2 * 60; // Horizontal impulse for left movement
    }
    if (keys["d"] || keys["arrowright"]) {
        impulse_x += 1.2 * 60; // Horizontal impulse for right movement
    }
}

// Improved jump function - sets a flag rather than directly modifying impulse_y
export function jump(keys) {
    // Only set the jump request flag - actual impulse will be applied in impulseCalc
    if (keys["w"]) {
        jumpRequested = true;
    } else {
        jumpRequested = false;
    }
}

// Completely redesigned impulse calculation function
export function impulseCalc(player, x, ẋ, ẍ, dt, isOnGround) {
    const safeDt = Math.max(dt, 0.001);
    
    // Handle jumping - only apply impulse if jump was requested and player is on ground
    if (jumpRequested && isOnGround) {
        // Use the jump strength value from constants
        const jumpStrength = getJumpStrength();
        impulse_y = -jumpStrength * 60; // Apply jump impulse scaled by jump strength
        jumpRequested = false; // Reset jump request after applying
    } else if (impulse_y !== 0 && !isOnGround) {
        // If there's a non-zero vertical impulse and not on ground (for title screen)
        // Keep it
    } else {
        impulse_y = 0; // Reset vertical impulse when not jumping
    }
    
    for (let i = 0; i < player.length; i++) {
        // Apply horizontal impulse with air control
        if (impulse_x !== 0) {
            // Apply less horizontal force when in air to reduce gliding
            const airMultiplier = isOnGround ? 1.0 : 0.4; // Further reduced air control
            player[i].force_x += impulse_x * airMultiplier / safeDt;
        }
        
        // Apply vertical impulse for jumping
        if (impulse_y !== 0) {
            player[i].force_y += impulse_y / safeDt;
        }
    }
    
    // Reset impulses after application for normal gameplay (not for title screen)
    if (impulse_y < -1000) { // Title screen uses much larger values
        // Don't reset - title screen will handle this
    } else {
        // Reset impulses for normal gameplay
        impulse_x = 0;
        impulse_y = 0;
    }
}