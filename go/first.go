package main

import (
	"fmt"
)

type Person struct {
	name string
	age  int
}

func modifyArr(arr *[5]int) {
	arr[1] = 20
}

func main() {
	fmt.Println("Hello World!")

	var a = 1
	b := 2

	fmt.Println(a, b)

	if a > 0 {
		fmt.Println("using if")
	} else {
		fmt.Println("using else")
	}

	for i := 0; i < 10; i++ {
		fmt.Println(i, " ")
	}

	var arr1 = [5]int{1, 2, 3}
	arr2 := [3][3]int{{1, 1, 1}, {2, 2, 2}}
	fmt.Println(arr1, arr2)

	modifyArr(&arr1)
	fmt.Println(arr1)

	var s1 = []int{1, 2, 3, 4, 5}
	s2 := []int{0, 1, 2, 3}
	s3 := make([]int, 3, 5)

	// 左闭右开地切
	fmt.Println(s1[1:3])
	fmt.Println(s2[:])
	fmt.Println(s3[:5])
	// 切片的追加
	s3 = append(s3, 1)
	fmt.Println(len(s3))
	fmt.Println(cap(s3))

	p := Person{name: "Ethan", age: 20}
	fmt.Println(p.name, p.age)
}
