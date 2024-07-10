---
title: java知识体系(二)
description: 'java全栈知识体系二,这篇文章主要介绍了java中集合框架的知识点'
mathjax: true
cover: https://bu.dusays.com/2024/07/09/668c90d74d51c.webp
tags:
  - java
  - 集合框架
keywords: 知识点 java collection集合 set集合
sticky: 2
swiper_index: 2
categories: java
abbrlink: a90c23fc
date: 2024-07-09 9:43:03
aplayer:
---

# Java 全栈知识点问题汇总（二）
{% cell Java 全栈知识体系, https://pdai.tech/,  %}
本文参考链接: [| Java 全栈知识体系 (pdai.tech)](https://pdai.tech/)大家看这个网站可以学习到很多java相关的知识哦!!!

# 1. Collection

## 1.1 集合有哪些类？

- Set
  - TreeSet 基于红黑树实现，支持有序性操作，例如根据一个范围查找元素的操作。但是查找效率不如 HashSet，HashSet 查找的时间复杂度为 O(1)，TreeSet 则为 O(logN)。
  - HashSet 基于哈希表实现，支持**快速查找**，但不支持有序性操作。并且失去了元素的插入顺序信息，也就是说使用 Iterator 遍历 HashSet 得到的结果是**不确定**的。
  - LinkedHashSet 具有 HashSet 的查找效率，且内部使用双向链表维护元素的插入顺序。
- List
  - ArrayList 基于动态数组实现，支持随机访问。
  - Vector 和 ArrayList 类似，但它是**线程安全**的。
  - LinkedList 基于**双向链表实现**，只能**顺序访问**，但是可以快速地在链表中间**插入和删除元素**。不仅如此，LinkedList 还可以用作栈、队列和双向队列。
- Queue
  - LinkedList 可以用它来实现双向队列。
  - PriorityQueue 基于堆结构实现，可以用它来实现优先队列。

## 1.2 ArrayList的底层？

*ArrayList*实现了*List*接口，是顺序容器，即元素存放的数据与放进去的顺序相同，允许放入`null`元素，底层通过**数组实现**。

除该类未实现同步外，其余跟*Vector*大致相同。

每个*ArrayList*都有一个容量(capacity)，表示底层数组的实际大小，容器内存储元素的个数不能多于当前容量。当向容器中添加元素时，如果容量不足，容器会自动增大底层数组的大小。

前面已经提过，Java泛型只是编译器提供的语法糖，所以这里的数组**是一个Object数组**，以便能够容纳任何类型的对象。

[![pkfVE5Q.png](https://s21.ax1x.com/2024/07/09/pkfVE5Q.png)](https://imgse.com/i/pkfVE5Q)

## 1.3 ArrayList自动扩容？

每当向数组中添加元素时，都要去**检查**添加后元素的个数是否会超出当前数组的长度，如果超出，数组将会进行扩容，以满足添加数据的需求。

数组扩容通过**ensureCapacity(int minCapacity)方法**来实现。在实际添加大量元素前，我也可以使用ensureCapacity来手动增加ArrayList实例的容量，以减少递增式再分配的数量。

数组进行扩容时，会将老数组中的元素重新拷贝一份到新的数组中，每次数组容量的增长大约是其原容量的1.5倍。

这种操作的代价是很高的，因此在实际使用时，我们应该尽量避免数组容量的扩张。

当我们可预知要保存的元素的多少时，要在构造ArrayList实例时，就指定其容量，以避免数组扩容的发生。或者根据实际需求，通过调用ensureCapacity方法来手动增加ArrayList实例的容量。

[![pkfVe8s.md.png](https://s21.ax1x.com/2024/07/09/pkfVe8s.md.png)](https://imgse.com/i/pkfVe8s)

## 1.4 ArrayList的Fail-Fast机制？

ArrayList也采用了快速失败的机制，通过**记录modCount**参数来实现。在面对并发的修改时，迭代器很快就会完全失败，而不是冒着在将来某个不确定时间发生任意不确定行为的风险。



# 2 Map

## 2.1 Map有哪些类？

- `TreeMap` 基于红黑树实现。

- `HashMap` 1.7基于哈希表实现，1.8基于数组+链表+红黑树。

- `HashTable` 和 HashMap 类似，但它是线程安全的，这意味着同一时刻多个线程可以同时写入 HashTable 并且不会导致数据不一致。它是遗留类，**不应该去使用它**。现在可以使用 ConcurrentHashMap 来支持线程安全，并且 ConcurrentHashMap 的效率会更高(1.7 ConcurrentHashMap 引入了分段锁, 1.8 引入了红黑树)。

  

## 2.1 JDK7 HashMap如何实现？

哈希表有两种实现方式，一种开放地址方式(Open addressing)，另一种是冲突链表方式(Separate chaining with linked lists)。**Java7 \*HashMap\*采用的是冲突链表方式**。

[![pkfVm2n.png](https://s21.ax1x.com/2024/07/09/pkfVm2n.png)](https://imgse.com/i/pkfVm2n)

从上图容易看出，如果选择合适的哈希函数，`put()`和`get()`方法可以在常数时间内完成。但在对*HashMap*进行迭代时，需要遍历整个table以及后面跟的冲突链表。因此对于迭代比较频繁的场景，不宜将*HashMap*的初始大小设的过大。

有两个参数可以影响*HashMap*的性能: 初始容量(inital capacity)和负载系数(load factor)。初始容量指定了初始`table`的大小，负载系数用来指定自动扩容的临界值。当`entry`的数量超过`capacity*load_factor`时，容器将自动扩容并重新哈希。对于插入元素较多的场景，将初始容量设大可以减少重新哈希的次数。



## 2.2 JDK8 HashMap如何实现？

根据 Java7 HashMap 的介绍，我们知道，查找的时候，根据 hash 值我们能够快速定位到数组的具体下标，但是之后的话，需要顺着链表一个个比较下去才能找到我们需要的，时间复杂度取决于链表的长度，为 O(n)。

为了降低这部分的开销，在 Java8 中，当链表中的元素达到了 8 个时，会将链表转换为红黑树，在这些位置进行查找的时候可以降低时间复杂度为 O(logN)。

![img](https://pdai.tech/images/java/java-collection-hashmap8.png)





## 2.3 HashSet是如何实现的？

*HashSet*是对*HashMap*的简单包装，对*HashSet*的函数调用都会转换成合适的*HashMap*方法。

```java
//HashSet是对HashMap的简单包装
public class HashSet<E>
{
	......
	private transient HashMap<E,Object> map;//HashSet里面有一个HashMap
    // Dummy value to associate with an Object in the backing Map
    private static final Object PRESENT = new Object();
    public HashSet() {
        map = new HashMap<>();
    }
    ......
    public boolean add(E e) {//简单的方法转换
        return map.put(e, PRESENT)==null;
    }
    ......
}
```



## 2.4 什么是WeakHashMap?

我们都知道Java中内存是通过GC自动管理的，GC会在程序运行过程中自动判断哪些对象是可以被回收的，并在合适的时机进行内存释放。GC判断某个对象是否可被回收的依据是，**是否有有效的引用指向该对象**。如果没有有效引用指向该对象(基本意味着不存在访问该对象的方式)，那么该对象就是可回收的。这里的**有效引用** 并不包括**弱引用**。也就是说，**虽然弱引用可以用来访问对象，但进行垃圾回收时弱引用并不会被考虑在内，仅有弱引用指向的对象仍然会被GC回收**。

WeakHashMap 内部是通过弱引用来管理entry的，弱引用的特性对应到 WeakHashMap 上意味着什么呢？

*WeakHashMap* 里的`entry`可能会被GC自动删除，即使程序员没有调用`remove()`或者`clear()`方法。

**WeakHashMap** 的这个特点特别适用于需要缓存的场景**。在缓存场景下，由于内存是有限的，不能缓存所有对象；对象缓存命中可以提高系统效率，但缓存MISS也不会造成错误，因为可以通过计算重新得到。



{% progress 100 blue 文章结束！  %}

想知道更详细请了解：
{% link Collection 类关系图,https://pdai.tech/md/java/collection/java-collection-all.html, https://bu.dusays.com/2023/09/25/6511980d58e3b.webp %}

