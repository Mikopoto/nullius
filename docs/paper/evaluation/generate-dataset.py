"""Regenerates the exact 40-point dataset used in the paper's case study (Section 8).

Usage: python3 generate-dataset.py > measurements.csv
True model: y = 3.0 * x + 1.5 + N(0, 0.35), x = 0.0, 0.5, ..., 19.5, seed 7.
"""
import random

random.seed(7)
print("x,y")
for i in range(40):
    x = i * 0.5
    y = 3.0 * x + 1.5 + random.gauss(0, 0.35)
    print(f"{x:.2f},{y:.4f}")
