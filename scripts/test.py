#/bin/python3



import re
import matplotlib.pyplot as plt



step = list(range(200, 4001, 200))
time = []
with  open('test.txt') as f:
    for i, line in enumerate(f):

        result = re.search(r'用户平均响应时间: (\d+)', line)
        if result is not None:
            time.append(int(result.group(1)))


plt.title("用户平均响应时间与并发量")
plt.xlabel("并发量")
plt.ylabel("用户平均响应时间ms")
plt.scatter(step, time)
plt.plot(step, time)
plt.show()

