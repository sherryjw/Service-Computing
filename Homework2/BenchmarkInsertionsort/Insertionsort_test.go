package sort

import "testing"

func Insertionsort(array []int) []int{
    var pre int
    /*len() helps to calculate length of an array*/
	for i := 1; i < len(array); i++ {
		pre = i - 1
		current := array[i]
		for ; pre >= 0 && array[pre] > current; {
			array[pre + 1] = array[pre]
			pre--
		}
		array[pre + 1] = current
	}

	return array
}

func BenchmarkInsertionsort() {
    values := []int {8, 6, 3, 7, 5, 4, 9, 1, 10, 2}
    for i := 0; i < b.N; i++ {
        Insertionsort(values[:])
    }
}
