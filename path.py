import numpy as np
import matplotlib.pyplot as plt

# Define y range
y = np.linspace(0, 100, 500)

# Define T(y), v(y)
T = 500 - 0.1 * y
v = 10 + 0.05 * y
C = 45

# Compute x'(y)
x_prime = np.sqrt((T / (C * v))**2 - 1)

# Integrate x'(y) to get x(y)
x = np.cumsum(x_prime) * (y[1] - y[0])  # Numerical integration (Euler method)

# Plot
plt.plot(x, y)
plt.xlabel("Horizontal Position (x)")
plt.ylabel("Altitude (y)")
plt.title("Optimal Launch Trajectory")
plt.grid(True)
plt.show()
