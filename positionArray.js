export class PositionArray {
    constructor(...positions) {
        // Store positions as a vector of [x, y] pairs
        this.positions = positions.map(([x, y]) => [x, y]);
    }

    get(index) {
        return this.positions[index];
    }

    set(index, x, y) {
        this.positions[index] = [x, y];
    }

    length() {
        return this.positions.length;
    }

    toArray() {
        // Create a deep copy to avoid reference issues
        return JSON.parse(JSON.stringify(this.positions));
    }

    add(other) {
        // Return new PositionArray with the sum of positions
        const newPositions = this.positions.map((pos, i) => {
            return [
                pos[0] + other.positions[i][0],
                pos[1] + other.positions[i][1]
            ];
        });
        return new PositionArray(...newPositions);
    }

    subtract(other) {
        // Return new PositionArray with the difference of positions
        const newPositions = this.positions.map((pos, i) => {
            return [
                pos[0] - other.positions[i][0],
                pos[1] - other.positions[i][1]
            ];
        });
        return new PositionArray(...newPositions);
    }

    multiply(scalar) {
        // Return new PositionArray with scaled positions
        const newPositions = this.positions.map(pos => {
            return [
                pos[0] * scalar,
                pos[1] * scalar
            ];
        });
        return new PositionArray(...newPositions);
    }

    divide(scalar) {
        if (scalar === 0) {
            console.error("Cannot divide by zero");
            return this;
        }
        
        // Return new PositionArray with divided positions
        const newPositions = this.positions.map(pos => {
            return [
                pos[0] / scalar,
                pos[1] / scalar
            ];
        });
        return new PositionArray(...newPositions);
    }
}