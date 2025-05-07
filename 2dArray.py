#Unsorted marks array
Marks = [
  [78, 92, 65],
  [84, 73, 91],
  [59, 67, 88],
  [94, 81, 72],
  [65, 56, 70],
  [88, 90, 77],
  [43, 60, 55],
  [91, 82, 64],
  [76, 74, 85],
  [69, 58, 49],
  [99, 93, 88],
  [55, 61, 73],
  [80, 66, 90],
  [72, 77, 62],
  [64, 85, 91],
  [87, 69, 59],
  [53, 70, 68],
  [95, 89, 84],
  [61, 57, 63],
  [90, 95, 97],
  [45, 50, 48],
  [68, 71, 67],
  [79, 86, 74],
  [62, 66, 58],
  [93, 88, 96],
  [74, 79, 81],
  [58, 54, 60],
  [85, 92, 89],
  [77, 64, 83],
  [66, 62, 75]
]

total = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
name = [
  "Aarav", "Vivaan", "Diya", "Ishaan", "Saanvi", "Arjun", "Mira", "Kabir", "Anaya", "Rohan",
  "Myra", "Aditya", "Avni", "Reyansh", "Kiara", "Atharv", "Tara", "Kian", "Nisha", "Dev",
  "Zara", "Aryan", "Meera", "Yash", "Aanya", "Neil", "Inaaya", "Rudra", "Aisha", "Veer"
]

temp3 = [0, 0, 0]

for r in range(30):
    sum = 0
    for c in range(3):
        sum = sum + Marks[r][c]
    total[r] = sum  # Use row index directly to update total

for x in range(30):
    for y in range(29):
        if total[y] > total[y+1]:
            temp1 = total[y]
            temp2 = name[y]
            for f in range(3):
                temp3[f] = Marks[y][f]
                Marks[y][f] = Marks[y+1][f]
                Marks[y+1][f] = temp3[f]
            total[y] = total[y+1]
            total[y+1] = temp1
            name[y] = name[y+1]
            name[y+1] = temp2

print("\n MARKS: ", Marks)
print("\n TOTAL: ", total)
print("\n NAMES: ", name)