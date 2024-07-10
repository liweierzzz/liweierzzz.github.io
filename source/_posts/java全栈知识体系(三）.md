---
title: java知识体系(三)
description: 'java全栈知识体系三,这篇文章主要介绍了java中并发编程的知识点'
mathjax: true
cover: https://bu.dusays.com/2024/07/07/668a4bc05991e.jpg
tags:
  - java
  - 并发
  - 多线程
keywords: 知识点 java collection集合 set集合
sticky: 2
swiper_index: 2
categories: java
date: '2024-07-010 9:39:03'
abbrlink: d7ff03d7
aplayer:
---

# Java 全栈知识点问题汇总（三）
{% cell Java 全栈知识体系, https://pdai.tech/,  %}
本文参考链接: [| Java 全栈知识体系 (pdai.tech)](https://pdai.tech/)大家看这个网站可以学习到很多java相关的知识哦!!!

## Java并发

### 1. 并发基础

想知道更详细请了解：
{% link Java 并发- 理论基础,https://pdai.tech/md/java/thread/java-thread-x-theorty.html, https://bu.dusays.com/2024/07/08/668bea85aa4cb.jpg %}

{% link Java 并发- 线程基础,https://pdai.tech/md/java/thread/java-thread-x-thread-basic.html,https://bu.dusays.com/2024/07/07/668a4bc15dc58.jpg%}

#### 1.1 多线程的出现是要解决什么问题的? 本质什么?

CPU、内存、I/O 设备的速度是有极大差异的，为了合理利用 CPU 的高性能，平衡这三者的速度差异，计算机体系结构、操作系统、编译程序都做出了贡献，主要体现为:

- CPU 增加了缓存，以均衡与内存的速度差异；// 导致可见性问题
- 操作系统增加了进程、线程，以分时复用 CPU，进而均衡 CPU 与 I/O 设备的速度差异；// 导致原子性问题
- 编译程序优化指令执行次序，使得缓存能够得到更加合理地利用。// 导致有序性问题

---

#### 1.2 Java是怎么解决并发问题的?

Java 内存模型是个很复杂的规范，具体看[Java 内存模型详解](https://pdai.tech/md/java/jvm/java-jvm-jmm.html)。

**理解的第一个维度：核心知识点**

JMM本质上可以理解为，Java 内存模型规范了 JVM 如何提供按需禁用缓存和编译优化的方法。具体来说，这些方法包括：

- volatile、synchronized 和 final 三个关键字
- Happens-Before 规则

**理解的第二个维度：可见性，有序性，原子性**

- **原子性**

在Java中，对基本数据类型的变量的**读取和赋值操作**是原子性操作，即这些操作是不可被中断的，要么执行，要么不执行。 请分析以下哪些操作是原子性操作：

```java
x = 10;        //语句1: 直接将数值10赋值给x，也就是说线程执行这个语句的会直接将数值10写入到工作内存中
y = x;         //语句2: 包含2个操作，它先要去读取x的值，再将x的值写入工作内存，虽然读取x的值以及 将x的值写入工作内存 这2个操作都是原子性操作，但是合起来就不是原子性操作了。
x++;           //语句3： x++包括3个操作：读取x的值，进行加1操作，写入新的值。
x = x + 1;     //语句4： 同语句3
```

上面4个语句只有语句1的操作具备原子性。

也就是说，只有简单的读取、赋值（而且必须是将数字赋值给某个变量，变量之间的相互赋值不是原子操作）才是原子操作。

>从上面可以看出，Java内存模型只保证了**基本读取和赋值是原子性操作**，如果要实现更大范围操作的原子性，可以通过synchronized和Lock来实现。由于**synchronized和Lock能够保证任一时刻只有一个线程**执行该代码块，那么自然就不存在原子性问题了，从而保证了原子性。

- **可见性**

Java提供了volatile关键字来保证可见性。

当一个共享变量被volatile修饰时，它会保证修改的值会立即被更新到主存，当有其他线程需要读取时，它会去内存中读取新值。

而**普通的共享变量不能保证可见性**，因为普通共享变量被修改之后，什么时候被写入主存是不确定的，当其他线程去读取时，此时内存中可能还是原来的旧值，因此无法保证可见性。

>另外，通过synchronized和Lock也能够保证可见性，synchronized和Lock能保证同一时刻只有一个线程获取锁然后执行同步代码，并且在释放锁之前会将对变量的修改刷新到主存当中。因此可以保证可见性。

- **有序性**

在Java里面，可以通过**volatile关键字来保证一定的“有序性”**。另外可以通过**synchronized和Lock来保证有序性**，很显然，synchronized和Lock保证每个时刻是有一个线程执行同步代码，相当于是让线程顺序执行同步代码，自然就保证了有序性。当然**JMM是通过Happens-Before** 规则来保证有序性的。

------

#### 1.3 线程安全有哪些实现思路?

1. **互斥同步**

synchronized 和 ReentrantLock。

2. **非阻塞同步**

互斥同步最主要的问题就是**线程阻塞和唤醒所带来的性能问题**，因此这种同步也称为阻塞同步。

互斥同步属于一种**悲观的并发策略**，总是认为只要不去做正确的同步措施，那就肯定会出现问题。无论共享数据是否真的会出现竞争，它都要进行加锁(这里讨论的是概念模型，实际上虚拟机会优化掉很大一部分不必要的加锁)、用户态核心态转换、维护锁计数器和检查是否有被阻塞的线程需要唤醒等操作。

- CAS

随着硬件指令集的发展，我们可以使用基于冲突检测的**乐观并发策略:** **先进行操作，如果没有其它线程争用共享数据，那操作就成功了，否则采取补偿措施**(不断地重试，直到成功为止)。这种乐观的并发策略的许多实现都**不需要将线程阻塞**，因此这种同步操作称为非阻塞同步。

------

乐观锁需要**操作和冲突检测**这两个步骤具备**原子性**，这里就不能再使用互斥同步来保证了，**只能靠硬件来完成**。硬件支持的原子性操作最典型的是: **比较并交换(**Compare-and-Swap，CAS)。CAS 指令需要有 3 个操作数，分别是内存地址 V、旧的预期值 A 和新值 B。当执行操作时，只有当 V 的值等于 A，才将 V 的值更新为 B。

------

- AtomicInteger

J.U.C 包里面的整数原子类 AtomicInteger，其中的 compareAndSet() 和 getAndIncrement() 等方法都使用了 Unsafe 类的 CAS 操作。

3. **无同步方案**

要保证线程安全，并不是一定就要进行同步。如果一个方法本来就不涉及共享数据，那它自然就无须任何同步措施去保证正确性。

- 栈封闭

多个线程访问同一个方法的局部变量时，**不会出现线程安全**问题，因为局部变量存储在虚拟机栈中，属于**线程私有**的。

- 线程本地存储(Thread Local Storage)

如果一段代码中所需要的数据必须与其他代码共享，那就看看这些**共享数据的代码是否能保证在同一个线程中执行**。如果能保证，我们就可以把共享数据的可见范围限制在同一个线程之内，这样，无须同步也能保证线程之间不出现数据争用的问题。

------

#### 1.4 如何理解并发和并行的区别?

并发是指一个处理器同时处理多个任务。

[![pkf4eYR.jpg](https://s21.ax1x.com/2024/07/10/pkf4eYR.jpg)](https://imgse.com/i/pkf4eYR)

并行是指多个处理器或者是多核的处理器同时处理多个不同的任务。

[![pkf4mf1.jpg](https://s21.ax1x.com/2024/07/10/pkf4mf1.jpg)](https://imgse.com/i/pkf4mf1)

---

#### 1.5 线程有哪几种状态? 分别说明从一种状态到另一种状态转变有哪些方式?

[![pkf4uSx.png](https://s21.ax1x.com/2024/07/10/pkf4uSx.png)](https://imgse.com/i/pkf4uSx)

- 新建(New)

创建后尚未启动。

- 可运行(Runnable)

可能正在运行，也可能正在等待 CPU 时间片。

包含了操作系统线程状态中的 Running 和 Ready。

- 阻塞(Blocking)

等待获取一个排它锁，如果其线程释放了锁就会结束此状态。

- 无限期等待(Waiting)

等待其它线程显式地唤醒，否则不会被分配 CPU 时间片。

| 进入方法                                   | 退出方法                             |
| ------------------------------------------ | ------------------------------------ |
| 没有设置 Timeout 参数的 Object.wait() 方法 | Object.notify() / Object.notifyAll() |
| 没有设置 Timeout 参数的 Thread.join() 方法 | 被调用的线程执行完毕                 |
| LockSupport.park() 方法                    | -                                    |

- 限期等待(Timed Waiting)

无需等待其它线程显式地唤醒，在一定时间之后会被**系统自动唤醒**。

调用 Thread.sleep() 方法使线程进入限期等待状态时，常常用“使一个线程睡眠”进行描述。

调用 Object.wait() 方法使线程进入限期等待或者无限期等待时，常常用“挂起一个线程”进行描述。

睡眠和挂起是用来**描述行为**，而阻塞和等待用来**描述状态**。

阻塞和等待的区别在于，阻塞**是被动的**，它是在等待获取一个排它锁。而**等待是主动的**，通过调用 Thread.sleep() 和 Object.wait() 等方法进入。

| 进入方法                                 | 退出方法                                        |
| ---------------------------------------- | ----------------------------------------------- |
| Thread.sleep() 方法                      | 时间结束                                        |
| 设置了 Timeout 参数的 Object.wait() 方法 | 时间结束 / Object.notify() / Object.notifyAll() |
| 设置了 Timeout 参数的 Thread.join() 方法 | 时间结束 / 被调用的线程执行完毕                 |
| LockSupport.parkNanos() 方法             | -                                               |
| LockSupport.parkUntil() 方法             | -                                               |

- 死亡(Terminated)

可以是线程结束任务之后自己结束，或者产生了异常而结束。

---

#### 1.6 通常线程有哪几种使用方式?

有三种使用线程的方法:

- 实现 Runnable 接口；
- 实现 Callable 接口；
- 继承 Thread 类。

实现 Runnable 和 Callable 接口的类**只能当做一个可以在线程中运行的任务**，不是真正意义上的线程，因此最后还需要通过 Thread 来调用。可以说任务是通过线程驱动从而执行的。

#### 1.7 基础线程机制有哪些?

- **Executor**

Executor 管理多个异步任务的执行，而无需程序员显式地管理线程的生命周期。这里的异步是指多个任务的执行互不干扰，不需要进行同步操作。

主要有三种 Executor:

1. CachedThreadPool: 一个任务创建一个线程；
2. FixedThreadPool: 所有任务只能使用固定大小的线程；
3. SingleThreadExecutor: 相当于大小为 1 的 FixedThreadPool。

- **Daemon**

守护线程是程序运行时在**后台提供服务的线程**，不属于程序中不可或缺的部分。

当所有非守护线程结束时，程序也就终止，同时会杀死所有守护线程。

main() 属于非守护线程。使用 setDaemon() 方法将一个线程设置为守护线程。

- **sleep()**

Thread.sleep(millisec) 方法会休眠当前正在执行的线程，millisec 单位为毫秒。

sleep() 可能会抛出 InterruptedException，因为异常不能跨线程传播回 main() 中，因此必须在本地进行处理。线程中抛出的其它异常也同样需要在本地进行处理。

- **yield()**

对静态方法 Thread.yield() 的调用声明了当前线程已经完成了生命周期中最重要的部分，可以切换给其它线程来执行。该方法只是对线程调度器的一个建议，而且也只是建议具有相同优先级的其它线程可以运行。

------

#### 1.8 线程的中断方式有哪些?

一个线程执行完毕之后会自动结束，如果在运行过程中发生异常也会提前结束。

- **InterruptedException**

通过调用一个线程的 interrupt() 来中断该线程，如果该线程处于阻塞、限期等待或者无限期等待状态，那么就会抛出 InterruptedException，从而提前结束该线程。但是不能中断 I/O 阻塞和 synchronized 锁阻塞。

对于以下代码，在 main() 中启动一个线程之后再中断它，由于线程中调用了 Thread.sleep() 方法，因此会抛出一个 InterruptedException，从而提前结束线程，不执行之后的语句。

```java
public class InterruptExample {

    private static class MyThread1 extends Thread {
        @Override
        public void run() {
            try {
                Thread.sleep(2000);
                System.out.println("Thread run");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread thread1 = new MyThread1();
        thread1.start();
        thread1.interrupt();
        System.out.println("Main run");
    }
}

```

```java
Main run
java.lang.InterruptedException: sleep interrupted
    at java.lang.Thread.sleep(Native Method)
    at InterruptExample.lambda$main$0(InterruptExample.java:5)
    at InterruptExample$$Lambda$1/713338599.run(Unknown Source)
    at java.lang.Thread.run(Thread.java:745)

```

- **interrupted()**

如果一个线程的 run() 方法执行一个无限循环，并且没有执行 sleep() 等会抛出 InterruptedException 的操作，那么调用线程的 interrupt() 方法就无法使线程提前结束。

但是调用 interrupt() 方法会**设置线程的中断标记**，此时调用 interrupted() 方法会返回 true。因此可以在循环体中使用 interrupted() 方法来判断线程是否处于中断状态，从而提前结束线程。

- **Executor 的中断操作**

调用 Executor 的 shutdown() 方法会等待线程都执行完毕之后再关闭，但是如果调用的是 shutdownNow() 方法，则相当于调用每个线程的 interrupt() 方法。



#### 1.9 线程的互斥同步方式有哪些? 如何比较和选择?

Java 提供了两种锁机制来控制多个线程对共享资源的互斥访问，第一个是 JVM 实现的 **synchronized**，而另一个是 JDK 实现的 **ReentrantLock**。

- **锁的实现**

synchronized 是 JVM 实现的，而 ReentrantLock 是 JDK 实现的。

-  **性能**

新版本 Java 对 synchronized 进行了很多优化，例如自旋锁等，synchronized 与 ReentrantLock 大致相同。

- **等待可中断**

当持有锁的线程长期不释放锁的时候，正在等待的线程可以选择放弃等待，改为处理其他事情。

ReentrantLock 可中断，而 synchronized 不行。

- **公平锁**

公平锁是指多个线程在等待同一个锁时，必须按照申请锁的时间顺序来依次获得锁。

synchronized 中的锁是非公平的，ReentrantLock 默认情况下也是非公平的，但是也可以是公平的。

-  **锁绑定多个条件**

一个 ReentrantLock 可以同时绑定多个 Condition 对象。

---

#### 1.9 线程之间有哪些协作方式?

当多个线程可以一起工作去解决某个问题时，如果某些部分必须在其它部分之前完成，那么就需要对线程进行协调。

- **join()**

在线程中调用另一个线程的 join() 方法，会将当前线程挂起，而不是忙等待，直到目标线程结束。

对于以下代码，虽然 b 线程先启动，但是因为在 b 线程中调用了 a 线程的 join() 方法，b 线程会等待 a 线程结束才继续执行，因此最后能够保证 a 线程的输出先于 b 线程的输出。

```java
public class JoinExample {

    private class A extends Thread {
        @Override
        public void run() {
            System.out.println("A");
        }
    }

    private class B extends Thread {

        private A a;

        B(A a) {
            this.a = a;
        }

        @Override
        public void run() {
            try {
                a.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("B");
        }
    }

    public void test() {
        A a = new A();
        B b = new B(a);
        b.start();
        a.start();
    }
}

```

```java
public static void main(String[] args) {
    JoinExample example = new JoinExample();
    example.test();
}

```

```text
A
B
```

- **wait() notify() notifyAll()**

调用 wait() 使得线程等待某个条件满足，线程在等待时会被挂起，当其他线程的**运行使得这个条件满足时**，其它线程会调用 notify() 或者 notifyAll() 来唤醒挂起的线程。

它们都属于 Object 的一部分，而不属于 Thread。

只能用在同步方法或者同步控制块中使用，否则会在运行时抛出 IllegalMonitorStateExeception。

使用 wait() 挂起期间，线程会释放锁。这是因为，如果没有释放锁，那么其它线程就无法进入对象的同步方法或者同步控制块中，那么就无法执行 notify() 或者 notifyAll() 来唤醒挂起的线程，造成死锁。

#### 1.10 **wait() 和 sleep() 的区别**

- wait() 是 Object 的方法，而 sleep() 是 Thread 的静态方法；

- wait() 会释放锁，sleep() 不会。
- **await() signal() signalAll()**

java.util.concurrent 类库中提供了 Condition 类来实现线程之间的协调，可以在 Condition 上调用 await() 方法使线程等待，其它线程调用 signal() 或 signalAll() 方法唤醒等待的线程。相比于 wait() 这种等待方式，await() 可以指定等待的条件，因此更加灵活。

------
{% progress 100 blue 文章结束！  %}
