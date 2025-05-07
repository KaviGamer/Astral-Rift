import { getGravity } from './constants.js';

export class PointMass {
    constructor(x, y, mass) {
        this.x = x;                // Current x position
        this.y = y;                // Current y position
        this.x_last = x;           // Previous x position
        this.y_last = y;           // Previous y position
        this.mass = mass;          // Mass of the point
        this.invMass = 1 / mass;   // Inverse mass for fast calculations
        this.velocity_x = 0;       // Velocity in x direction
        this.velocity_y = 0;       // Velocity in y direction
        this.velocity_x_last = 0;  // Previous velocity in x direction
        this.velocity_y_last = 0;  // Previous velocity in y direction
        this.acceleration_x = 0;   // Acceleration in x direction
        this.acceleration_y = getGravity();   // Acceleration in y direction
        this.force_x = 0;          // Force in x direction
        this.force_y = 0;          // Force in y direction
    }

    // Update physics for this point mass
    physics(dt) {
        // Store previous values
        this.velocity_x_last = this.velocity_x;
        this.velocity_y_last = this.velocity_y;
        this.x_last = this.x;
        this.y_last = this.y;

        // Acceleration update: a = F/m
        this.acceleration_x = this.force_x * this.invMass;
        this.acceleration_y = this.force_y * this.invMass;

        // Position update: s = ut + (1/2)at^2
        this.x += ((this.velocity_x * dt) + (0.5 * this.acceleration_x * dt**2));
        this.y += ((this.velocity_y * dt) + (0.5 * this.acceleration_y * dt**2));
        
        // Velocity update: v = u + at
        this.velocity_x = this.velocity_x_last + (this.acceleration_x * dt);
        this.velocity_y = this.velocity_y_last + (this.acceleration_y * dt);
    }
}