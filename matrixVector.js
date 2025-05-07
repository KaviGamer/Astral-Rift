// Create mass matrix (diagonal matrix from mass values)
export function calcMass(masses) {
    const massMatrix = masses.map((mass, index) => {
        const row = Array(masses.length).fill(0);
        row[index] = mass;
        return row;
    });
    return massMatrix;
}

// Create inverse mass matrix
export function createInvMassMatrix(masses) {
    const massMatrix = masses.map((mass, index) => {
        const row = Array(masses.length).fill(0);
        row[index] = 1/mass;
        return row;
    });
    return massMatrix;
}

// Matrix-vector multiply (2x2 block × 2D vector for each particle)
export function multiplyMassMatrix(massMatrix, vectorArray) {
    return massMatrix.map((m, i) => [
        m[0] * vectorArray[i][0] + m[1] * vectorArray[i][1],
        m[2] * vectorArray[i][0] + m[3] * vectorArray[i][1]
    ]);
}

// Add two vector arrays
export function addVectors(vecA, vecB) {
    return vecA.map((v, i) => [v[0] + vecB[i][0], v[1] + vecB[i][1]]);
}

// Subtract two vector arrays
export function subtractVectors(vecA, vecB) {
    return vecA.map((v, i) => [v[0] - vecB[i][0], v[1] - vecB[i][1]]);
}

// Scale a vector array
export function scaleVector(vec, scalar) {
    return vec.map(v => [v[0] * scalar, v[1] * scalar]);
}