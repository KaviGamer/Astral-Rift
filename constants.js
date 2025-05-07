// Declare variables that will be modified by input events
let stiffnessValue = 1; // Default stiffness value
let gravityValue = 9.807 * 60; // Default gravity value
let stribFricConst = 0.05; // Default Stribeck dynamic friction constant value
let staticFricConst = 0.55; // Default static friction constant value
let kinFricConst = 0.5; // Default kinetic friction constant value
let jumpStrengthValue = 15; // Default jump strength value

// Constants that won't change
const damping = 2.5;
const pointMassRadius = 10; // Radius of point masses

// Export getters to access the current values
export function getStiffness() {
    return stiffnessValue;
}

export function getGravity() {
    return gravityValue;
}

export function getFriction() {
    return [stribFricConst, staticFricConst, kinFricConst];
}

export function getDamping() {
    return damping;
}

export function getPointMassRadius() {
    return pointMassRadius;
}

export function getJumpStrength() {
    return jumpStrengthValue;
}

// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const stiffness_input = document.getElementById("stiffness_input");
    const gravity_input = document.getElementById("gravity_input");
    const strib_input = document.getElementById("strib_fric_input");
    const static_input = document.getElementById("stat_fric_input");
    const kinetic_input = document.getElementById("kin_fric_input");
    const jump_strength_input = document.getElementById("jump_strength_input");

    if (stiffness_input) {
        stiffness_input.addEventListener("input", (event) => {
            let value = parseFloat(event.target.value);
            if (!isNaN(value)) {
                stiffnessValue = value * 60;
            }
        });
    }

    if (gravity_input) {
        gravity_input.addEventListener("input", (event) => {
            let value = parseFloat(event.target.value);
            if (!isNaN(value)) {
                gravityValue = value * 60;
            }
        });
    }

    if (strib_input) {
        strib_input.addEventListener("input", (event) => {
            let value = parseFloat(event.target.value);
            if (!isNaN(value)) {
                stribFricConst = value;
            }
        });
    }

    if (static_input) {
        static_input.addEventListener("input", (event) => {
            let value = parseFloat(event.target.value);
            if (!isNaN(value)) {
                staticFricConst = value;
            }
        });
    }

    if (kinetic_input) {
        kinetic_input.addEventListener("input", (event) => {
            let value = parseFloat(event.target.value);
            if (!isNaN(value)) {
                kinFricConst = value;
            }
        });
    }
    
    if (jump_strength_input) {
        jump_strength_input.addEventListener("input", (event) => {
            let value = parseFloat(event.target.value);
            if (!isNaN(value)) {
                jumpStrengthValue = value;
            }
        });
    }
});